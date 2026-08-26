(function () {
  "use strict";

  if (window.__BC_HEADER_LOADED__) return;
  window.__BC_HEADER_LOADED__ = true;

  const css = `
:root { --a11y-topbar-height: 52px; }
body { padding-top: var(--a11y-topbar-height) !important; }
.accessibility-topbar { position:fixed; inset:0 0 auto 0; min-height:var(--a11y-topbar-height); z-index:99990; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.95); color:#1f2937; border-bottom:3px solid #c0272d; box-shadow:0 4px 14px rgba(17,24,39,.12); backdrop-filter:blur(12px); overflow:visible!important; }
.accessibility-topbar-inner { width:min(1240px,100%); display:grid; grid-template-columns:auto 1fr; align-items:center; gap:.5rem; padding:.22rem .68rem; position:relative!important; min-height:var(--a11y-topbar-height)!important; }
.accessibility-brand { display:flex; align-items:center; gap:.5rem; min-width:0; }
.accessibility-brand img { display:block; width:auto; height:28px; max-width:126px; object-fit:contain; }
.accessibility-brand .accessibility-logo-sccg { height:18px; max-width:82px; }
.accessibility-brand-separator { width:2px; height:27px; background:rgba(192,39,45,.22); }
.accessibility-toolbar { display:flex; align-items:center; justify-content:flex-end; gap:.3rem; }
.a11y-btn { min-height:1.82rem; border:2px solid rgba(31,41,55,.22); border-radius:.48rem; background:#fff; color:#111827; font:inherit; font-size:.72rem; font-weight:900; display:inline-flex; align-items:center; justify-content:center; gap:.28rem; padding:.3rem .46rem; cursor:pointer; }
.a11y-btn:hover, .a11y-btn[aria-pressed="true"] { border-color:#c0272d; background:#fff7ed; color:#8f1e23; }
.accessibility-toolbar > .a11y-btn { width:36px!important; height:36px!important; min-width:36px!important; min-height:36px!important; padding:0!important; border-radius:50%!important; aspect-ratio:1/1!important; } .bc-header-profile-trigger { width:42px!important; height:38px!important; min-width:42px!important; min-height:38px!important; padding:0!important; border-radius:12px!important; }
.accessibility-toolbar > .a11y-btn iconify-icon { width:1em!important; height:1em!important; display:grid!important;place-items:center!important;line-height:1!important; } .bc-header-profile-trigger iconify-icon { width:1.35em!important; height:1.35em!important; font-size:1.15rem!important; display:grid!important;place-items:center!important;line-height:1!important;margin:auto!important; }
.bc-header-profile { position:relative; }
.bc-header-profile-trigger { color:#fff!important; background:linear-gradient(135deg,#2d6a4f,#10b981)!important; border-color:rgba(255,255,255,.9)!important; box-shadow:0 6px 14px rgba(45,106,79,.22)!important; }
.bc-header-profile-trigger:hover, .bc-header-profile-trigger[aria-expanded="true"] { background:linear-gradient(135deg,#245a43,#0d9c6e)!important; border-color:#f5a800!important; color:#fff!important; }
.bc-header-menu { position:absolute; right:0; top:calc(100% + 10px); width:min(330px,calc(100vw - 24px)); padding:.9rem; border-radius:24px; border:3px solid #8b6914; background:linear-gradient(135deg,#fffaf0,#fdf6e3 60%,#ffe8aa); box-shadow:0 28px 70px rgba(45,30,13,.36); color:#5d2b0a; }
.bc-header-menu[hidden] { display:none; }
.bc-header-menu strong { display:block; font-size:.86rem; font-weight:900; margin-bottom:.6rem; }
.bc-header-menu .a11y-btn { width:100%; margin-top:.45rem; }
.bc-header-menu .danger { background:linear-gradient(135deg,#c0272d,#8f1e23); color:#fff; border-color:#8f1e23; }
.bc-header-menu iconify-icon { width:1em; height:1em; display:inline-block; flex:0 0 auto; }
@media(max-width:900px){:root{--a11y-topbar-height:72px}.accessibility-topbar-inner{grid-template-columns:1fr;justify-items:center;gap:.18rem}.accessibility-brand img{height:20px;max-width:94px}.accessibility-brand .accessibility-logo-sccg{height:14px;max-width:66px}}
html.a11y-high-contrast .accessibility-topbar, html.a11y-high-contrast .bc-header-menu, html.a11y-high-contrast .a11y-btn { background:#000!important; color:#fff!important; border-color:#ff0!important; }

.bc-delete-backdrop{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(24,33,26,.62);backdrop-filter:blur(8px)}
.bc-delete-backdrop[hidden]{display:none!important}
.bc-delete-card{position:relative;width:min(100%,390px);overflow:hidden;border-radius:28px;border:4px solid #8b6914;background:linear-gradient(135deg,#fffaf0,#fdf6e3 58%,#ffe8aa);box-shadow:0 28px 80px rgba(0,0,0,.32);color:#5d2b0a;font-family:Nunito,system-ui,sans-serif}
.bc-delete-ribbon{height:10px;background:repeating-linear-gradient(90deg,#c0272d 0 22px,#8f1e23 22px 44px,#f5a800 44px 66px)}
.bc-delete-body{padding:20px;text-align:center}
.bc-delete-icon{width:64px;height:64px;margin:0 auto 12px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(135deg,#c0272d,#8f1e23);color:#fff;font-size:1.8rem;box-shadow:0 12px 22px rgba(192,39,45,.22)}
.bc-delete-title{margin:0;font-family:"Fredoka One",Fredoka,Nunito,sans-serif;font-size:1.35rem;line-height:1.1;color:#5d2b0a}
.bc-delete-text{margin:.55rem 0 0;color:#6b3a1f;font-size:.86rem;font-weight:800;line-height:1.4}
.bc-delete-error{min-height:18px;margin-top:.55rem;color:#b91c1c;font-size:.78rem;font-weight:900}
.bc-delete-actions{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:1rem}
.bc-delete-btn{min-height:42px;border-radius:999px;border:0;font:inherit;font-size:.82rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.42rem}
.bc-delete-btn.cancel{background:rgba(255,255,255,.86);color:#5d2b0a;border:2px solid rgba(139,94,60,.3)}
.bc-delete-btn.confirm{background:linear-gradient(135deg,#c0272d,#8f1e23);color:#fff;box-shadow:0 10px 20px rgba(192,39,45,.22)}
.bc-delete-btn:disabled{opacity:.72;cursor:wait}
.bc-delete-spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%;animation:bcDeleteSpin .75s linear infinite}
@keyframes bcDeleteSpin{to{transform:rotate(360deg)}}
`;

  function storedUser() {
    try {
      const value = JSON.parse(localStorage.getItem("bc_mvp_user_inline_sql_v2") || "null");
      return value && value.publicUserId ? value : null;
    } catch (_) { return null; }
  }
  function sync(root, user) {
    const activeUser = user && user.publicUserId ? user : (window.BC_AUTH?.getCurrentUser?.() || storedUser());
    const logged = !!(activeUser && activeUser.publicUserId);
    root.querySelector("[data-name]").textContent = logged ? (activeUser.displayName || "Participante") : "Participante";
    const login = root.querySelector("[data-login]");
    const logout = root.querySelector("[data-logout]");
    const remove = root.querySelector("[data-delete]");
    login.hidden = logged;
    logout.hidden = !logged;
    remove.hidden = !logged;
    login.style.setProperty("display", logged ? "none" : "inline-flex", "important");
    logout.style.setProperty("display", logged ? "inline-flex" : "none", "important");
    remove.style.setProperty("display", logged ? "inline-flex" : "none", "important");
  }

  function createDeleteModal() {
    let modal = document.getElementById("bcDeleteModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "bcDeleteModal";
    modal.className = "bc-delete-backdrop";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "bcDeleteTitle");
    modal.innerHTML = `<div class="bc-delete-card"><div class="bc-delete-ribbon"></div><div class="bc-delete-body"><div class="bc-delete-icon"><iconify-icon icon="fa6-solid:trash-can" aria-hidden="true"></iconify-icon></div><h2 class="bc-delete-title" id="bcDeleteTitle">Excluir seus dados?</h2><p class="bc-delete-text">Essa ação remove usuário, progresso, tentativas e certificados salvos. Não será possível recuperar depois.</p><div class="bc-delete-error" data-delete-error aria-live="polite"></div><div class="bc-delete-actions"><button class="bc-delete-btn cancel" type="button" data-delete-cancel>Cancelar</button><button class="bc-delete-btn confirm" type="button" data-delete-confirm><iconify-icon icon="fa6-solid:trash-can" aria-hidden="true"></iconify-icon><span>Excluir dados</span></button></div></div></div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function openDeleteModal(user) {
    const modal = createDeleteModal();
    const cancel = modal.querySelector("[data-delete-cancel]");
    const confirm = modal.querySelector("[data-delete-confirm]");
    const label = confirm.querySelector("span");
    const error = modal.querySelector("[data-delete-error]");
    error.textContent = "";
    cancel.disabled = false;
    confirm.disabled = false;
    confirm.querySelector("iconify-icon")?.removeAttribute("hidden");
    modal.querySelector(".bc-delete-spinner")?.remove();
    label.textContent = "Excluir dados";
    modal.hidden = false;
    cancel.focus();
    const close = () => { if (!confirm.disabled) modal.hidden = true; };
    cancel.onclick = close;
    modal.onclick = (event) => { if (event.target === modal) close(); };
    confirm.onclick = async () => {
      if (!user?.publicUserId || !window.BC_AUTH?.removeAccount) return;
      cancel.disabled = true;
      confirm.disabled = true;
      error.textContent = "";
      confirm.querySelector("iconify-icon")?.setAttribute("hidden", "");
      const spinner = document.createElement("span");
      spinner.className = "bc-delete-spinner";
      spinner.setAttribute("aria-hidden", "true");
      confirm.prepend(spinner);
      label.textContent = "Excluindo...";
      try {
        await window.BC_AUTH.removeAccount(user.publicUserId, { reload: false });
        label.textContent = "Dados excluídos";
        window.setTimeout(() => window.location.reload(), 350);
      } catch (requestError) {
        spinner.remove();
        confirm.querySelector("iconify-icon")?.removeAttribute("hidden");
        label.textContent = "Tentar novamente";
        error.textContent = requestError?.message || "Não foi possível excluir os dados.";
        cancel.disabled = false;
        confirm.disabled = false;
      }
    };
  }

  function init() {
    if (document.getElementById("bc-header-root")) return;
    const style = document.createElement("style");
    style.id = "bc-header-style";
    style.textContent = css;
    document.head.appendChild(style);

    const root = document.createElement("div");
    root.id = "bc-header-root";
    root.innerHTML = `<header class="accessibility-topbar" aria-label="Barra institucional"><div class="accessibility-topbar-inner"><div class="accessibility-brand"><img src="../../../public/images/logo-govmg.png" alt="Governo de Minas Gerais"><span class="accessibility-brand-separator" aria-hidden="true"></span><img class="accessibility-logo-sccg" src="../../../public/images/logo-sccg.png" alt="Superintendência Central de Contadoria Geral"></div><nav class="accessibility-toolbar" aria-label="Acessos rápidos"><button class="a11y-btn" type="button" data-vlibras aria-label="Ativar VLibras" title="Ativar VLibras"><iconify-icon icon="fa6-solid:hands" aria-hidden="true"></iconify-icon></button><button class="a11y-btn" type="button" data-contrast aria-label="Alternar alto contraste" title="Alto contraste" aria-pressed="false"><iconify-icon icon="fa6-solid:circle-half-stroke" aria-hidden="true"></iconify-icon></button><div class="bc-header-profile"><button class="a11y-btn bc-header-profile-trigger" type="button" data-profile aria-label="Abrir perfil" title="Perfil" aria-expanded="false"><iconify-icon icon="fa6-solid:circle-user" aria-hidden="true"></iconify-icon></button><div class="bc-header-menu" data-menu hidden><strong data-name>Participante</strong><button class="a11y-btn" type="button" data-login><iconify-icon icon="fa6-solid:right-to-bracket" aria-hidden="true"></iconify-icon>Fazer login</button><button class="a11y-btn" type="button" data-logout><iconify-icon icon="fa6-solid:right-from-bracket" aria-hidden="true"></iconify-icon>Sair neste navegador</button><button class="a11y-btn danger" type="button" data-delete><iconify-icon icon="fa6-solid:trash-can" aria-hidden="true"></iconify-icon>Excluir dados</button></div></div></nav></div></header>`;
    document.body.prepend(root);

    const menu = root.querySelector("[data-menu]");
    const profile = root.querySelector("[data-profile]");
    profile.addEventListener("click", function () {
      menu.hidden = !menu.hidden;
      profile.setAttribute("aria-expanded", String(!menu.hidden));
    });
    root.querySelector("[data-vlibras]").addEventListener("click", function () {
      if (window.BC_A11Y && typeof window.BC_A11Y.openVLibras === "function") window.BC_A11Y.openVLibras(); else window.dispatchEvent(new CustomEvent("bc:open-vlibras"));
    });
    root.querySelector("[data-contrast]").addEventListener("click", function () {
      window.BC_A11Y?.toggle?.("highContrast");
    });
    root.querySelector("[data-login]").addEventListener("click", function () {
      menu.hidden = true;
      if (window.BC_AUTH && typeof window.BC_AUTH.openLogin === "function") window.BC_AUTH.openLogin();
    });
    root.querySelector("[data-logout]").addEventListener("click", function () {
      window.BC_AUTH?.logout?.();
    });
    root.querySelector("[data-delete]").addEventListener("click", function () {
      menu.hidden = true;
      profile.setAttribute("aria-expanded", "false");
      const user = window.BC_AUTH?.getCurrentUser?.() || storedUser();
      if (user) openDeleteModal(user);
    });
    document.addEventListener("click", function (event) {
      if (!root.querySelector(".bc-header-profile").contains(event.target)) {
        menu.hidden = true;
        profile.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        const modal = document.getElementById("bcDeleteModal");
        const confirm = modal?.querySelector("[data-delete-confirm]");
        if (modal && !modal.hidden && !confirm?.disabled) modal.hidden = true;
      }
    });
    window.addEventListener("bc:user-ready", function (event) { sync(root, event.detail); });
    window.addEventListener("bc:user-logout", function () { sync(root, null); });
    window.addEventListener("bc:a11y-changed", function (event) {
      root.querySelector("[data-contrast]").setAttribute("aria-pressed", String(!!event.detail?.highContrast));
    });
    sync(root, window.BC_AUTH?.getCurrentUser?.() || storedUser());
    window.addEventListener("storage", function (event) { if (event.key === "bc_mvp_user_inline_sql_v2") sync(root, storedUser()); });
    window.setTimeout(function () { sync(root, window.BC_AUTH?.getCurrentUser?.() || storedUser()); }, 0);
    window.setTimeout(function () { sync(root, window.BC_AUTH?.getCurrentUser?.() || storedUser()); }, 700);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
