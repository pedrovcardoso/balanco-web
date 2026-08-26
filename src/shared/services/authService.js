(function () {
  "use strict";

  if (window.BC_AUTH) return;

  const STORAGE_KEY = "bc_mvp_user_inline_sql_v2";
  let currentUser = null;
  let readyResolve;
  let readySettled = false;
  const readyPromise = new Promise(function (resolve) { readyResolve = resolve; });

  function api() {
    if (!window.BC_API || typeof window.BC_API.requestSql !== "function") {
      throw new Error("BC_API deve ser carregado antes de authService.js.");
    }
    return window.BC_API;
  }
  function onlyDigits(value) { return String(value || "").replace(/\D/g, ""); }
  function normalizeName(value) { return String(value || "").replace(/\s+/g, " ").trim().slice(0, 160); }
  function maskCpf(value) {
    return onlyDigits(value).slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  function sqlString(value, maxLength) {
    maxLength = maxLength || 4000;
    if (value === null || value === undefined) return "NULL";
    return "'" + String(value).slice(0, maxLength).replace(/'/g, "''") + "'";
  }
  function sqlGuid(value) {
    const text = String(value || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
      throw new Error("GUID inválido.");
    }
    return "'" + text + "'";
  }
  function first(result) { return result && result.rows ? result.rows[0] || null : null; }
  function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail: detail })); }
  function resolveReady(user) {
    if (!readySettled) { readySettled = true; readyResolve(user); }
    emit("bc:user-ready", user);
  }
  function saveLocalUser(user) {
    currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  function getLocalUser() {
    try {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return user && user.publicUserId ? user : null;
    } catch (_) { return null; }
  }
  function clearLocalUser() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  async function createOrGetUser(cpf, name) {
    const sql = `
DECLARE @cpf VARCHAR(11) = ${sqlString(onlyDigits(cpf), 11)};
DECLARE @name VARCHAR(160) = ${sqlString(normalizeName(name), 160)};
DECLARE @cpf_hash CHAR(64) = CONVERT(CHAR(64), HASHBYTES('SHA2_256', @cpf), 2);
DECLARE @cpf_masked VARCHAR(20) = CONCAT('***.', SUBSTRING(@cpf,4,3), '.', SUBSTRING(@cpf,7,3), '-**');
DECLARE @user_id UNIQUEIDENTIFIER;
DECLARE @public_user_id UNIQUEIDENTIFIER;
SELECT TOP 1 @user_id=user_id,@public_user_id=public_user_id FROM bc.app_user WHERE external_provider='mvp-cpf' AND external_subject=@cpf_hash AND is_active=1;
IF @user_id IS NULL BEGIN
 SET @user_id=NEWID(); SET @public_user_id=NEWID();
 INSERT INTO bc.app_user (user_id,public_user_id,external_provider,external_subject,display_name,email,nickname,accepted_lgpd_at,created_at,updated_at,is_active)
 VALUES (@user_id,@public_user_id,'mvp-cpf',@cpf_hash,@name,NULL,@cpf_masked,SYSUTCDATETIME(),SYSUTCDATETIME(),SYSUTCDATETIME(),1);
END ELSE BEGIN
 UPDATE bc.app_user SET display_name=@name,nickname=COALESCE(nickname,@cpf_masked),updated_at=SYSUTCDATETIME() WHERE user_id=@user_id;
END;
IF NOT EXISTS (SELECT 1 FROM bc.user_main_trail_progress WHERE user_id=@user_id)
 INSERT INTO bc.user_main_trail_progress (user_id,main_trail_id,status,progress_percent,completed_at,updated_at)
 SELECT @user_id,main_trail_id,CASE WHEN order_index=1 THEN 'available' ELSE 'locked' END,0,NULL,SYSUTCDATETIME() FROM bc.main_trail WHERE is_active=1;
IF NOT EXISTS (SELECT 1 FROM bc.user_phase_progress WHERE user_id=@user_id)
 INSERT INTO bc.user_phase_progress (user_id,game_phase_id,status,best_score,best_stars,attempts_count,first_completed_at,last_played_at,updated_at)
 SELECT @user_id,game_phase_id,CASE WHEN order_index=1 THEN 'available' ELSE 'locked' END,0,0,0,NULL,NULL,SYSUTCDATETIME() FROM bc.game_phase WHERE is_active=1;
SELECT TOP 1 CAST(user_id AS VARCHAR(36)) AS userId,CAST(public_user_id AS VARCHAR(36)) AS publicUserId,display_name AS displayName,nickname AS cpfMasked,created_at AS createdAt FROM bc.app_user WHERE user_id=@user_id;`;
    const user = first(await api().requestSql(sql));
    if (!user || !user.publicUserId) throw new Error("Usuário não retornado pelo banco.");
    return user;
  }

  async function getUserByPublicId(publicUserId) {
    return first(await api().requestSql(`SELECT TOP 1 CAST(user_id AS VARCHAR(36)) AS userId,CAST(public_user_id AS VARCHAR(36)) AS publicUserId,display_name AS displayName,nickname AS cpfMasked,created_at AS createdAt FROM bc.app_user WHERE public_user_id=${sqlGuid(publicUserId)} AND is_active=1;`));
  }

  async function deleteUserData(publicUserId) {
    const sql = `DECLARE @user_id UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id=${sqlGuid(publicUserId)} AND is_active=1);
IF @user_id IS NOT NULL BEGIN
 DELETE FROM bc.user_achievement WHERE user_id=@user_id; DELETE FROM bc.section_medal_progress WHERE user_id=@user_id;
 DELETE FROM bc.game_attempt WHERE user_id=@user_id; DELETE FROM bc.user_phase_progress WHERE user_id=@user_id;
 DELETE FROM bc.user_content_progress WHERE user_id=@user_id; DELETE FROM bc.user_main_trail_progress WHERE user_id=@user_id;
 DELETE FROM bc.certificate_issue WHERE user_id=@user_id; DELETE FROM bc.user_session WHERE user_id=@user_id;
 DELETE FROM bc.app_user WHERE user_id=@user_id;
END; SELECT 1 AS ok;`;
    const result = await api().requestSql(sql);
    clearLocalUser(); emit("bc:user-deleted", { publicUserId: publicUserId });
    return first(result) || { ok: 1 };
  }

  function appendToHeadSafe(node) {
    const target = document.head || document.body || document.documentElement;
    if (target) target.appendChild(node);
  }
function injectStyle() {
    if (document.getElementById("bc-api-modal-css")) return;
    const style = document.createElement("style");
    style.id = "bc-api-modal-css";
    style.textContent = `
      .bc-login-backdrop{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:radial-gradient(circle at 50% 20%,rgba(255,245,184,.34),rgba(35,51,36,.72));backdrop-filter:blur(10px)}
      .bc-login-card{position:relative;width:min(100%,440px);overflow:hidden;border-radius:30px;border:4px solid #8b6914;background:linear-gradient(135deg,#fffaf0 0%,#fdf6e3 48%,#ffe8aa 100%);box-shadow:0 28px 90px rgba(33,25,14,.38),inset 0 1px 0 rgba(255,255,255,.9);font-family:Nunito,system-ui,sans-serif;color:#233324}.bc-login-ribbon{height:12px;background:repeating-linear-gradient(90deg,#c0272d 0 22px,#8f1e23 22px 44px,#f5a800 44px 66px)}
      .bc-login-card:before{content:"";position:absolute;inset:9px;border:2px dashed rgba(139,94,60,.24);border-radius:22px;pointer-events:none}.bc-login-content{position:relative;padding:24px 22px 22px}.bc-login-icon{width:88px;height:88px;margin:0 auto 14px;display:grid;place-items:center;border-radius:24px;border:4px solid rgba(255,255,255,.86);background:linear-gradient(135deg,#2d6a4f,#10b981);color:#fff;font-size:2.35rem;box-shadow:0 14px 28px rgba(45,106,79,.28),inset 0 4px 0 rgba(255,255,255,.28)}
      .bc-login-title{margin:0;text-align:center;font-family:Fredoka,Nunito,system-ui,sans-serif;font-size:1.75rem;line-height:1.05;color:#5d2b0a;font-weight:900}.bc-login-subtitle{margin:.55rem auto 1.05rem;max-width:330px;text-align:center;color:#6b3a1f;font-weight:800;font-size:.92rem;line-height:1.32}.bc-login-badge{display:inline-flex;align-items:center;gap:.35rem;margin:0 auto 12px;padding:.36rem .7rem;border-radius:999px;background:#fff7d6;border:2px solid rgba(245,168,0,.7);color:#8f1e23;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.bc-login-badge-wrap{text-align:center}
      .bc-login-field{display:flex;flex-direction:column;gap:6px;margin-top:12px}.bc-login-field label{color:#8b5e3c;font-size:.74rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.bc-login-field input{width:100%;border:2px solid rgba(139,94,60,.28);border-radius:18px;background:rgba(255,255,255,.94);padding:13px 14px;color:#233324;font-size:1rem;font-weight:900;outline:none}.bc-login-error{min-height:20px;margin-top:10px;color:#b91c1c;font-weight:900;font-size:.82rem}.bc-login-btn{width:100%;border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#c0272d,#8f1e23);color:#fff;font-family:Fredoka,Nunito,sans-serif;font-weight:900;font-size:1.05rem;cursor:pointer;box-shadow:0 14px 26px rgba(192,39,45,.24)}.bc-login-btn:disabled{opacity:.65;cursor:wait}.bc-login-note{margin:11px 0 0;text-align:center;color:#7a4b13;font-size:.72rem;font-weight:800}
      .bc-login-btn-secondary{width:100%;border:2px solid #8f1e23;border-radius:999px;padding:11px 18px;background:transparent;color:#8f1e23;font-family:Fredoka,Nunito,sans-serif;font-weight:900;font-size:1.05rem;cursor:pointer;margin-top:10px;box-shadow:none;transition:all .2s;text-align:center}.bc-login-btn-secondary:hover{background:rgba(143,30,35,.08)}.bc-login-btn-secondary:disabled{opacity:.65;cursor:wait}`;
    appendToHeadSafe(style);
  }

  

  function openLogin() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", openLogin, { once: true });
      return;
    }
    injectStyle();
    document.getElementById("bcUserModalBackdrop")?.remove();

    const modal = document.createElement("div");
    modal.id = "bcUserModalBackdrop";
    modal.className = "bc-login-backdrop";
    modal.innerHTML = `<form class="bc-login-card" id="bcUserModalForm" novalidate><div class="bc-login-ribbon"></div><div class="bc-login-content"><div class="bc-login-icon"><iconify-icon icon="fa6-solid:map-location-dot" aria-hidden="true"></iconify-icon></div><div class="bc-login-badge-wrap"><span class="bc-login-badge"><iconify-icon icon="fa6-solid:star" aria-hidden="true"></iconify-icon> Trilha do Tesouro</span></div><h2 class="bc-login-title">Identificação do participante</h2><p class="bc-login-subtitle">Informe seus dados para salvar progresso, estrelas, conquistas e certificado.</p><div class="bc-login-field"><label for="bcUserCpf">CPF</label><input id="bcUserCpf" name="cpf" inputmode="numeric" maxlength="14" autocomplete="off" required></div><div class="bc-login-field"><label for="bcUserNome">Nome</label><input id="bcUserNome" name="nome" maxlength="160" autocomplete="name" required></div><div class="bc-login-error" id="bcUserError" aria-live="polite"></div><button class="bc-login-btn" id="bcUserSubmit" type="submit">Continuar aventura</button><button class="bc-login-btn-secondary" id="bcUserGuest" type="button">Continuar sem login</button><p class="bc-login-note">MVP sem login gov.br.</p></div></form>`;
    document.body.appendChild(modal);

    const form = modal.querySelector("#bcUserModalForm");
    const cpfInput = modal.querySelector("#bcUserCpf");
    const nomeInput = modal.querySelector("#bcUserNome");
    const errorEl = modal.querySelector("#bcUserError");
    const submit = modal.querySelector("#bcUserSubmit");
    const guest = modal.querySelector("#bcUserGuest");

    cpfInput.addEventListener("input", function () {
      cpfInput.value = maskCpf(cpfInput.value);
    });

    async function authenticate(cpf, nome, loadingLabel) {
      errorEl.textContent = "";
      submit.disabled = true;
      guest.disabled = true;
      const submitText = submit.textContent;
      submit.textContent = loadingLabel || "Salvando...";
      try {
        const user = await createOrGetUser(cpf, nome);
        saveLocalUser(user);
        modal.remove();
        resolveReady(user);
        return user;
      } catch (error) {
        console.error("[BC_AUTH] Falha no login:", error);
        errorEl.textContent = error?.message || "Erro ao salvar usuário.";
        submit.disabled = false;
        guest.disabled = false;
        submit.textContent = submitText;
        throw error;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const cpf = onlyDigits(cpfInput.value);
      const nome = normalizeName(nomeInput.value);
      if (cpf.length !== 11) {
        errorEl.textContent = "Digite um CPF com 11 números.";
        cpfInput.focus();
        return;
      }
      if (nome.length < 3) {
        errorEl.textContent = "Digite seu nome.";
        nomeInput.focus();
        return;
      }
      authenticate(cpf, nome, "Salvando...").catch(function () {});
    });

    guest.addEventListener("click", function (event) {
      event.preventDefault();
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const cpf = (`999${randomId}${Math.floor(10 + Math.random() * 90)}`).slice(0, 11);
      authenticate(cpf, `Visitante ${randomId}`, "Carregando...").catch(function () {});
    });

    window.setTimeout(function () { cpfInput.focus(); }, 50);
  }

  async function login(cpf,name){ const user=await createOrGetUser(cpf,name); saveLocalUser(user); resolveReady(user); return user; }
  function logout(options){ options=options||{}; clearLocalUser(); emit("bc:user-logout",null); if(options.reload!==false) location.reload(); }
  async function removeAccount(publicUserId,options){ const result=await deleteUserData(publicUserId||(getCurrentUser()||{}).publicUserId); if(!options||options.reload!==false) location.reload(); return result; }
  function getCurrentUser(){ return currentUser||getLocalUser(); }
  function requireUser(){ return currentUser?Promise.resolve(currentUser):readyPromise; }
  async function init(){
    const local=getLocalUser(); if(!local){openLogin();return readyPromise;}
    try{const user=await getUserByPublicId(local.publicUserId);if(!user){clearLocalUser();openLogin();return readyPromise;}saveLocalUser(user);resolveReady(user);}catch(_){clearLocalUser();openLogin();}
    return readyPromise;
  }

  window.BC_AUTH={init,login,openLogin,logout,removeAccount,deleteUserData,getCurrentUser,requireUser,getUserByPublicId,createOrGetUser,utils:{onlyDigits,maskCpf,normalizeName}};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
