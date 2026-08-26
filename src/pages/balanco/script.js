(() => {
  "use strict";
  const $ = (s) => document.querySelector(s),
    body = document.body,
    content = $(".web-content"),
    links = [...document.querySelectorAll(".chapter-details a[href^='#']")],
    sections = [...document.querySelectorAll(".content-section[id]")],
    menu = $("#sectionMenu"),
    menuButton = $("#sectionMenuButton"),
    menuClose = $("#sectionMenuClose"),
    backdrop = $("#sectionMenuBackdrop"),
    status = $("#readerStatus"),
    progress = $("#progressBar"),
    progressText = $("#progressText"),
    focus = $("#focusMode"),
    overlay = $("#focusOverlay");
  let scale = Number(localStorage.getItem("bc-scale")) || 1,
    focusOn = false,
    user = null,
    started = Date.now(),
    timer = 0,
    lastMenuTrigger = null;
  const mobile = () => matchMedia("(max-width:900px)").matches;
  function say(t) {
    status.textContent = "";
    requestAnimationFrame(() => (status.textContent = t));
  }
  function setScale(v) {
    scale = Math.max(0.85, Math.min(1.4, Math.round(v * 100) / 100));
    content.style.setProperty("--scale", scale);
    $("#fontValue").value = `${Math.round(scale * 100)}%`;
    $("#fontValue").textContent = `${Math.round(scale * 100)}%`;
    localStorage.setItem("bc-scale", scale);
    say(`Texto em ${Math.round(scale * 100)}%`);
  }
  function update() {
    const r = content.getBoundingClientRect(),
      max = Math.max(1, content.offsetHeight - innerHeight),
      value = Math.round(Math.min(1, Math.max(0, (-r.top + 80) / max)) * 100);
    progress.style.width = `${value}%`;
    progressText.textContent =
      value < 8 ? "Início" : value > 92 ? "Fim" : `${value}% lido`;
    clearTimeout(timer);
    timer = setTimeout(() => save(value > 94), 800);
  }
  async function save(done) {
    if (!user || !window.BC_API?.saveReadingProgress) return;
    try {
      await BC_API.saveReadingProgress(user.publicUserId, {
        trailSlug: body.dataset.trailSlug,
        readerSlug: body.dataset.readerSlug,
        title: body.dataset.title,
        pageNumber: done ? 28 : 1,
        totalPages: 28,
        completed: done,
        readSeconds: Math.round((Date.now() - started) / 1000),
      });
    } catch (e) {
      console.warn(e);
    }
  }
  function openMenu() {
    if (!mobile()) return;
    lastMenuTrigger = document.activeElement;
    menu.classList.add("open");
    body.classList.add("section-menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() =>
      menu.querySelector("a[aria-current='location']")?.focus(),
    );
  }
  function closeMenu(restore = true) {
    if (!mobile()) return;
    menu.classList.remove("open");
    body.classList.remove("section-menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    if (restore) (lastMenuTrigger || menuButton).focus();
  }
  function goTo(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    history.replaceState(null, "", hash);
    if (mobile()) closeMenu(false);
    requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }
  function setActive(id) {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const current = links.find((link) => link.hash === `#${id}`);
    if (!current) return;
    const details = current.closest("details");
    document
      .querySelectorAll(".chapter-details")
      .forEach((d) => (d.open = d === details));
    current.scrollIntoView({ block: "nearest" });
    const label = $("#currentSectionLabel");
    if (label)
      label.textContent =
        current.querySelector("b")?.textContent || current.textContent.trim();
  }
  async function init() {
    try {
      $("#loadingText").textContent = "Identificando participante...";
      user = await window.BC_API?.requireUser?.().catch(() => null);
      setScale(scale);
      document.querySelector(".chapter-details")?.setAttribute("open", "");
      update();
    } finally {
      setTimeout(() => {
        body.classList.add("reader-ready");
        $("#readerLoading").setAttribute("aria-busy", "false");
      }, 300);
    }
  }
  $("#fontUp").onclick = () => setScale(scale + 0.1);
  $("#fontDown").onclick = () => setScale(scale - 0.1);
  $("#fontReset").onclick = () => setScale(1);
  menuButton.onclick = () =>
    menu.classList.contains("open") ? closeMenu() : openMenu();
  menuClose?.addEventListener("click", () => closeMenu());
  backdrop?.addEventListener("click", () => closeMenu());
  links.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(link.hash);
    }),
  );
  focus.onclick = () => {
    focusOn = !focusOn;
    body.classList.toggle("focus-mode", focusOn);
    focus.setAttribute("aria-pressed", focusOn);
    say(`Modo foco ${focusOn ? "ativado" : "desativado"}`);
  };
  addEventListener(
    "pointermove",
    (e) => {
      if (focusOn) overlay.style.setProperty("--focus-y", `${e.clientY}px`);
    },
    { passive: true },
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      closeMenu();
      return;
    }
    if (e.key === "Escape" && focusOn) {
      focusOn = false;
      body.classList.remove("focus-mode");
      focus.setAttribute("aria-pressed", "false");
    }
  });
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top - 110) -
            Math.abs(b.boundingClientRect.top - 110),
        )[0];
      if (visible) setActive(visible.target.id);
    },
    { rootMargin: "-12% 0px -72%", threshold: [0, 0.01, 0.25] },
  );
  sections.forEach((s) => {
    s.setAttribute("tabindex", "-1");
    observer.observe(s);
  });
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", () => {
    update();
    if (!mobile()) {
      menu.classList.remove("open");
      body.classList.remove("section-menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
  addEventListener("pagehide", () => save(false));
  init();
})();
