(function () {
  "use strict";

  const tips = {
    "minas-gerais": "Conheça a diversidade e a cultura de Minas Gerais.",
    "entendendo-balanco": "Aprenda os conceitos do balanço e da administração pública.",
    "balanco-na-pratica": "Explore dados, visualizações e notícias do ano.",
    jogos: "Complete os jogos da Trilha do Tesouro para concluir essa trilha.",
    "saiba-mais": "Acesse informações complementares, créditos e referências."
  };

  let activeTip = null;

  function ensureSlugs() {
    const routes = [
      ["../historia", "minas-gerais"],
      ["../balanco", "entendendo-balanco"],
      ["../balanco_dados", "balanco-na-pratica"],
      ["../trilha-jogos", "jogos"],
      ["../creditos", "saiba-mais"]
    ];
    routes.forEach(function (item) {
      document.querySelector('a[href="' + item[0] + '"]')
        ?.setAttribute("data-main-trail-slug", item[1]);
    });
  }

  function hideTip() {
    activeTip?.remove();
    activeTip = null;
  }

  function showTip(target, text) {
    hideTip();
    const tip = document.createElement("div");
    tip.className = "bc-floating-tip";
    tip.textContent = text;
    document.body.appendChild(tip);
    const rect = target.getBoundingClientRect();
    requestAnimationFrame(function () {
      let left = rect.left + rect.width / 2 - tip.offsetWidth + 18;
      left = Math.max(8, Math.min(left, window.innerWidth - tip.offsetWidth - 8));
      let top = rect.top - tip.offsetHeight - 8;
      if (top < 8) top = rect.bottom + 8;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
      tip.classList.add("is-visible");
    });
    activeTip = tip;
  }

  function attachTip(element, text) {
    element.onmouseenter = function () { showTip(element, text); };
    element.onmouseleave = hideTip;
    element.onfocus = function () { showTip(element, text); };
    element.onblur = hideTip;
  }

  function seal(card) {
    let element = card.querySelector(":scope > .bc-status-seal");
    if (!element) {
      element = document.createElement("span");
      element.className = "bc-status-seal bc-status-loading absolute -right-2 -top-2 z-30 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-500 text-xs text-white shadow-md";
      element.tabIndex = 0;
      element.setAttribute("role", "img");
      card.appendChild(element);
    }
    return element;
  }

  function setLoading() {
    ensureSlugs();
    document.querySelectorAll("[data-main-trail-slug]").forEach(function (card) {
      const element = seal(card);
      element.className = "bc-status-seal bc-status-loading absolute -right-2 -top-2 z-30 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-500 text-xs text-white shadow-md";
      element.innerHTML = `<iconify-icon icon="fa6-solid:spinner" class="animate-spin" aria-hidden="true"></iconify-icon>`;
      element.setAttribute("aria-label", "Carregando status da trilha");
      attachTip(element, "Carregando status da trilha...");
    });
  }

  function setupCertificateSeal() {
    const trophy = document.querySelector(".trophy-end");
    if (!trophy || trophy.querySelector(":scope > .bc-status-seal")) return;
    const sealElement = document.createElement("span");
    sealElement.className = "bc-status-seal cert-pending absolute -right-2 -top-2 z-30 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#c0272d] text-xs text-white shadow-md";
    sealElement.tabIndex = 0;
    sealElement.setAttribute("role", "img");
    sealElement.innerHTML = `<iconify-icon icon="fa6-solid:lock" aria-hidden="true"></iconify-icon>`;
    sealElement.setAttribute("aria-label", "Certificado pendente");
    trophy.appendChild(sealElement);
    attachTip(sealElement, "Gere o certificado e conclua essa trilha.");
  }

  function setStatus(card, item) {
    const status = String(item?.status || "").toLowerCase();
    const done = status === "completed" || status === "concluido" || status === "concluído" || Number(item?.progressPercent) >= 100;
    const element = seal(card);
    element.className = done
      ? "bc-status-seal bc-status-ok absolute -right-2 -top-2 z-30 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-emerald-600 text-xs text-white shadow-md"
      : "bc-status-seal bc-status-pending absolute -right-2 -top-2 z-30 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#c0272d] text-xs text-white shadow-md";
    element.innerHTML = done
      ? `<iconify-icon icon="fa6-solid:check" aria-hidden="true"></iconify-icon>`
      : `<iconify-icon icon="fa6-solid:xmark" aria-hidden="true"></iconify-icon>`;
    element.setAttribute("aria-label", done ? "Trilha concluída" : "Trilha pendente");
    attachTip(element, done ? "Trilha concluída." : tips[card.dataset.mainTrailSlug] || "Conclua essa trilha.");
  }

  async function loadProgress(user) {
    if (!user || !user.publicUserId) return;
    setLoading();
    setupCertificateSeal();
    try {
      const rows = await window.BC_API.getMainTrailProgress(user.publicUserId);
      const progressBySlug = new Map(rows.map(function (row) { return [row.slug, row]; }));
      document.querySelectorAll("[data-main-trail-slug]").forEach(function (card) {
        setStatus(card, progressBySlug.get(card.dataset.mainTrailSlug) || { status: "available" });
      });
    } catch (error) {
      console.warn("[Home] Falha ao carregar progresso:", error);
      document.querySelectorAll("[data-main-trail-slug]").forEach(function (card) {
        setStatus(card, { status: "available" });
      });
    }
  }

  function init() {
    ensureSlugs();
    setLoading();
    setupCertificateSeal();
    const user = window.BC_AUTH?.getCurrentUser();
    if (user) loadProgress(user);
  }

  window.addEventListener("bc:user-ready", function (event) {
    loadProgress(event.detail);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
