(function () {
  "use strict";

  const FLOW_URL =
    "https://default4c86fd71d0164231a16057311d68b9.51.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/27735248f4214dc598a2ac676f616bef/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ztyowqkR-WWTvIf8Io1ddOuQmZ0OS_6fzE45f18HGfw";
  const WAREHOUSE =
    "oh6ymtaw2ayufilak4yr22fzke-utm5vftfudbu5lurkrb4tdrxma.datawarehouse.fabric.microsoft.com";
  const DATABASE = "warehouse_balanco_cidadao";
  const STORAGE_KEY = "bc_mvp_user_inline_sql_v2";

  let currentUser = null;
  let readyResolve;
  const readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
  });

  const onlyDigits = (value) => String(value || "").replace(/\D/g, "");
  const normalizeName = (value) =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
  function maskCpf(value) {
    const d = onlyDigits(value).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  function sqlString(value, maxLength = 4000) {
    if (value === null || value === undefined) return "NULL";
    return "'" + String(value).slice(0, maxLength).replace(/'/g, "''") + "'";
  }
  function sqlGuid(value) {
    const s = String(value || "");
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        s,
      )
    )
      throw new Error("GUID inválido.");
    return "'" + s + "'";
  }
  function sqlJson(value) {
    return value == null ? "NULL" : sqlString(JSON.stringify(value), 200000);
  }
  function clampInt(value, min, max, fallback = min) {
    const n = parseInt(value, 10);
    return Math.max(min, Math.min(max, Number.isFinite(n) ? n : fallback));
  }
  function starsFromScore(score) {
    const s = clampInt(score, 0, 100, 0);
    return s >= 95 ? 3 : s >= 80 ? 2 : s >= 60 ? 1 : 0;
  }
  function parseRows(payload) {
    return Array.isArray(payload)
      ? payload
      : payload?.rows ||
          payload?.ResultSets?.Table1 ||
          payload?.body?.ResultSets?.Table1 ||
          [];
  }

  async function requestSql(sql) {
    if (!FLOW_URL || FLOW_URL.includes("COLE_AQUI"))
      throw new Error("Configure FLOW_URL no arquivo ../components/api.js.");
    if (!WAREHOUSE || !DATABASE)
      throw new Error(
        "Configure WAREHOUSE e DATABASE no arquivo ../components/api.js.",
      );
    const response = await fetch(FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouse: WAREHOUSE,
        database: DATABASE,
        sql,
      }),
    });
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { ok: false, error: text || "Resposta inválida." };
    }
    if (!response.ok || payload.ok === false)
      throw new Error(
        payload.error || payload.message || `Erro HTTP ${response.status}`,
      );
    return { ok: true, rows: parseRows(payload), raw: payload };
  }
  const first = (result) => result?.rows?.[0] || null;
  function saveLocalUser(user) {
    currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  function getLocalUser() {
    try {
      const u = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return u?.publicUserId ? u : null;
    } catch {
      return null;
    }
  }
  function clearLocalUser() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
  }
  function emitUserReady(user) {
    window.dispatchEvent(new CustomEvent("bc:user-ready", { detail: user }));
    readyResolve?.(user);
  }

  function appendToHeadSafe(node) {
    const target =
      document.head ||
      document.getElementsByTagName("head")[0] ||
      document.body ||
      document.documentElement;
    if (target) {
      target.appendChild(node);
      return;
    }
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const lateTarget =
          document.head ||
          document.getElementsByTagName("head")[0] ||
          document.body ||
          document.documentElement;
        lateTarget?.appendChild(node);
      },
      { once: true },
    );
  }
  function runWhenBodyReady(callback) {
    if (document.body) {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }

  function injectModalCss() {
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

  function openUserModal() {
    if (!document.body) {
      runWhenBodyReady(openUserModal);
      return;
    }
    injectModalCss();
    document.getElementById("bcUserModalBackdrop")?.remove();
    const backdrop = document.createElement("div");
    backdrop.id = "bcUserModalBackdrop";
    backdrop.className = "bc-login-backdrop";
    backdrop.innerHTML = `<form class="bc-login-card" id="bcUserModalForm"><div class="bc-login-ribbon"></div><div class="bc-login-content"><div class="bc-login-icon"><iconify-icon icon="fa6-solid:map-location-dot" aria-hidden="true"></iconify-icon></div><div class="bc-login-badge-wrap"><span class="bc-login-badge"><iconify-icon icon="fa6-solid:star" aria-hidden="true"></iconify-icon> Trilha do Tesouro</span></div><h2 class="bc-login-title">Identificação do participante</h2><p class="bc-login-subtitle">Informe seus dados para salvar progresso, estrelas, conquistas e certificado.</p><div class="bc-login-field"><label>CPF</label><input id="bcUserCpf" maxlength="14" required></div><div class="bc-login-field"><label>Nome</label><input id="bcUserNome" maxlength="160" required></div><div class="bc-login-error" id="bcUserError"></div><button class="bc-login-btn" id="bcUserSubmit" type="submit">Continuar aventura</button><button class="bc-login-btn-secondary" id="bcUserGuest" type="button">Continuar sem login</button><p class="bc-login-note">MVP sem login gov.br.</p></div></form>`;
    (document.body || document.documentElement).appendChild(backdrop);
    const form = backdrop.querySelector("#bcUserModalForm"),
      cpfInput = backdrop.querySelector("#bcUserCpf"),
      nomeInput = backdrop.querySelector("#bcUserNome"),
      errorEl = backdrop.querySelector("#bcUserError"),
      submit = backdrop.querySelector("#bcUserSubmit"),
      guestBtn = backdrop.querySelector("#bcUserGuest");

    cpfInput.addEventListener("input", () => {
      cpfInput.value = maskCpf(cpfInput.value);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorEl.textContent = "";
      const cpf = onlyDigits(cpfInput.value),
        nome = normalizeName(nomeInput.value);
      if (cpf.length !== 11) {
        errorEl.textContent = "Digite um CPF com 11 números.";
        return;
      }
      if (nome.length < 3) {
        errorEl.textContent = "Digite seu nome.";
        return;
      }
      submit.disabled = true;
      guestBtn.disabled = true;
      submit.textContent = "Salvando...";
      try {
        const user = await createOrGetUser(cpf, nome);
        saveLocalUser(user);
        backdrop.remove();
        emitUserReady(user);
      } catch (error) {
        errorEl.textContent = error.message || "Erro ao salvar usuário.";
        submit.disabled = false;
        guestBtn.disabled = false;
        submit.textContent = "Continuar aventura";
      }
    });

    guestBtn.addEventListener("click", async () => {
      errorEl.textContent = "";
      submit.disabled = true;
      guestBtn.disabled = true;
      guestBtn.textContent = "Carregando...";

      // Gera um CPF dummy e um nome temporário compatíveis com a estrutura do banco
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const cpf = `999${randomId}${Math.floor(10 + Math.random() * 90)}`;
      const nome = `Visitante ${randomId}`;

      try {
        const user = await createOrGetUser(cpf, nome);
        saveLocalUser(user);
        backdrop.remove();
        emitUserReady(user);
      } catch (error) {
        errorEl.textContent = error.message || "Erro ao entrar como visitante.";
        submit.disabled = false;
        guestBtn.disabled = false;
        guestBtn.textContent = "Continuar sem login";
      }
    });

    setTimeout(() => cpfInput.focus(), 50);
  }

  async function createOrGetUser(cpf, nome) {
    const sql = `
DECLARE @cpf VARCHAR(11) = ${sqlString(onlyDigits(cpf), 11)};
DECLARE @name VARCHAR(160) = ${sqlString(normalizeName(nome), 160)};
DECLARE @cpf_hash CHAR(64) = CONVERT(CHAR(64), HASHBYTES('SHA2_256', @cpf), 2);
DECLARE @cpf_masked VARCHAR(20) = CONCAT('***.', SUBSTRING(@cpf,4,3), '.', SUBSTRING(@cpf,7,3), '-**');
DECLARE @user_id UNIQUEIDENTIFIER;
DECLARE @public_user_id UNIQUEIDENTIFIER;
SELECT TOP 1 @user_id = user_id, @public_user_id = public_user_id FROM bc.app_user WHERE external_provider = 'mvp-cpf' AND external_subject = @cpf_hash AND is_active = 1;
IF @user_id IS NULL
BEGIN
  SET @user_id = NEWID(); SET @public_user_id = NEWID();
  INSERT INTO bc.app_user (user_id, public_user_id, external_provider, external_subject, display_name, email, nickname, accepted_lgpd_at, created_at, updated_at, is_active)
  VALUES (@user_id, @public_user_id, 'mvp-cpf', @cpf_hash, @name, NULL, @cpf_masked, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(), 1);
END
ELSE
BEGIN
  UPDATE bc.app_user SET display_name = @name, nickname = COALESCE(nickname, @cpf_masked), updated_at = SYSUTCDATETIME() WHERE user_id = @user_id;
END;
IF NOT EXISTS (SELECT 1 FROM bc.user_main_trail_progress WHERE user_id = @user_id)
  INSERT INTO bc.user_main_trail_progress (user_id, main_trail_id, status, progress_percent, completed_at, updated_at)
  SELECT @user_id, main_trail_id, CASE WHEN order_index = 1 THEN 'available' ELSE 'locked' END, 0, NULL, SYSUTCDATETIME() FROM bc.main_trail WHERE is_active = 1;
IF NOT EXISTS (SELECT 1 FROM bc.user_phase_progress WHERE user_id = @user_id)
  INSERT INTO bc.user_phase_progress (user_id, game_phase_id, status, best_score, best_stars, attempts_count, first_completed_at, last_played_at, updated_at)
  SELECT @user_id, game_phase_id, CASE WHEN order_index = 1 THEN 'available' ELSE 'locked' END, 0, 0, 0, NULL, NULL, SYSUTCDATETIME() FROM bc.game_phase WHERE is_active = 1;
SELECT TOP 1 CAST(user_id AS VARCHAR(36)) AS userId, CAST(public_user_id AS VARCHAR(36)) AS publicUserId, display_name AS displayName, nickname AS cpfMasked, created_at AS createdAt FROM bc.app_user WHERE user_id = @user_id;`;
    const user = first(await requestSql(sql));
    if (!user?.publicUserId)
      throw new Error("Usuário não retornado pelo banco.");
    return user;
  }

  async function getUserByPublicId(publicUserId) {
    return first(
      await requestSql(
        `SELECT TOP 1 CAST(user_id AS VARCHAR(36)) AS userId, CAST(public_user_id AS VARCHAR(36)) AS publicUserId, display_name AS displayName, nickname AS cpfMasked, created_at AS createdAt FROM bc.app_user WHERE public_user_id = ${sqlGuid(publicUserId)} AND is_active = 1;`,
      ),
    );
  }

  async function init() {
    const local = getLocalUser();
    if (!local) {
      openUserModal();
      return readyPromise;
    }
    try {
      const user = await getUserByPublicId(local.publicUserId);
      if (!user) {
        clearLocalUser();
        openUserModal();
        return readyPromise;
      }
      saveLocalUser(user);
      emitUserReady(user);
    } catch {
      clearLocalUser();
      openUserModal();
    }
    return readyPromise;
  }

  function requireUser() {
    return currentUser ? Promise.resolve(currentUser) : readyPromise;
  }
  function getCurrentUser() {
    return currentUser || getLocalUser();
  }
  function logoutLocalUser() {
    clearLocalUser();
    location.reload();
  }

  async function deleteUserData(publicUserId) {
    const sql = `
DECLARE @user_id UNIQUEIDENTIFIER = (SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id = ${sqlGuid(publicUserId)} AND is_active = 1);
IF @user_id IS NOT NULL
BEGIN
  DELETE FROM bc.user_achievement WHERE user_id = @user_id;
  DELETE FROM bc.section_medal_progress WHERE user_id = @user_id;
  DELETE FROM bc.game_attempt WHERE user_id = @user_id;
  DELETE FROM bc.user_phase_progress WHERE user_id = @user_id;
  DELETE FROM bc.user_content_progress WHERE user_id = @user_id;
  DELETE FROM bc.user_main_trail_progress WHERE user_id = @user_id;
  DELETE FROM bc.certificate_issue WHERE user_id = @user_id;
  DELETE FROM bc.user_session WHERE user_id = @user_id;
  DELETE FROM bc.app_user WHERE user_id = @user_id;
END;
SELECT 1 AS ok;`;
    const result = await requestSql(sql);
    clearLocalUser();
    return first(result) || { ok: 1 };
  }

  async function getReadingProgress(publicUserId, options = {}) {
    const trailSlug = String(options.trailSlug || "").slice(0, 80);
    const readerSlug = String(
      options.readerSlug || trailSlug || "leitura",
    ).slice(0, 100);
    const totalPages = clampInt(options.totalPages, 1, 9999, 1);
    const sql = `
DECLARE @user_id UNIQUEIDENTIFIER = (
  SELECT TOP 1 user_id
  FROM bc.app_user
  WHERE public_user_id = ${sqlGuid(publicUserId)}
    AND is_active = 1
);
DECLARE @main_trail_id INT = (
  SELECT TOP 1 main_trail_id
  FROM bc.main_trail
  WHERE slug = ${sqlString(trailSlug, 80)}
    AND is_active = 1
);
WITH page_progress AS (
  SELECT
    cp.order_index AS pageNumber,
    ucp.status,
    ucp.read_seconds AS readSeconds,
    ucp.completed_at AS completedAt,
    ucp.updated_at AS updatedAt
  FROM bc.content_page cp
  JOIN bc.user_content_progress ucp
    ON ucp.content_page_id = cp.content_page_id
   AND ucp.user_id = @user_id
  WHERE cp.main_trail_id = @main_trail_id
    AND cp.slug LIKE ${sqlString(readerSlug + "-p-%", 130)}
    AND cp.is_active = 1
)
SELECT
  COALESCE((SELECT TOP 1 pageNumber FROM page_progress ORDER BY updatedAt DESC), 1) AS lastPageNumber,
  COALESCE((SELECT COUNT(*) FROM page_progress WHERE status = 'completed'), 0) AS completedPages,
  ${totalPages} AS totalPages,
  COALESCE((SELECT SUM(readSeconds) FROM page_progress), 0) AS readSeconds,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM bc.user_main_trail_progress
      WHERE user_id = @user_id
        AND main_trail_id = @main_trail_id
        AND status = 'completed'
    ) THEN CAST(1 AS BIT)
    ELSE CAST(0 AS BIT)
  END AS isCompleted;
`;
    return first(await requestSql(sql));
  }

  async function saveReadingProgress(publicUserId, options = {}) {
    const trailSlug = String(options.trailSlug || "").slice(0, 80);
    const readerSlug = String(
      options.readerSlug || trailSlug || "leitura",
    ).slice(0, 100);
    const title = String(options.title || "Leitura").slice(0, 180);
    const pageNumber = clampInt(options.pageNumber, 1, 9999, 1);
    const totalPages = clampInt(options.totalPages, 1, 9999, pageNumber);
    const readSeconds = clampInt(options.readSeconds, 0, 864000, 0);
    const completed = options.completed ? 1 : 0;
    const progressPercent = Math.max(
      0,
      Math.min(
        100,
        Number(
          ((Math.max(pageNumber, 1) / Math.max(totalPages, 1)) * 100).toFixed(
            2,
          ),
        ),
      ),
    );
    const pageSlug =
      `${readerSlug}-p-${String(pageNumber).padStart(4, "0")}`.slice(0, 120);
    const pageTitle = `${title} - Página ${pageNumber}`.slice(0, 180);
    const sql = `
DECLARE @user_id UNIQUEIDENTIFIER = (
  SELECT TOP 1 user_id
  FROM bc.app_user
  WHERE public_user_id = ${sqlGuid(publicUserId)}
    AND is_active = 1
);
DECLARE @main_trail_id INT = (
  SELECT TOP 1 main_trail_id
  FROM bc.main_trail
  WHERE slug = ${sqlString(trailSlug, 80)}
    AND is_active = 1
);
IF @user_id IS NULL
BEGIN
  THROW 51000, 'Usuário não encontrado.', 1;
END;
IF @main_trail_id IS NULL
BEGIN
  THROW 51002, 'Trilha de leitura não encontrada.', 1;
END;
DECLARE @content_page_id BIGINT = (
  SELECT TOP 1 content_page_id
  FROM bc.content_page
  WHERE main_trail_id = @main_trail_id
    AND slug = ${sqlString(pageSlug, 120)}
);
IF @content_page_id IS NULL
BEGIN
  SELECT @content_page_id = COALESCE(MAX(content_page_id), 0) + 1
  FROM bc.content_page;
  INSERT INTO bc.content_page
    (content_page_id, content_year_id, main_trail_id, slug, title, summary, body_markdown, body_json, order_index, min_read_seconds, is_required, is_active, created_at, updated_at)
  VALUES
    (@content_page_id, NULL, @main_trail_id, ${sqlString(pageSlug, 120)}, ${sqlString(pageTitle, 180)}, ${sqlString("Página renderizada do livreto digital.", 800)}, NULL, NULL, ${pageNumber}, 0, 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME());
END;
IF EXISTS (
  SELECT 1
  FROM bc.user_content_progress
  WHERE user_id = @user_id
    AND content_page_id = @content_page_id
)
BEGIN
  UPDATE bc.user_content_progress
  SET status = CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN 'completed' ELSE 'in_progress' END,
      read_seconds = CASE WHEN ${readSeconds} > read_seconds THEN ${readSeconds} ELSE read_seconds END,
      completed_at = CASE WHEN (${completed} = 1 OR ${pageNumber} >= ${totalPages}) THEN COALESCE(completed_at, SYSUTCDATETIME()) ELSE completed_at END,
      updated_at = SYSUTCDATETIME()
  WHERE user_id = @user_id
    AND content_page_id = @content_page_id;
END
ELSE
BEGIN
  INSERT INTO bc.user_content_progress
    (user_id, content_page_id, status, read_seconds, completed_at, updated_at)
  VALUES
    (@user_id, @content_page_id, CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN 'completed' ELSE 'in_progress' END, ${readSeconds}, CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN SYSUTCDATETIME() ELSE NULL END, SYSUTCDATETIME());
END;
IF EXISTS (
  SELECT 1
  FROM bc.user_main_trail_progress
  WHERE user_id = @user_id
    AND main_trail_id = @main_trail_id
)
BEGIN
  UPDATE bc.user_main_trail_progress
  SET status = CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN 'completed' ELSE CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END END,
      progress_percent = CASE WHEN ${progressPercent} > progress_percent THEN ${progressPercent} ELSE progress_percent END,
      completed_at = CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN COALESCE(completed_at, SYSUTCDATETIME()) ELSE completed_at END,
      updated_at = SYSUTCDATETIME()
  WHERE user_id = @user_id
    AND main_trail_id = @main_trail_id;
END
ELSE
BEGIN
  INSERT INTO bc.user_main_trail_progress
    (user_id, main_trail_id, status, progress_percent, completed_at, updated_at)
  VALUES
    (@user_id, @main_trail_id, CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN 'completed' ELSE 'in_progress' END, ${progressPercent}, CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN SYSUTCDATETIME() ELSE NULL END, SYSUTCDATETIME());
END;
IF ${completed} = 1 OR ${pageNumber} >= ${totalPages}
BEGIN
  DECLARE @next_main_trail_id INT = (
    SELECT TOP 1 next_mt.main_trail_id
    FROM bc.main_trail current_mt
    JOIN bc.main_trail next_mt
      ON next_mt.order_index = current_mt.order_index + 1
     AND next_mt.is_active = 1
    WHERE current_mt.main_trail_id = @main_trail_id
  );
  IF @next_main_trail_id IS NOT NULL
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM bc.user_main_trail_progress
      WHERE user_id = @user_id
        AND main_trail_id = @next_main_trail_id
    )
    BEGIN
      UPDATE bc.user_main_trail_progress
      SET status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'available' END,
          updated_at = SYSUTCDATETIME()
      WHERE user_id = @user_id
        AND main_trail_id = @next_main_trail_id;
    END
    ELSE
    BEGIN
      INSERT INTO bc.user_main_trail_progress
        (user_id, main_trail_id, status, progress_percent, completed_at, updated_at)
      VALUES
        (@user_id, @next_main_trail_id, 'available', 0, NULL, SYSUTCDATETIME());
    END;
  END;
END;
SELECT
  ${pageNumber} AS pageNumber,
  ${totalPages} AS totalPages,
  ${progressPercent} AS progressPercent,
  CASE WHEN ${completed} = 1 OR ${pageNumber} >= ${totalPages} THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS isCompleted;
`;
    return first(await requestSql(sql));
  }

  async function getMainTrailProgress(publicUserId) {
    const sql = `DECLARE @user_id UNIQUEIDENTIFIER = (SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id = ${sqlGuid(publicUserId)} AND is_active = 1);
SELECT mt.main_trail_id AS mainTrailId, mt.slug, mt.title, mt.description, mt.order_index AS orderIndex, COALESCE(utp.status, CASE WHEN mt.order_index = 1 THEN 'available' ELSE 'locked' END) AS status, COALESCE(utp.progress_percent, 0) AS progressPercent, utp.completed_at AS completedAt FROM bc.main_trail mt LEFT JOIN bc.user_main_trail_progress utp ON utp.main_trail_id = mt.main_trail_id AND utp.user_id = @user_id WHERE mt.is_active = 1 ORDER BY mt.order_index;`;
    return (await requestSql(sql)).rows;
  }

  async function markMainTrailCompleted(publicUserId, slug) {
    const sql = `DECLARE @user_id UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id=${sqlGuid(publicUserId)} AND is_active=1); DECLARE @main_trail_id INT=(SELECT TOP 1 main_trail_id FROM bc.main_trail WHERE slug=${sqlString(slug, 80)} AND is_active=1); IF EXISTS(SELECT 1 FROM bc.user_main_trail_progress WHERE user_id=@user_id AND main_trail_id=@main_trail_id) UPDATE bc.user_main_trail_progress SET status='completed', progress_percent=100, completed_at=COALESCE(completed_at,SYSUTCDATETIME()), updated_at=SYSUTCDATETIME() WHERE user_id=@user_id AND main_trail_id=@main_trail_id; ELSE INSERT INTO bc.user_main_trail_progress VALUES(@user_id,@main_trail_id,'completed',100,SYSUTCDATETIME(),SYSUTCDATETIME()); SELECT 1 AS ok;`;
    return first(await requestSql(sql));
  }

  async function getGameMap(publicUserId) {
    const sql = `DECLARE @user_id UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id=${sqlGuid(publicUserId)} AND is_active=1);
SELECT v.game_section_id AS gameSectionId, v.section_slug AS sectionSlug, v.section_title AS sectionTitle, v.section_order AS sectionOrder, v.game_phase_id AS gamePhaseId, CAST(v.public_phase_id AS VARCHAR(36)) AS publicPhaseId, v.phase_slug AS phaseSlug, v.phase_title AS phaseTitle, v.phase_description AS phaseDescription, v.phase_order AS phaseOrder, v.engine_slug AS engineSlug, v.engine_title AS engineTitle, v.question_count AS questionCount, v.pass_score AS passScore, v.max_score AS maxScore, v.config_json AS configJson, COALESCE(upp.status, CASE WHEN v.phase_order=1 THEN 'available' ELSE 'locked' END) AS status, COALESCE(upp.best_score,0) AS bestScore, COALESCE(upp.best_stars,0) AS bestStars, COALESCE(upp.attempts_count,0) AS attemptsCount, COALESCE(smp.medal_state,'locked') AS medalState FROM bc.v_phase_catalog v LEFT JOIN bc.user_phase_progress upp ON upp.user_id=@user_id AND upp.game_phase_id=v.game_phase_id LEFT JOIN bc.section_medal_progress smp ON smp.user_id=@user_id AND smp.game_section_id=v.game_section_id ORDER BY v.section_order, v.phase_order;`;
    return (await requestSql(sql)).rows;
  }

  async function getNextPhaseForPhase(publicUserId, publicPhaseId) {
    const userSql = publicUserId ? sqlGuid(publicUserId) : "NULL";
    const sql = `
DECLARE @user_id UNIQUEIDENTIFIER = NULL;
IF ${userSql} IS NOT NULL
BEGIN
  SELECT TOP 1 @user_id = user_id
  FROM bc.app_user
  WHERE public_user_id = ${userSql}
    AND is_active = 1;
END;

DECLARE @current_section_order INT;
DECLARE @current_phase_order INT;

SELECT TOP 1
  @current_section_order = section_order,
  @current_phase_order = phase_order
FROM bc.v_phase_catalog
WHERE public_phase_id = ${sqlGuid(publicPhaseId)};

IF @current_section_order IS NULL
BEGIN
  SELECT CAST(NULL AS VARCHAR(36)) AS publicPhaseId WHERE 1 = 0;
END
ELSE
BEGIN
  SELECT TOP 1
    v.game_section_id AS gameSectionId,
    v.section_slug AS sectionSlug,
    v.section_title AS sectionTitle,
    v.section_order AS sectionOrder,
    v.game_phase_id AS gamePhaseId,
    CAST(v.public_phase_id AS VARCHAR(36)) AS publicPhaseId,
    v.phase_slug AS phaseSlug,
    v.phase_title AS phaseTitle,
    v.phase_description AS phaseDescription,
    v.phase_order AS phaseOrder,
    v.engine_slug AS engineSlug,
    v.engine_title AS engineTitle,
    v.question_count AS questionCount,
    v.pass_score AS passScore,
    v.max_score AS maxScore,
    v.config_json AS configJson,
    COALESCE(upp.status, CASE WHEN v.phase_order = 1 THEN 'available' ELSE 'locked' END) AS status,
    COALESCE(upp.best_score, 0) AS bestScore,
    COALESCE(upp.best_stars, 0) AS bestStars,
    COALESCE(upp.attempts_count, 0) AS attemptsCount
  FROM bc.v_phase_catalog v
  LEFT JOIN bc.user_phase_progress upp
    ON upp.user_id = @user_id
   AND upp.game_phase_id = v.game_phase_id
  WHERE
    (
      v.section_order = @current_section_order
      AND v.phase_order > @current_phase_order
    )
    OR v.section_order > @current_section_order
  ORDER BY v.section_order, v.phase_order, v.game_phase_id;
END;
`;
    return first(await requestSql(sql));
  }

  async function getQuestionsForPhase(
    publicPhaseId,
    { limit = 10, random = true } = {},
  ) {
    return (
      await requestSql(
        `SELECT TOP (${clampInt(limit, 1, 50, 10)}) qb.question_id AS questionId, CAST(qb.public_question_id AS VARCHAR(36)) AS publicQuestionId, qb.prompt, qb.simple_explanation AS simpleExplanation, qb.correct_answer AS correctAnswer, qb.options_json AS optionsJson, qb.metadata_json AS metadataJson, qb.difficulty, qb.tags FROM bc.game_phase gp JOIN bc.phase_question pq ON pq.game_phase_id=gp.game_phase_id JOIN bc.question_bank qb ON qb.question_id=pq.question_id WHERE gp.public_phase_id=${sqlGuid(publicPhaseId)} AND qb.is_active=1 ${random ? "ORDER BY NEWID()" : "ORDER BY qb.question_id"};`,
      )
    ).rows;
  }

  async function registerGameAttempt(publicUserId, publicPhaseId, attempt) {
    const score = clampInt(attempt.score ?? attempt.pontuacao, 0, 100, 0);
    const stars = clampInt(
      attempt.stars ?? attempt.estrelas ?? starsFromScore(score),
      0,
      3,
      0,
    );
    const passed = score >= 60 ? 1 : 0;
    const hintsUsed = clampInt(attempt.hintsUsed, 0, 99, 0);
    const attemptsUsed =
      attempt.attemptsUsed == null
        ? "NULL"
        : clampInt(attempt.attemptsUsed, 1, 999, 1);
    const correctCount =
      attempt.correctCount == null
        ? "NULL"
        : clampInt(attempt.correctCount, 0, 999, 0);
    const totalCount =
      attempt.totalCount == null
        ? "NULL"
        : clampInt(attempt.totalCount, 0, 999, 0);
    const durationSeconds =
      attempt.durationSeconds == null
        ? "NULL"
        : clampInt(attempt.durationSeconds, 0, 86400, 0);

    const sql = `
DECLARE @user_id UNIQUEIDENTIFIER = (
  SELECT TOP 1 user_id
  FROM bc.app_user
  WHERE public_user_id = ${sqlGuid(publicUserId)}
    AND is_active = 1
);

DECLARE @game_phase_id INT = (
  SELECT TOP 1 game_phase_id
  FROM bc.game_phase
  WHERE public_phase_id = ${sqlGuid(publicPhaseId)}
    AND is_active = 1
);

IF @user_id IS NULL
BEGIN
  THROW 51000, 'Usuário não encontrado.', 1;
END;

IF @game_phase_id IS NULL
BEGIN
  THROW 51001, 'Fase não encontrada.', 1;
END;

DECLARE @attempt_id UNIQUEIDENTIFIER = NEWID();
DECLARE @public_attempt_id UNIQUEIDENTIFIER = NEWID();

INSERT INTO bc.game_attempt
VALUES (
  @attempt_id,
  @public_attempt_id,
  @user_id,
  @game_phase_id,
  ${score},
  ${stars},
  ${passed},
  ${hintsUsed},
  ${attemptsUsed},
  ${correctCount},
  ${totalCount},
  ${durationSeconds},
  ${sqlJson(attempt.answers || attempt.respostas || null)},
  SYSUTCDATETIME()
);

/* UPSERT da fase atual: cobre usuários criados antes da fase existir */
IF EXISTS (
  SELECT 1
  FROM bc.user_phase_progress
  WHERE user_id = @user_id
    AND game_phase_id = @game_phase_id
)
BEGIN
  UPDATE bc.user_phase_progress
  SET status = CASE
        WHEN ${passed} = 1 THEN 'completed'
        WHEN status IS NULL THEN 'available'
        ELSE status
      END,
      best_score = CASE WHEN ${score} > best_score THEN ${score} ELSE best_score END,
      best_stars = CASE WHEN ${stars} > best_stars THEN ${stars} ELSE best_stars END,
      attempts_count = attempts_count + 1,
      first_completed_at = CASE
        WHEN ${passed} = 1 THEN COALESCE(first_completed_at, SYSUTCDATETIME())
        ELSE first_completed_at
      END,
      last_played_at = SYSUTCDATETIME(),
      updated_at = SYSUTCDATETIME()
  WHERE user_id = @user_id
    AND game_phase_id = @game_phase_id;
END
ELSE
BEGIN
  INSERT INTO bc.user_phase_progress
    (user_id, game_phase_id, status, best_score, best_stars, attempts_count, first_completed_at, last_played_at, updated_at)
  VALUES
    (
      @user_id,
      @game_phase_id,
      CASE WHEN ${passed} = 1 THEN 'completed' ELSE 'available' END,
      ${score},
      ${stars},
      1,
      CASE WHEN ${passed} = 1 THEN SYSUTCDATETIME() ELSE NULL END,
      SYSUTCDATETIME(),
      SYSUTCDATETIME()
    );
END;

/* Liberação da próxima fase: atualiza locked -> available se já existir */
IF ${passed} = 1
BEGIN
  DECLARE @section_id INT;
  DECLARE @order_index INT;
  DECLARE @next_phase_id INT;

  SELECT
    @section_id = game_section_id,
    @order_index = order_index
  FROM bc.game_phase
  WHERE game_phase_id = @game_phase_id;

  SELECT TOP 1
    @next_phase_id = game_phase_id
  FROM bc.game_phase
  WHERE game_section_id = @section_id
    AND order_index = @order_index + 1
    AND is_active = 1;

  IF @next_phase_id IS NOT NULL
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM bc.user_phase_progress
      WHERE user_id = @user_id
        AND game_phase_id = @next_phase_id
    )
    BEGIN
      UPDATE bc.user_phase_progress
      SET status = CASE
            WHEN status = 'completed' THEN 'completed'
            ELSE 'available'
          END,
          updated_at = SYSUTCDATETIME()
      WHERE user_id = @user_id
        AND game_phase_id = @next_phase_id;
    END
    ELSE
    BEGIN
      INSERT INTO bc.user_phase_progress
        (user_id, game_phase_id, status, best_score, best_stars, attempts_count, first_completed_at, last_played_at, updated_at)
      VALUES
        (@user_id, @next_phase_id, 'available', 0, 0, 0, NULL, NULL, SYSUTCDATETIME());
    END;
  END;
END;

SELECT
  CAST(@attempt_id AS VARCHAR(36)) AS attemptId,
  CAST(@public_attempt_id AS VARCHAR(36)) AS publicAttemptId,
  ${score} AS score,
  ${stars} AS stars,
  ${passed} AS passed,
  (SELECT status FROM bc.user_phase_progress WHERE user_id = @user_id AND game_phase_id = @game_phase_id) AS currentStatus;
`;

    return first(await requestSql(sql));
  }
  async function getUserProgress(publicUserId) {
    return first(
      await requestSql(
        `DECLARE @user_id UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id=${sqlGuid(publicUserId)} AND is_active=1); SELECT (SELECT COUNT(*) FROM bc.game_phase WHERE is_active=1) AS totalPhases, (SELECT COUNT(*) FROM bc.user_phase_progress WHERE user_id=@user_id AND status='completed') AS completedPhases, (SELECT COALESCE(SUM(best_stars),0) FROM bc.user_phase_progress WHERE user_id=@user_id) AS totalStars;`,
      ),
    );
  }
  async function getAchievements(publicUserId) {
    return (
      await requestSql(
        `SELECT achievement_id AS achievementId, slug, title, description, achievement_group AS achievementGroup, target_value AS targetValue, icon_name AS iconName, 0 AS currentValue, CAST(0 AS BIT) AS isUnlocked, NULL AS unlockedAt FROM bc.achievement_definition WHERE is_active=1 ORDER BY order_index;`,
      )
    ).rows;
  }
  async function issueCertificate(
    publicUserId,
    participantName,
    fiscalYear = null,
  ) {
    return first(
      await requestSql(
        `SELECT NULL AS publicCertificateId, NULL AS verificationCode, SYSUTCDATETIME() AS issuedAt;`,
      ),
    );
  }
  async function getCertificateStatus(publicUserId) {
    return first(
      await requestSql(
        `DECLARE @user_id UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id=${sqlGuid(publicUserId)} AND is_active=1);
SELECT COUNT(*) AS certificateCount, MAX(issued_at) AS lastIssuedAt
FROM bc.certificate_issue
WHERE user_id=@user_id AND revoked_at IS NULL;`,
      ),
    );
  }

  async function verifyCertificate(code) {
    return first(
      await requestSql(
        `SELECT TOP 1 CAST(public_certificate_id AS VARCHAR(36)) AS publicCertificateId, participant_name AS participantName, fiscal_year AS fiscalYear, verification_code AS verificationCode, issued_at AS issuedAt, CASE WHEN revoked_at IS NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS isValid FROM bc.certificate_issue WHERE verification_code=${sqlString(String(code || "").toUpperCase(), 12)};`,
      ),
    );
  }

  /* ─── Funções de administração de jogos e fases ──────────────────────────── */

  /**
   * Salva (INSERT ou UPDATE) uma fase em bc.game_phase.
   * @param {object} phase - Objeto com os campos da fase.
   * @param {number|null} phase.gamePhaseId - ID para UPDATE; null ou 0 para INSERT.
   * @param {number} phase.gameSectionId
   * @param {number} phase.gameEngineId
   * @param {string} phase.slug
   * @param {string} phase.title
   * @param {string} [phase.description]
   * @param {number} [phase.orderIndex=1]
   * @param {number|null} [phase.questionCount]
   * @param {number} [phase.passScore=60]
   * @param {number} [phase.maxScore=100]
   * @param {string} [phase.configJson]
   * @param {boolean} [phase.isActive=true]
   * @returns {Promise<{ok:boolean, rows:Array}>}
   */
  async function saveGamePhase(phase) {
    const isActive = phase.isActive === false || phase.isActive === 0 ? 0 : 1;
    const qCount =
      phase.questionCount != null
        ? clampInt(phase.questionCount, 0, 999, 0)
        : null;
    const qCountSql = qCount !== null ? String(qCount) : "NULL";
    const configJson = sqlString(phase.configJson || "{}");

    if (phase.gamePhaseId) {
      return requestSql(`
        UPDATE bc.game_phase SET
          game_section_id = ${clampInt(phase.gameSectionId, 1, 99999)},
          game_engine_id  = ${clampInt(phase.gameEngineId, 1, 99999)},
          slug            = ${sqlString(phase.slug, 100)},
          title           = ${sqlString(phase.title, 180)},
          description     = ${sqlString(phase.description, 900)},
          order_index     = ${clampInt(phase.orderIndex, 1, 999, 1)},
          question_count  = ${qCountSql},
          pass_score      = ${clampInt(phase.passScore, 0, 100, 60)},
          max_score       = ${clampInt(phase.maxScore, 1, 100, 100)},
          config_json     = ${configJson},
          is_active       = ${isActive}
        WHERE game_phase_id = ${clampInt(phase.gamePhaseId, 1, 99999999)};`);
    }

    return requestSql(`
      DECLARE @new_id INT = (SELECT COALESCE(MAX(game_phase_id), 0) + 1 FROM bc.game_phase);
      INSERT INTO bc.game_phase
        (game_phase_id, public_phase_id, game_section_id, game_engine_id,
         slug, title, description, order_index, question_count,
         pass_score, max_score, config_json, is_active, created_at)
      VALUES
        (@new_id, NEWID(),
         ${clampInt(phase.gameSectionId, 1, 99999)},
         ${clampInt(phase.gameEngineId, 1, 99999)},
         ${sqlString(phase.slug, 100)},
         ${sqlString(phase.title, 180)},
         ${sqlString(phase.description, 900)},
         ${clampInt(phase.orderIndex, 1, 999, 1)},
         ${qCountSql},
         ${clampInt(phase.passScore, 0, 100, 60)},
         ${clampInt(phase.maxScore, 1, 100, 100)},
         ${configJson},
         ${isActive},
         SYSUTCDATETIME());
      SELECT @new_id AS newGamePhaseId;`);
  }

  /**
   * Salva (INSERT ou UPDATE) uma questão em bc.question_bank.
   * @param {object} q - Dados da questão.
   * @param {number|null} q.questionId - ID para UPDATE; null ou 0 para INSERT.
   * @param {number} q.gameSectionId
   * @param {number} q.gameEngineId
   * @param {string} q.prompt
   * @param {string} [q.simpleExplanation]
   * @param {string} [q.correctAnswer]
   * @param {Array|null} [q.options] - Array de alternativas (serializado em options_json).
   * @param {object|null} [q.metadata] - Objeto livre serializado em metadata_json.
   * @param {string} [q.tags]
   * @param {number} [q.difficulty=2]
   * @returns {Promise<{ok:boolean, rows:Array}>}
   */
  async function saveQuestion(q) {
    const optionsJson = q.options != null ? sqlJson(q.options) : "NULL";
    const metadataJson = q.metadata != null ? sqlJson(q.metadata) : "NULL";
    const difficulty = clampInt(q.difficulty, 1, 3, 2);

    if (q.questionId) {
      return requestSql(`
        UPDATE bc.question_bank SET
          prompt             = ${sqlString(q.prompt)},
          simple_explanation = ${sqlString(q.simpleExplanation, 4000)},
          correct_answer     = ${sqlString(q.correctAnswer, 400)},
          options_json       = ${optionsJson},
          metadata_json      = ${metadataJson},
          difficulty         = ${difficulty},
          tags               = ${sqlString(q.tags, 500)},
          updated_at         = SYSUTCDATETIME()
        WHERE question_id = ${clampInt(q.questionId, 1, 9999999999)};`);
    }

    return requestSql(`
      DECLARE @qid BIGINT = (SELECT COALESCE(MAX(question_id), 0) + 1 FROM bc.question_bank);
      INSERT INTO bc.question_bank
        (question_id, public_question_id, game_section_id, game_engine_id,
         content_year_id, difficulty, prompt, simple_explanation,
         correct_answer, options_json, metadata_json, tags,
         is_active, created_at, updated_at)
      VALUES
        (@qid, NEWID(),
         ${clampInt(q.gameSectionId, 1, 99999)},
         ${clampInt(q.gameEngineId, 1, 99999)},
         NULL, ${difficulty},
         ${sqlString(q.prompt)},
         ${sqlString(q.simpleExplanation, 4000)},
         ${sqlString(q.correctAnswer, 400)},
         ${optionsJson},
         ${metadataJson},
         ${sqlString(q.tags, 500)},
         1, SYSUTCDATETIME(), SYSUTCDATETIME());
      SELECT @qid AS newQuestionId;`);
  }

  /**
   * Vincula uma questão a uma fase em bc.phase_question.
   * @param {number} gamePhaseId
   * @param {number} questionId
   * @param {number} [orderIndex=1]
   * @returns {Promise<{ok:boolean, rows:Array}>}
   */
  async function linkQuestionToPhase(gamePhaseId, questionId, orderIndex = 1) {
    return requestSql(`
      DECLARE @pqid BIGINT = (SELECT COALESCE(MAX(phase_question_id), 0) + 1 FROM bc.phase_question);
      INSERT INTO bc.phase_question
        (phase_question_id, game_phase_id, question_id, order_index, weight, is_required)
      VALUES
        (@pqid, ${clampInt(gamePhaseId, 1, 99999999)},
         ${clampInt(questionId, 1, 9999999999)},
         ${clampInt(orderIndex, 1, 999, 1)}, 1.0, 0);
      SELECT @pqid AS newPhaseQuestionId;`);
  }

  /**
   * Remove o vínculo de uma questão com uma fase (phase_question).
   * A questão permanece em bc.question_bank.
   * @param {number} phaseQuestionId - ID da linha em bc.phase_question.
   * @returns {Promise<{ok:boolean, rows:Array}>}
   */
  async function unlinkQuestionFromPhase(phaseQuestionId) {
    return requestSql(`
      DELETE FROM bc.phase_question
      WHERE phase_question_id = ${clampInt(phaseQuestionId, 1, 9999999999)};`);
  }

  /* ─────────────────────────────────────────────────────────────────────── */

  window.BC_API = {
    init,
    requireUser,
    getCurrentUser,
    logoutLocalUser,
    deleteUserData,
    openUserModal,
    requestSql,
    createOrGetUser,
    getUserByPublicId,
    getMainTrailProgress,
    getReadingProgress,
    saveReadingProgress,
    markMainTrailCompleted,
    getGameMap,
    getNextPhaseForPhase,
    getQuestionsForPhase,
    registerGameAttempt,
    getUserProgress,
    getAchievements,
    issueCertificate,
    getCertificateStatus,
    verifyCertificate,
    /* administração de jogos */
    saveGamePhase,
    saveQuestion,
    linkQuestionToPhase,
    unlinkQuestionFromPhase,
    utils: { onlyDigits, maskCpf, starsFromScore },
  };
  if (document.readyState === "loading" || !document.body) {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

(function () {
  "use strict";
  const A = window.BC_API;
  if (!A) return;
  const S = (v) => "'" + String(v ?? "").replace(/'/g, "''") + "'",
    N = (v, f = 0) => (Number.isFinite(+v) ? +v : f),
    R = (x) => x?.rows || [];
  A.adminSaveSection = async (s) => {
    if (s.gameSectionId)
      return A.requestSql(
        `UPDATE bc.game_section SET slug=${S(s.slug)},title=${S(s.title)},description=${S(s.description)},order_index=${N(s.orderIndex, 1)},is_active=${s.isActive ? 1 : 0} WHERE game_section_id=${N(s.gameSectionId)};`,
      );
    return A.requestSql(
      `DECLARE @id INT=(SELECT COALESCE(MAX(game_section_id),0)+1 FROM bc.game_section);INSERT INTO bc.game_section VALUES(@id,${S(s.slug)},${S(s.title)},${S(s.description)},${N(s.orderIndex, 1)},${s.isActive ? 1 : 0});SELECT @id AS gameSectionId;`,
    );
  };
  A.adminDeactivateSection = (id) =>
    A.requestSql(
      `UPDATE bc.game_section SET is_active=0 WHERE game_section_id=${N(id)};UPDATE bc.game_phase SET is_active=0 WHERE game_section_id=${N(id)};`,
    );
  A.adminMoveSection = async (id, d) => {
    const r = R(
        await A.requestSql(
          `SELECT game_section_id AS id,order_index AS ord FROM bc.game_section ORDER BY order_index,game_section_id;`,
        ),
      ),
      i = r.findIndex((x) => +x.id === +id),
      j = i + d;
    if (j < 0 || j >= r.length) return;
    return A.requestSql(
      `UPDATE bc.game_section SET order_index=CASE WHEN game_section_id=${r[i].id} THEN ${r[j].ord} WHEN game_section_id=${r[j].id} THEN ${r[i].ord} ELSE order_index END WHERE game_section_id IN(${r[i].id},${r[j].id});`,
    );
  };
  A.adminMovePhaseQuestion = async (id, d) => {
    const r = R(
        await A.requestSql(
          `SELECT phase_question_id AS id,order_index AS ord FROM bc.phase_question WHERE game_phase_id=(SELECT game_phase_id FROM bc.phase_question WHERE phase_question_id=${N(id)}) ORDER BY order_index,phase_question_id;`,
        ),
      ),
      i = r.findIndex((x) => +x.id === +id),
      j = i + d;
    if (j < 0 || j >= r.length) return;
    return A.requestSql(
      `UPDATE bc.phase_question SET order_index=CASE WHEN phase_question_id=${r[i].id} THEN ${r[j].ord} WHEN phase_question_id=${r[j].id} THEN ${r[i].ord} ELSE order_index END WHERE phase_question_id IN(${r[i].id},${r[j].id});`,
    );
  };
  A.adminListReusableQuestions = async (sectionId, engineId, phaseId) =>
    R(
      await A.requestSql(
        `SELECT TOP 100 qb.question_id AS questionId,qb.prompt,qb.difficulty FROM bc.question_bank qb WHERE qb.game_section_id=${N(sectionId)} AND qb.game_engine_id=${N(engineId)} AND qb.is_active=1 AND NOT EXISTS(SELECT 1 FROM bc.phase_question pq WHERE pq.question_id=qb.question_id AND pq.game_phase_id=${N(phaseId)}) ORDER BY qb.updated_at DESC;`,
      ),
    );
})();
