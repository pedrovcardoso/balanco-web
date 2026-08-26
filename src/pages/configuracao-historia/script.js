(() => {
  "use strict";
  const N = Number(document.body.dataset.pages || 15),
    BASE = document.body.dataset.imageBase,
    KEY = "bc_historia_mapping_v4";
  const TYPES = {
    title: "Título",
    narration: "Narração",
    speech: "Balão de fala",
    sound: "Efeito sonoro",
    other: "Outro texto",
  };
  const $ = (s) => document.querySelector(s),
    sel = $("#pageSelect"),
    img = $("#image"),
    layer = $("#layer"),
    viewport = $("#viewport"),
    alt = $("#pageAlt"),
    text = $("#text"),
    order = $("#order"),
    character = $("#character"),
    characterOptions = $("#characterOptions"),
    characterField = $("#characterField"),
    badge = $("#badge"),
    list = $("#regionList"),
    count = $("#count"),
    status = $("#status"),
    editor = $("#floatingEditor"),
    typeButtons = $("#typeButtons"),
    shapeButtons = $("#shapeButtons");
  let data = normalize(load() || initial()),
    page = 1,
    selected = null,
    gesture = null,
    editorRaf = 0;
  function initial() {
    return {
      version: 4,
      title: "História do Balanço",
      totalPages: N,
      imageBase: "assets/images/historia/",
      characters: [],
      pages: Array.from({ length: N }, (_, i) => ({
        page: i + 1,
        image: `${i + 1}.png`,
        alt: `Página ${i + 1} da história em quadrinhos`,
        regions: [],
      })),
    };
  }
  function load() {
    for (const key of [
      KEY,
      "bc_historia_mapping_v3",
      "bc_historia_mapping_v2",
      "bc_historia_mapping_v1",
    ]) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        if (value) return value;
      } catch {}
    }
    return null;
  }
  function normalize(d) {
    d.version = 4;
    d.totalPages = N;
    d.characters = Array.isArray(d.characters) ? d.characters : [];
    d.pages = Array.isArray(d.pages) ? d.pages.filter((p) => +p.page <= N) : [];
    for (let n = 1; n <= N; n++) {
      let p = d.pages.find((x) => +x.page === n);
      if (!p) {
        p = {
          page: n,
          image: `${n}.png`,
          alt: `Página ${n} da história em quadrinhos`,
          regions: [],
        };
        d.pages.push(p);
      }
      p.regions = Array.isArray(p.regions) ? p.regions : [];
      p.regions.forEach((r) => {
        if (["speech-oval", "speech-round", "thought"].includes(r.type))
          r.type = "speech";
        r.type = TYPES[r.type] ? r.type : "other";
        r.typeLabel = TYPES[r.type];
        r.shape = r.shape || (r.type === "speech" ? "oval" : "rectangle");
        r.character = r.character || "";
      });
    }
    refreshCharacters(d);
    return d;
  }
  function refreshCharacters(target = data) {
    const names = new Set((target.characters || []).filter(Boolean));
    for (const p of target.pages || [])
      for (const r of p.regions || [])
        if (r.character?.trim()) names.add(r.character.trim());
    target.characters = [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  function persist(msg = "Alteração salva automaticamente.") {
    refreshCharacters();
    localStorage.setItem(KEY, JSON.stringify(data));
    status.textContent = msg;
    renderCharacterOptions();
  }
  function pd() {
    return data.pages.find((p) => +p.page === page);
  }
  function makeId() {
    return `pag-${page}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function point(e) {
    const r = layer.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - r.left) / r.width) * 100, 0, 100),
      y: clamp(((e.clientY - r.top) / r.height) * 100, 0, 100),
    };
  }
  function current() {
    return pd().regions.find((r) => r.id === selected);
  }
  function renderPage() {
    selected = null;
    closeEditor();
    sel.value = page;
    $("#prevPage").disabled = page <= 1;
    $("#nextPage").disabled = page >= N;
    img.src = `${BASE}${pd().image}`;
    img.alt = `Página ${page} para mapeamento`;
    alt.value = pd().alt || "";
    render();
    fill();
  }
  function render() {
    layer.innerHTML = "";
    const regions = [...pd().regions].sort((a, b) => a.order - b.order);
    regions.forEach((r) => {
      const el = document.createElement("div");
      el.className = `region${r.id === selected ? " selected" : ""}`;
      el.dataset.id = r.id;
      el.dataset.shape = r.shape;
      el.style.cssText = `left:${r.x}%;top:${r.y}%;width:${r.width}%;height:${r.height}%`;
      el.innerHTML = `<span class="region-number">${r.order}</span><span class="resize-handle"></span>`;
      layer.append(el);
    });
    list.innerHTML = "";
    count.textContent = `${regions.length} ${regions.length === 1 ? "região" : "regiões"}`;
    regions.forEach((r) => {
      const li = document.createElement("li");
      li.classList.toggle("selected", r.id === selected);
      const btn = document.createElement("button");
      const who = r.character ? ` · ${escapeHtml(r.character)}` : "";
      btn.innerHTML = `<strong>${r.order}. ${TYPES[r.type]}${who}</strong><small>${escapeHtml(r.text || "Sem texto")}</small>`;
      btn.onclick = () => selectRegion(r.id, true);
      li.append(btn);
      list.append(li);
    });
  }
  function escapeHtml(v) {
    return String(v).replace(
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
  }
  function renderCharacterOptions() {
    characterOptions.innerHTML = "";
    for (const name of data.characters) {
      const option = document.createElement("option");
      option.value = name;
      characterOptions.append(option);
    }
  }
  function setActive(container, value) {
    container
      .querySelectorAll("button[data-value]")
      .forEach((btn) =>
        btn.classList.toggle("active", btn.dataset.value === value),
      );
  }
  function fill() {
    const r = current();
    if (!r) return;
    badge.textContent = `Ordem ${r.order}`;
    text.value = r.text || "";
    order.value = r.order;
    character.value = r.character || "";
    setActive(typeButtons, r.type);
    setActive(shapeButtons, r.shape);
    characterField.classList.toggle("is-hidden", r.type !== "speech");
  }
  function selectRegion(id, focusText = false) {
    selected = id;
    render();
    fill();
    openEditor(focusText);
  }
  function scheduleEditorPosition() {
    if (editorRaf) return;
    editorRaf = requestAnimationFrame(() => {
      editorRaf = 0;
      positionEditor();
    });
  }
  function positionEditor() {
    if (editor.hidden || !selected) return;
    const box = layer.querySelector(`[data-id="${CSS.escape(selected)}"]`);
    if (!box) return;
    const r = box.getBoundingClientRect(),
      w = editor.offsetWidth,
      h = editor.offsetHeight,
      gap = 12,
      pad = 10;
    let left = r.right + gap,
      top = r.top;
    if (left + w > innerWidth - pad) left = r.left - w - gap;
    if (left < pad) left = clamp(r.left, pad, innerWidth - w - pad);
    top = clamp(top, pad, innerHeight - h - pad);
    editor.style.left = `${left}px`;
    editor.style.top = `${top}px`;
  }
  function openEditor(focusText = false) {
    if (!selected) return;
    editor.hidden = false;
    renderCharacterOptions();
    scheduleEditorPosition();
    if (focusText) setTimeout(() => text.focus(), 0);
  }
  function closeEditor() {
    editor.hidden = true;
    editor.style.left = "";
    editor.style.top = "";
  }
  function reorderTo(region, target) {
    const items = pd().regions.sort((a, b) => a.order - b.order),
      old = items.indexOf(region),
      next = clamp(Number(target) || 1, 1, items.length);
    items.splice(old, 1);
    items.splice(next - 1, 0, region);
    items.forEach((item, index) => (item.order = index + 1));
  }
  function saveSimple() {
    const r = current();
    if (!r) return;
    r.text = text.value;
    r.character = r.type === "speech" ? character.value.trim() : "";
    persist();
    render();
  }
  function changeOrder(target) {
    const r = current();
    if (!r) return;
    reorderTo(r, target);
    persist("Ordem atualizada.");
    render();
    fill();
    scheduleEditorPosition();
  }
  typeButtons.onclick = (e) => {
    const btn = e.target.closest("button[data-value]");
    if (!btn) return;
    const r = current();
    r.type = btn.dataset.value;
    r.typeLabel = TYPES[r.type];
    if (r.type === "speech" && !r.shape) r.shape = "oval";
    if (r.type !== "speech") r.character = "";
    persist("Tipo atualizado.");
    render();
    fill();
    scheduleEditorPosition();
  };
  shapeButtons.onclick = (e) => {
    const btn = e.target.closest("button[data-value]");
    if (!btn) return;
    const r = current();
    r.shape = btn.dataset.value;
    persist("Formato atualizado.");
    render();
    fill();
    scheduleEditorPosition();
  };
  text.oninput = saveSimple;
  character.oninput = saveSimple;
  character.onchange = saveSimple;
  order.onchange = () => changeOrder(order.value);
  order.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      changeOrder(order.value);
    }
  };
  $("#orderDown").onclick = () => changeOrder(current().order - 1);
  $("#orderUp").onclick = () => changeOrder(current().order + 1);
  layer.onpointerdown = (e) => {
    const box = e.target.closest(".region"),
      p = point(e);
    if (box) {
      selected = box.dataset.id;
      const r = current();
      gesture = {
        mode: e.target.classList.contains("resize-handle") ? "resize" : "move",
        start: p,
        initial: { ...r },
      };
      render();
      fill();
      openEditor(false);
    } else {
      const r = {
        id: makeId(),
        type: "speech",
        typeLabel: TYPES.speech,
        character: "",
        shape: "oval",
        order: pd().regions.length + 1,
        text: "",
        x: p.x,
        y: p.y,
        width: 0.1,
        height: 0.1,
      };
      pd().regions.push(r);
      selected = r.id;
      gesture = { mode: "create", start: p, initial: { ...r } };
      render();
      fill();
      openEditor(false);
    }
    layer.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  layer.onpointermove = (e) => {
    if (!gesture) return;
    const p = point(e),
      r = current();
    if (gesture.mode === "create") {
      r.x = Math.min(gesture.start.x, p.x);
      r.y = Math.min(gesture.start.y, p.y);
      r.width = Math.max(1, Math.abs(p.x - gesture.start.x));
      r.height = Math.max(1, Math.abs(p.y - gesture.start.y));
    } else if (gesture.mode === "move") {
      r.x = clamp(gesture.initial.x + p.x - gesture.start.x, 0, 100 - r.width);
      r.y = clamp(gesture.initial.y + p.y - gesture.start.y, 0, 100 - r.height);
    } else {
      r.width = clamp(
        gesture.initial.width + p.x - gesture.start.x,
        1,
        100 - r.x,
      );
      r.height = clamp(
        gesture.initial.height + p.y - gesture.start.y,
        1,
        100 - r.y,
      );
    }
    render();
    scheduleEditorPosition();
  };
  layer.onpointerup = () => {
    if (!gesture) return;
    gesture = null;
    persist();
    render();
    fill();
    openEditor(true);
  };
  alt.oninput = () => {
    pd().alt = alt.value;
    persist("Descrição salva automaticamente.");
  };
  $("#deleteBtn").onclick = () => {
    if (!selected) return;
    pd().regions = pd().regions.filter((r) => r.id !== selected);
    pd()
      .regions.sort((a, b) => a.order - b.order)
      .forEach((r, i) => (r.order = i + 1));
    selected = null;
    closeEditor();
    persist("Região excluída.");
    render();
  };
  $("#closeEditor").onclick = closeEditor;
  $("#clearBtn").onclick = () => {
    if (confirm(`Limpar a página ${page}?`)) {
      pd().regions = [];
      selected = null;
      closeEditor();
      persist("Página limpa.");
      render();
    }
  };
  function json() {
    refreshCharacters();
    data.totalPages = N;
    data.pages.sort((a, b) => a.page - b.page);
    data.pages.forEach((p) => p.regions.sort((a, b) => a.order - b.order));
    return JSON.stringify(data, null, 2);
  }
  $("#copyBtn").onclick = async () => {
    const value = json();
    try {
      await navigator.clipboard.writeText(value);
      persist("JSON copiado para a área de transferência.");
    } catch {
      const t = document.createElement("textarea");
      t.value = value;
      document.body.append(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      persist(ok ? "JSON copiado." : "Falha ao copiar.");
    }
  };
  $("#downloadBtn").onclick = () => {
    const blob = new Blob([json()], { type: "application/json;charset=utf-8" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "historia.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    persist("historia.json gerado.");
  };
  $("#importBtn").onclick = () => $("#importFile").click();
  $("#importFile").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      data = normalize(JSON.parse(await f.text()));
      persist("JSON importado.");
      renderPage();
    } catch (x) {
      alert(`Falha ao importar: ${x.message}`);
    }
    e.target.value = "";
  };
  for (let n = 1; n <= N; n++) {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = `Página ${n}`;
    sel.append(o);
  }
  sel.onchange = () => {
    page = +sel.value;
    renderPage();
  };
  $("#prevPage").onclick = () => {
    if (page > 1) {
      page--;
      renderPage();
    }
  };
  $("#nextPage").onclick = () => {
    if (page < N) {
      page++;
      renderPage();
    }
  };
  addEventListener("resize", scheduleEditorPosition, { passive: true });
  viewport.addEventListener("scroll", scheduleEditorPosition, {
    passive: true,
  });
  addEventListener("scroll", scheduleEditorPosition, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEditor();
  });
  renderCharacterOptions();
  renderPage();
})();
