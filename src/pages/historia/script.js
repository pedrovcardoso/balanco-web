(() => {
  "use strict";
  const body = document.body,
    TOTAL = Number(body.dataset.pages || 15),
    BASE = body.dataset.imageBase,
    JSON_URL = body.dataset.jsonUrl;
  const $ = (s) => document.querySelector(s),
    spread = $("#bookSpread"),
    status = $("#readerStatus"),
    prev = $("#prevPage"),
    next = $("#nextPage"),
    nextLabel = $("#nextLabel"),
    indicator = $("#pageIndicator"),
    progress = $("#progressBar"),
    panel = $("#transcriptPanel"),
    list = $("#transcriptList"),
    toggle = $("#transcriptToggle"),
    finish = $("#finishCard"),
    restart = $("#restartReading"),
    loadingText = $("#historyLoadingText"),
    loadingOverlay = $("#historyLoading"),
    fx = $("#completionFx");
  let config = { pages: [] },
    page = 1,
    user = null,
    saveTimer = 0,
    completed = false,
    pageFlip = null,
    restoredPage = 1;
  let pageWidth = 510,
    pageHeight = 720;
  const mobileQuery = matchMedia("(max-width:760px)"),
    reduceQuery = matchMedia("(prefers-reduced-motion:reduce)");
  const isMobile = () => mobileQuery.matches;
  const pd = (n) =>
    config.pages.find((p) => Number(p.page) === n) || {
      page: n,
      image: `${n}.png`,
      regions: [],
    };
  const esc = (s) =>
    String(s || "").replace(
      /[&<>\"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const imageUrl = (n) => `${BASE}${pd(n).image || `${n}.png`}`;
  const visiblePages = () =>
    isMobile() || page === TOTAL
      ? [page]
      : [page, Math.min(TOTAL, page + 1)].filter(
          (n, i, a) => a.indexOf(n) === i,
        );
  const visibleEnd = () => Math.max(...visiblePages());
  function setLoading(message) {
    loadingText.textContent = message;
    body.classList.add("history-loading");
    loadingOverlay.setAttribute("aria-busy", "true");
  }
  function finishLoading() {
    setTimeout(() => {
      body.classList.remove("history-loading");
      loadingOverlay.setAttribute("aria-busy", "false");
    }, 300);
  }
  function makePage(n) {
    const cfg = pd(n),
      section = document.createElement("section");
    section.className = "comic-page st-page";
    section.dataset.page = String(n);
    section.setAttribute("aria-label", `Página ${n}`);
    const img = document.createElement("img");
    img.src = imageUrl(n);
    img.alt = cfg.alt || `Página ${n} da história em quadrinhos`;
    img.decoding = "async";
    img.draggable = false;
    section.append(img);
    const layer = document.createElement("div");
    layer.className = "speech-layer";
    [...(cfg.regions || [])]
      .sort((a, b) => Number(a.order) - Number(b.order))
      .forEach((r, i) => {
        const el = document.createElement("button"),
          who = r.character ? `${r.character}: ` : "";
        el.type = "button";
        el.className = "speech-hotspot";
        el.style.cssText = `left:${r.x}%;top:${r.y}%;width:${r.width}%;height:${r.height}%;border-radius:${r.shape === "oval" ? "50%" : "10px"}`;
        el.setAttribute(
          "aria-label",
          `${r.typeLabel || "Trecho"} ${i + 1}: ${who}${r.text}`,
        );
        el.innerHTML = `<span class="sr-text">${esc(who + r.text)}</span>`;
        el.addEventListener("click", (e) => e.stopPropagation());
        layer.append(el);
      });
    section.append(layer);
    const number = document.createElement("span");
    number.className = "page-number";
    number.textContent = `Página ${n}`;
    section.append(number);
    return section;
  }
  function renderTranscript() {
    list.innerHTML = "";
    for (const n of visiblePages()) {
      const box = document.createElement("section");
      box.className = "transcript-page";
      box.innerHTML = `<h3><iconify-icon icon="fa6-solid:file-lines" aria-hidden="true"></iconify-icon>Página ${n}</h3>`;
      const regions = [...(pd(n).regions || [])].sort(
        (a, b) => Number(a.order) - Number(b.order),
      );
      if (!regions.length)
        box.insertAdjacentHTML(
          "beforeend",
          '<div class="transcript-empty"><iconify-icon icon="fa6-solid:circle-info" aria-hidden="true"></iconify-icon>Nenhum texto nesta página.</div>',
        );
      else {
        const ul = document.createElement("ul");
        ul.className = "transcript-items";
        for (const r of regions) {
          const li = document.createElement("li");
          li.className = "transcript-item";
          const who = r.character ? ` · ${esc(r.character)}` : "";
          li.innerHTML = `<div><span class="transcript-meta">${esc(r.typeLabel || "Texto")}${who}</span><span>${esc(r.text)}</span></div>`;
          ul.append(li);
        }
        box.append(ul);
      }
      list.append(box);
    }
  }
  function updateUi(save = true) {
    page = Math.min(TOTAL, Math.max(1, page));
    const end = visibleEnd();
    indicator.textContent =
      page === end
        ? `Página ${page} de ${TOTAL}`
        : `Páginas ${page}–${end} de ${TOTAL}`;
    prev.disabled = page <= 1;
    next.disabled = false;
    nextLabel.textContent = page >= TOTAL ? "Concluir leitura" : "Avançar";
    progress.style.width = `${Math.round((end / TOTAL) * 100)}%`;
    renderTranscript();
    if (save) scheduleSave(false);
  }
  function syncFromFlip(index) {
    page = Math.min(TOTAL, Number(index) + 1);
    completed = false;
    body.classList.remove("reader-completed");
    finish.classList.remove("open");
    updateUi(true);
  }
  function buildBook() {
    if (!window.St?.PageFlip) throw new Error("StPageFlip não foi carregado");
    spread.innerHTML = "";
    const pages = [];
    for (let n = 1; n <= TOTAL; n++) {
      const el = makePage(n);
      spread.append(el);
      pages.push(el);
    }
    pageFlip = new St.PageFlip(spread, {
      width: pageWidth,
      height: pageHeight,
      size: "stretch",
      minWidth: 220,
      maxWidth: pageWidth,
      minHeight: Math.round((220 * pageHeight) / pageWidth),
      maxHeight: pageHeight,
      showCover: false,
      usePortrait: true,
      autoSize: true,
      maxShadowOpacity: 0.35,
      mobileScrollSupport: true,
      clickEventForward: false,
      useMouseEvents: true,
      swipeDistance: 18,
      showPageCorners: false,
      disableFlipByClick: true,
      flippingTime: reduceQuery.matches ? 1 : isMobile() ? 360 : 650,
    });
    pageFlip.loadFromHTML(pages);
    pageFlip.on("flip", (e) => syncFromFlip(e.data));
    pageFlip.on("changeOrientation", () =>
      setTimeout(() => {
        page = pageFlip.getCurrentPageIndex() + 1;
        updateUi(false);
      }, 0),
    );
    pageFlip.turnToPage(Math.max(0, restoredPage - 1));
    page = restoredPage;
    updateUi(false);
  }
  function burst(n, colors) {
    if (
      reduceQuery.matches ||
      document.documentElement.classList.contains("a11y-reduced-motion")
    )
      return;
    const ctx = fx.getContext("2d"),
      dpr = Math.min(devicePixelRatio || 1, 1.5),
      w = Math.max(1, innerWidth),
      h = Math.max(1, innerHeight);
    fx.width = w * dpr;
    fx.height = h * dpr;
    fx.style.width = w + "px";
    fx.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bits = Array.from({ length: n }, () => ({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.85) * 10,
      g: 0.22 + Math.random() * 0.12,
      s: 4 + Math.random() * 8,
      r: Math.random() * 6.28,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let t = 0;
    (function loop() {
      ctx.clearRect(0, 0, w, h);
      bits.forEach((b) => {
        b.vy += b.g;
        b.x += b.vx;
        b.y += b.vy;
        b.r += 0.14;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s);
        ctx.restore();
      });
      if (++t < 62) requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, w, h);
    })();
  }
  async function completeReading() {
    if (completed) return;
    completed = true;
    body.classList.add("completion-celebrating");
    status.textContent = "";
    progress.style.width = "100%";
    const mark = document.createElement("div");
    mark.className = "completion-mark";
    mark.setAttribute("role", "status");
    mark.setAttribute("aria-label", "Leitura concluída");
    mark.innerHTML = '<iconify-icon icon="fa6-solid:check" aria-hidden="true"></iconify-icon>';
    document.body.appendChild(mark);
    requestAnimationFrame(() => mark.classList.add("show"));
    burst(28, ["#22c55e", "#f5a800", "#3b82f6"]);
    saveProgress(true);
    await new Promise((r) => setTimeout(r, reduceQuery.matches ? 20 : 620));
    mark.remove();
    body.classList.remove("completion-celebrating");
    body.classList.add("reader-completed");
    finish.classList.add("open");
    finish.scrollIntoView({
      behavior: reduceQuery.matches ? "auto" : "smooth",
      block: "center",
    });
  }
  async function loadConfig() {
    setLoading("Carregando textos e recursos de acessibilidade...");
    try {
      const response = await fetch(JSON_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const loaded = await response.json();
      if (Array.isArray(loaded.pages)) config = loaded;
    } catch (error) {
      console.warn("JSON não carregado", error);
      status.textContent = "História carregada sem a camada de transcrição.";
    }
  }
  async function restoreProgress() {
    if (!user || !window.BC_API?.getReadingProgress) return;
    try {
      const result = await BC_API.getReadingProgress(user.publicUserId, {
        trailSlug: body.dataset.trailSlug,
        readerSlug: body.dataset.readerSlug,
        totalPages: TOTAL,
      });
      const wasCompleted =
        Boolean(
          result?.completed ?? result?.isCompleted ?? result?.is_completed,
        ) || Number(result?.lastPageNumber || 0) >= TOTAL;
      if (!wasCompleted) {
        const last = Number(result?.lastPageNumber || 1);
        if (last > 1 && last < TOTAL) restoredPage = last;
      }
    } catch (error) {
      console.warn("Falha ao restaurar progresso", error);
    }
  }
  async function saveProgress(done = false) {
    if (!user || !window.BC_API?.saveReadingProgress) return;
    try {
      await BC_API.saveReadingProgress(user.publicUserId, {
        trailSlug: body.dataset.trailSlug,
        readerSlug: body.dataset.readerSlug,
        title: "História do Balanço",
        pageNumber: done ? TOTAL : visibleEnd(),
        totalPages: TOTAL,
        completed: done,
        readSeconds: 0,
      });
    } catch (error) {
      console.warn("Falha ao salvar progresso", error);
    }
  }
  function scheduleSave(done) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProgress(done), done ? 50 : 700);
  }
  async function preloadImages() {
    const images = await Promise.all(
      Array.from(
        { length: Math.min(TOTAL, 2) },
        (_, i) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = imageUrl(i + 1);
          }),
      ),
    );
    const first = images[0];
    if (first?.naturalWidth && first?.naturalHeight) {
      pageWidth = Math.min(510, first.naturalWidth);
      pageHeight = Math.round(
        (pageWidth * first.naturalHeight) / first.naturalWidth,
      );
      spread.style.setProperty(
        "--page-aspect",
        `${first.naturalWidth}/${first.naturalHeight}`,
      );
    }
  }
  async function init() {
    try {
      setLoading("Identificando participante...");
      user = await window.BC_API?.requireUser?.().catch(() => null);
      await loadConfig();
      setLoading("Recuperando seu progresso...");
      await restoreProgress();
      setLoading("Carregando as primeiras páginas...");
      await preloadImages();
      setLoading("Montando o livro interativo...");
      buildBook();
      finishLoading();
    } catch (error) {
      console.error(error);
      spread.innerHTML =
        '<div class="load-error">Não foi possível iniciar a história.</div>';
      status.textContent = "Falha ao carregar a história.";
      finishLoading();
    }
  }
  function goNext() {
    if (page >= TOTAL) {
      completeReading();
      return;
    }
    pageFlip?.flipNext();
  }
  function goPrev() {
    if (completed) {
      completed = false;
      body.classList.remove("reader-completed");
      finish.classList.remove("open");
    }
    pageFlip?.flipPrev();
  }
  next.onclick = goNext;
  prev.onclick = goPrev;
  restart.onclick = () => {
    completed = false;
    body.classList.remove("reader-completed");
    finish.classList.remove("open");
    pageFlip?.turnToPage(0);
    page = 1;
    updateUi();
  };
  toggle.onclick = () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };
  addEventListener("keydown", (event) => {
    if (/input|textarea|select|button/i.test(event.target.tagName)) return;
    if (event.key === "ArrowRight") goNext();
    if (event.key === "ArrowLeft") goPrev();
  });
  addEventListener("pagehide", () => saveProgress(completed));
  init();
})();
