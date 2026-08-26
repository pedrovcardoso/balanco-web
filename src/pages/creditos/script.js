(function () {
  "use strict";
  const TRAIL_SLUG = document.body.dataset.trailSlug || "creditos-saiba-mais";
  const storageKey = "bc_trail_completed_" + TRAIL_SLUG;
  let currentUser = null;
  let reachedEnd = false;
  let claimed = sessionStorage.getItem(storageKey) === "1";
  const $ = (selector, root = document) => root.querySelector(selector);

  function revealOnScroll() {
    const items = document.querySelectorAll(".fade-rise");
    if (!("IntersectionObserver" in window)) { items.forEach(item => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .12 });
    items.forEach((item, index) => { item.style.animationDelay = Math.min(index * .08, .32) + "s"; observer.observe(item); });
  }
  function showToast(message) {
    let toast = $(".bc-toast");
    if (!toast) { toast = document.createElement("div"); toast.className = "bc-toast pointer-events-none fixed bottom-[18px] left-1/2 z-[99999] w-[min(92vw,420px)] -translate-x-1/2 translate-y-[18px] rounded-[18px] bg-[rgba(93,43,10,.96)] px-4 py-[.85rem] text-center font-black text-[#fffaf0] opacity-0 shadow-[0_16px_34px_rgba(0,0,0,.25)] transition [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100"; toast.setAttribute("role","status"); toast.setAttribute("aria-live","polite"); document.body.appendChild(toast); }
    toast.textContent = message; toast.classList.add("is-visible"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }
  function renderAchievement() {
    const section = $("#readingAchievement"), button = $("#claimReadingMedal"), status = $("#readingAchievementStatus"), message = $("#readingAchievementMessage");
    if (!section || !button) return;
    section.classList.toggle("is-ready", reachedEnd && !claimed); section.classList.toggle("is-claimed", claimed);
    button.hidden = claimed; button.disabled = claimed || !reachedEnd; button.setAttribute("aria-disabled", String(button.disabled));
    if (claimed) { status.textContent = "Medalha conquistada"; message.textContent = "Conquista registrada. Ela já está disponível na sua estante de medalhas."; button.querySelector("span").textContent = "Medalha resgatada"; }
    else if (reachedEnd) { status.textContent = "Pronta para resgate"; message.textContent = "Leitura concluída. Resgate sua medalha."; button.querySelector("span").textContent = "Resgatar medalha"; }
    else { status.textContent = "Continue a leitura"; message.textContent = "Leia todo o conteúdo para habilitar o resgate."; }
  }
  async function loadExistingStatus() {
    try {
      currentUser = await window.BC_AUTH.requireUser();
      const rows = await window.BC_API.getMainTrailProgress(currentUser.publicUserId);
      const row = (rows || []).find(item => item.slug === TRAIL_SLUG);
      claimed = claimed || String(row?.status || "").toLowerCase() === "completed" || Number(row?.progressPercent) >= 100;
      if (claimed) sessionStorage.setItem(storageKey, "1");
    } catch (error) { console.warn("[Saiba Mais] Falha ao consultar conquista:", error); }
    renderAchievement();
  }
  async function claimAchievement() {
    if (claimed || !reachedEnd) return;
    const button = $("#claimReadingMedal"), section = $("#readingAchievement");
    button.disabled = true; button.querySelector("span").textContent = "Registrando...";
    try {
      currentUser = currentUser || await window.BC_AUTH.requireUser();
      await window.BC_API.completeMainTrail(currentUser.publicUserId, TRAIL_SLUG);
      claimed = true; sessionStorage.setItem(storageKey, "1"); renderAchievement();
      section.classList.add("is-celebrating"); setTimeout(() => section.classList.remove("is-celebrating"), 1300);
      showToast("Medalha Leitura Nota A! conquistada!");
      window.dispatchEvent(new CustomEvent("bc:trail-completed", { detail: { trailSlug: TRAIL_SLUG, status: "completed", progressPercent: 100 } }));
    } catch (error) { console.warn("[Saiba Mais] Falha ao resgatar medalha:", error); button.disabled = false; button.querySelector("span").textContent = "Tentar novamente"; showToast("Não foi possível registrar a medalha agora."); }
  }
  function setupEndReading() {
    const sentinel = $("#creditsEndSentinel"), section = $("#readingAchievement");
    const unlock = () => { if (reachedEnd) return; reachedEnd = true; renderAchievement(); };
    if (sentinel && "IntersectionObserver" in window) { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { unlock(); observer.disconnect(); } }, { threshold: .1 }); observer.observe(sentinel); }
    window.addEventListener("scroll", () => { if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) unlock(); }, { passive:true });
  }
  function setupBackToTop() { const button=$(".back-to-top"); if(!button)return; const toggle=()=>button.classList.toggle("is-visible",window.scrollY>360); button.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"})); window.addEventListener("scroll",toggle,{passive:true}); toggle(); }
  function bindPendingLinks() { document.querySelectorAll("[data-pending-link]").forEach(link => link.addEventListener("click", event => { if (!link.getAttribute("href") || link.getAttribute("href") === "#") { event.preventDefault(); showToast("Link em atualização."); } })); }
  function init() { revealOnScroll(); bindPendingLinks(); setupBackToTop(); setupEndReading(); $("#claimReadingMedal")?.addEventListener("click", claimAchievement); loadExistingStatus(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
})();
