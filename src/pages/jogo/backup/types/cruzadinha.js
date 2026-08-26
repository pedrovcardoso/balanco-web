(() => {
  "use strict";
  window.BC_GAME_TYPES = window.BC_GAME_TYPES || {};
  const parseJson = (value, fallback = {}) => { if (!value) return fallback; if (typeof value === "object") return value; try { return JSON.parse(value); } catch { return fallback; } };
  const strip = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize = value => strip(value).toUpperCase().replace(/[^A-Z]/g, "");
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const emit = (name, detail) => dispatchEvent(new CustomEvent(name, { detail }));
  const icon = name => `<iconify-icon icon="${name}" aria-hidden="true"></iconify-icon>`;

  function normalizeRows(rows) {
    return (rows || []).map((row, index) => {
      const metadata = parseJson(row.metadataJson || row.metadata_json || row.metadata, {});
      const answerRaw = metadata.word || metadata.answer || row.correctAnswer || row.correct_answer || "";
      const answer = normalize(answerRaw);
      return {
        answer,
        label: metadata.label || answerRaw,
        clue: metadata.clue || row.prompt || row.simpleExplanation || row.simple_explanation || `Termo ${index + 1}`,
        explanation: row.simpleExplanation || row.simple_explanation || metadata.explanation || metadata.description || ""
      };
    }).filter(item => item.answer.length >= 3 && item.answer.length <= 14).slice(0, 10);
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const random = Math.floor(Math.random() * (index + 1));
      [result[index], result[random]] = [result[random], result[index]];
    }
    return result;
  }

  function buildLayout(source) {
    const size = 15, grid = Array.from({ length: size }, () => Array(size).fill(null));
    const words = [...source].sort((a, b) => b.answer.length - a.answer.length);
    const placed = [];
    const center = Math.floor(size / 2);

    function canPlace(word, row, col, direction) {
      const dr = direction === "down" ? 1 : 0, dc = direction === "across" ? 1 : 0;
      const endRow = row + dr * (word.length - 1), endCol = col + dc * (word.length - 1);
      if (row < 0 || col < 0 || endRow >= size || endCol >= size) return null;
      let crosses = 0;
      const cells = [];
      for (let index = 0; index < word.length; index++) {
        const r = row + dr * index, c = col + dc * index, current = grid[r][c];
        if (current && current.letter !== word[index]) return null;
        if (current) crosses++;
        if (!current) {
          const adjacent = direction === "across" ? [[r - 1, c], [r + 1, c]] : [[r, c - 1], [r, c + 1]];
          if (adjacent.some(([ar, ac]) => ar >= 0 && ac >= 0 && ar < size && ac < size && grid[ar][ac])) return null;
        }
        cells.push([r, c]);
      }
      const before = [row - dr, col - dc], after = [endRow + dr, endCol + dc];
      if ([before, after].some(([r, c]) => r >= 0 && c >= 0 && r < size && c < size && grid[r][c])) return null;
      return { cells, crosses };
    }

    function commit(item, row, col, direction, cells) {
      const id = placed.length;
      cells.forEach(([r, c], index) => {
        if (!grid[r][c]) grid[r][c] = { letter: item.answer[index], words: [] };
        grid[r][c].words.push(id);
      });
      placed.push({ ...item, row, col, direction, cells, id });
    }

    const first = words.shift();
    const firstCol = Math.max(0, center - Math.floor(first.answer.length / 2));
    const firstCheck = canPlace(first.answer, center, firstCol, "across");
    commit(first, center, firstCol, "across", firstCheck.cells);

    for (const item of words) {
      const candidates = [];
      for (const existing of placed) {
        for (let a = 0; a < item.answer.length; a++) {
          for (let b = 0; b < existing.answer.length; b++) {
            if (item.answer[a] !== existing.answer[b]) continue;
            const direction = existing.direction === "across" ? "down" : "across";
            const cross = existing.cells[b];
            const row = cross[0] - (direction === "down" ? a : 0);
            const col = cross[1] - (direction === "across" ? a : 0);
            const check = canPlace(item.answer, row, col, direction);
            if (check && check.crosses > 0) candidates.push({ row, col, direction, ...check });
          }
        }
      }
      if (candidates.length) {
        candidates.sort((a, b) => b.crosses - a.crosses || Math.random() - .5);
        const selected = candidates[0];
        commit(item, selected.row, selected.col, selected.direction, selected.cells);
      }
    }

    if (placed.length < 3) return null;
    let minRow = size, maxRow = 0, minCol = size, maxCol = 0;
    placed.flatMap(word => word.cells).forEach(([r, c]) => { minRow = Math.min(minRow, r); maxRow = Math.max(maxRow, r); minCol = Math.min(minCol, c); maxCol = Math.max(maxCol, c); });
    placed.sort((a, b) => a.row - b.row || a.col - b.col || (a.direction === "across" ? -1 : 1));
    placed.forEach((word, index) => word.number = index + 1);
    return { grid, placed, bounds: { minRow, maxRow, minCol, maxCol } };
  }

  window.BC_GAME_TYPES.cruzadinha = ({ phase, mount, arena }) => {
    const source = normalizeRows(phase.rows);
    if (source.length < 3) throw new Error("Termos insuficientes para montar a cruzadinha. Cadastre pelo menos 3 respostas.");
    let layout = null;
    for (let attempt = 0; attempt < 12 && !layout; attempt++) layout = buildLayout(shuffle(source));
    if (!layout) throw new Error("Não foi possível montar uma cruzadinha válida com os termos cadastrados.");

    const { grid, placed, bounds } = layout;
    const state = { values: new Map(), activeWord: placed[0].id, activeCell: 0, hints: 0, errors: 0, score: 100, finished: false, resize: null };
    const cellKey = (row, col) => `${row},${col}`;
    const completedWords = () => placed.filter(word => word.cells.every(([r, c], index) => state.values.get(cellKey(r, c)) === word.answer[index]));

    function updateState() {
      const complete = completedWords().length;
      state.score = Math.max(0, 100 - state.hints * 10);
      emit("bc-game:state", { score: state.score, attempts: `${complete}/${placed.length}`, itemsCount: state.hints, progress: Math.round(complete / placed.length * 100) });
    }

    function render() {
      updateState();
      const rows = bounds.maxRow - bounds.minRow + 1, cols = bounds.maxCol - bounds.minCol + 1;
      const starts = new Map();
      placed.forEach(word => starts.set(cellKey(word.row, word.col), word.number));
      const cells = [];
      for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
        for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
          const data = grid[row][col];
          if (!data) { cells.push('<div aria-hidden="true"></div>'); continue; }
          const key = cellKey(row, col), value = state.values.get(key) || "", number = starts.get(key) || "";
          cells.push(`<button type="button" tabindex="-1" class="crossCell relative grid aspect-square min-h-0 min-w-0 place-items-center rounded-[5px] border border-[#5d2b0a]/20 bg-white/75 font-display text-[clamp(.72rem,3.1vw,1.1rem)] font-bold uppercase text-[#5d2b0a] shadow-sm" data-row="${row}" data-col="${col}" aria-label="${number ? `Início ${number}. ` : ""}Letra ${value || "vazia"}">${number ? `<span class="crossNumber">${number}</span>` : ""}<span>${value}</span></button>`);
        }
      }
      const clues = ["across", "down"].map(direction => `<section><h3 class="mb-1 font-display text-base font-bold text-[#5d2b0a]">${direction === "across" ? "Horizontais" : "Verticais"}</h3><div class="grid gap-1">${placed.filter(word => word.direction === direction).map(word => `<button type="button" tabindex="-1" class="crossClue rounded-xl border border-transparent bg-white/40 px-2 py-1.5 text-left text-xs font-black leading-tight text-[#5d2b0a]" data-word="${word.id}"><b>${word.number}.</b> ${escapeHtml(word.clue)}</button>`).join("")}</div></section>`).join("");
      const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
      const keyboard = keyboardRows.map((row, index) => `<div class="flex justify-center gap-1 ${index === 2 ? "px-5" : ""}">${[...row].map(letter => `<button type="button" tabindex="-1" class="crossKeyboardKey grid h-9 min-w-0 flex-1 place-items-center rounded-lg border border-[#5d2b0a]/15 bg-[#fff7dc] font-display text-sm font-bold text-[#5d2b0a] shadow-[0_3px_0_rgba(93,43,10,.14)]" data-key="${letter}">${letter}</button>`).join("")}</div>`).join("");
      mount.innerHTML = `<article class="mx-auto flex w-[min(100%,850px)] select-none flex-col gap-2 px-3 pb-28 pt-3 max-[560px]:px-3"><div class="flex flex-wrap items-center justify-between gap-2 pr-3"><div class="inline-flex items-center gap-1.5 rounded-full bg-wine/90 px-3 py-2 text-xs font-black uppercase tracking-wider text-white">${icon("fa6-solid:table-cells")} cruzadinha</div><button id="crossHint" type="button" tabindex="0" class="mr-1 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-gold to-[#c0272d] px-3 py-2 text-xs font-black text-white shadow-lg">${icon("fa6-solid:lightbulb")} Dica</button></div><div class="font-display text-[clamp(1.05rem,4.8vw,1.65rem)] font-bold leading-none text-[#5d2b0a]">Complete os termos usando as pistas.</div><div class="grid min-h-0 gap-3 lg:grid-cols-[minmax(300px,520px)_minmax(220px,1fr)]"><div><div id="crossGrid" class="mx-auto grid w-full max-w-[520px] gap-0.5 rounded-[20px] bg-[#5d2b0a]/10 p-1.5 shadow-lg" style="grid-template-columns:repeat(${cols},minmax(0,1fr));grid-template-rows:repeat(${rows},minmax(0,1fr))">${cells.join("")}</div><div id="crossKeyboard" class="crossKeyboardPanel sticky bottom-0 z-20 mt-3 grid gap-1 rounded-2xl border border-white/70 bg-[#fdf6e3]/95 p-1.5 shadow-2xl backdrop-blur-xl"><div id="crossActiveClue" class="crossActiveClue mb-1 flex items-center rounded-xl bg-white/55 px-2.5 py-2 text-xs font-black leading-tight text-[#5d2b0a]"></div>${keyboard}<div class="mt-0.5 flex justify-center gap-1"><button type="button" tabindex="-1" class="crossKeyboardKey inline-flex h-9 flex-[2] items-center justify-center gap-1 rounded-lg bg-[#5d2b0a]/10 px-3 text-xs font-black text-[#5d2b0a]" data-key="BACKSPACE"><span class="inline-flex items-center gap-1">${icon("fa6-solid:delete-left")}<span>Apagar</span></span></button><button type="button" tabindex="-1" class="crossKeyboardKey inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#5d2b0a]/10 text-xs font-black text-[#5d2b0a]" data-key="PREV" aria-label="Palavra ou letra anterior">${icon("fa6-solid:chevron-left")}</button><button type="button" tabindex="-1" class="crossKeyboardKey inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#5d2b0a]/10 text-xs font-black text-[#5d2b0a]" data-key="NEXT" aria-label="Próxima palavra ou letra">${icon("fa6-solid:chevron-right")}</button></div></div></div><div id="crossCluesPanel" class="grid content-start gap-3 rounded-3xl bg-white/25 p-3 sm:grid-cols-2 lg:grid-cols-1">${clues}<button id="crossKeyboardToggle" type="button" class="crossKeyboardToggle hidden min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#5d2b0a]/15 bg-white/45 px-4 py-3 font-black text-[#5d2b0a] transition hover:bg-white/70" aria-controls="crossKeyboard" aria-expanded="false">${icon("fa6-solid:keyboard")} Exibir teclado</button></div></div></article>`;
      ensureToast(); bind(); paintState(); validateRealtime();
      const initialCell = mount.querySelector(".crossCell.is-active");
      initialCell?.setAttribute("aria-current", "true");
      requestAnimationFrame(() => initialCell?.focus({ preventScroll: true }));
    }

    function activeWord() { return placed.find(word => word.id === state.activeWord) || placed[0]; }
    function selectWord(id, cellIndex = 0, focusCell = true) {
      state.activeWord = Number(id);
      state.activeCell = Math.max(0, cellIndex);
      paintState();
      if (focusCell) requestAnimationFrame(() => mount.querySelector(".crossCell.is-active")?.focus({ preventScroll: true }));
    }
    function paintState() {
      const word = activeWord(), completed = new Set(completedWords().map(item => item.id));
      mount.querySelectorAll(".crossCell").forEach(cell => { cell.classList.remove("is-active", "is-word", "crossPulseHint"); cell.setAttribute("tabindex", "-1"); });
      mount.querySelectorAll(".crossClue").forEach(clue => { const id = Number(clue.dataset.word); clue.classList.toggle("is-active", id === word.id); clue.classList.toggle("is-done", completed.has(id)); });
      word.cells.forEach(([r, c], index) => {
        const cell = mount.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        cell?.classList.add("is-word");
        if (index === state.activeCell) { cell?.classList.add("is-active"); cell?.setAttribute("tabindex", "0"); }
      });
      const activeClue = mount.querySelector("#crossActiveClue");
      if (activeClue) activeClue.innerHTML = `<span class="mr-1.5 grid size-6 shrink-0 place-items-center rounded-lg bg-wine text-[.68rem] text-white">${word.number}</span><span>${escapeHtml(word.clue)}</span>`;
    }
    function focusActiveCell() {
      requestAnimationFrame(() => mount.querySelector(".crossCell.is-active")?.focus({ preventScroll: true }));
    }
    function adjacentWord(delta, focusCell = true) {
      const currentIndex = placed.findIndex(word => word.id === state.activeWord);
      const nextIndex = (currentIndex + delta + placed.length) % placed.length;
      const word = placed[nextIndex];
      state.activeWord = word.id;
      state.activeCell = 0;
      paintState();
      if (focusCell) focusActiveCell();
    }
    function move(delta, focusCell = true) {
      const word = activeWord(), next = state.activeCell + delta;
      if (next < 0) return adjacentWord(-1, focusCell);
      if (next >= word.cells.length) return adjacentWord(1, focusCell);
      state.activeCell = next;
      paintState();
      if (focusCell) focusActiveCell();
    }
    function enterLetter(letter) {
      const clean = normalize(letter).slice(0, 1); if (!clean || state.finished) return;
      const word = activeWord(), [r, c] = word.cells[state.activeCell], key = cellKey(r, c);
      state.values.set(key, clean); const target = mount.querySelector(`[data-row="${r}"][data-col="${c}"] span:last-child`); if (target) target.textContent = clean;
      validateRealtime();
      move(1);
    }
    function ensureToast() {
      let toast = document.getElementById("crossToast");
      if (!toast) {
        toast = document.createElement("div"); toast.id = "crossToast";
        toast.className = "fixed bottom-[max(18px,env(safe-area-inset-bottom))] left-1/2 z-[99999] hidden w-[min(92vw,430px)] -translate-x-1/2 rounded-3xl border-2 border-gold/60 bg-[#fff7dc] px-4 py-3 text-center font-black text-[#5d2b0a] shadow-2xl";
        document.body.appendChild(toast);
      }
      return toast;
    }
    function showToast(message) { const toast = ensureToast(); toast.textContent = message; toast.classList.remove("hidden"); clearTimeout(toast._timer); toast._timer = setTimeout(() => toast.classList.add("hidden"), 3000); }
    function feedbackKey(key) {
      const normalizedKey = String(key).toUpperCase();
      const button = mount.querySelector(`[data-key="${normalizedKey}"]`);
      if (!button) return;
      button.classList.remove("is-pressed");
      void button.offsetWidth;
      button.classList.add("is-pressed");
      clearTimeout(button._feedbackTimer);
      button._feedbackTimer = setTimeout(() => button.classList.remove("is-pressed"), 150);
    }
    function hint() {
      const word = activeWord();
      const candidates = word.cells.map(([r, c], index) => ({ r, c, index })).filter(({ r, c, index }) => state.values.get(cellKey(r, c)) !== word.answer[index]);
      const selected = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : { ...word.cells.map(([r, c], index) => ({ r, c, index }))[Math.floor(Math.random() * word.cells.length)] };
      const { r, c, index } = selected;
      state.values.set(cellKey(r, c), word.answer[index]); state.hints++; state.activeCell = index;
      const cell = mount.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      const letter = cell?.querySelector("span:last-child");
      if (letter) { letter.textContent = word.answer[index]; letter.style.opacity = "1"; }
      updateState(); validateRealtime();
      cell?.classList.add("crossPulseHint");
      focusActiveCell();
      showToast("Dica usada: uma letra foi preenchida e 10 pontos foram descontados.");
    }
    function validateRealtime() {
      let allCorrect = true;
      mount.querySelectorAll(".crossCell").forEach(cell => cell.classList.remove("is-correct", "is-wrong"));
      placed.forEach(word => {
        const complete = word.cells.every(([r, c]) => Boolean(state.values.get(cellKey(r, c))));
        const correct = complete && word.cells.every(([r, c], index) => state.values.get(cellKey(r, c)) === word.answer[index]);
        if (!correct) allCorrect = false;
        if (complete) word.cells.forEach(([r, c]) => mount.querySelector(`[data-row="${r}"][data-col="${c}"]`)?.classList.add(correct ? "is-correct" : "is-wrong"));
      });
      updateState(); paintState();
      if (allCorrect && !state.finished) finish();
    }
    function erase() {
      if (state.finished) return;
      const word = activeWord(), [r, c] = word.cells[state.activeCell], key = cellKey(r, c);
      state.values.delete(key);
      const target = mount.querySelector(`[data-row="${r}"][data-col="${c}"] span:last-child`);
      if (target) target.textContent = "";
      validateRealtime();
      move(-1);
    }
    function finish() {
      if (state.finished) return; state.finished = true; updateState();
      const toast = document.getElementById("crossToast");
      if (toast) { clearTimeout(toast._timer); toast.remove(); }
      emit("bc-game:complete", { celebrate: true, score: state.score, attempts: 1, correctCount: placed.length, totalCount: placed.length, hintsUsed: state.hints, answers: { words: placed.map(word => word.answer), hints: state.hints }, progress: 100 });
    }
    function bind() {
      mount.querySelectorAll(".crossClue").forEach(button => button.addEventListener("click", () => selectWord(button.dataset.word)));
      mount.querySelectorAll(".crossCell").forEach(cell => {
        cell.addEventListener("click", () => {
          const row = Number(cell.dataset.row), col = Number(cell.dataset.col), owners = grid[row][col].words;
          const current = owners.includes(state.activeWord) ? state.activeWord : owners[0];
          const word = placed.find(item => item.id === current), index = word.cells.findIndex(([r, c]) => r === row && c === col);
          selectWord(current, index);
        });
      });
      mount.querySelectorAll("[data-key]").forEach(button => button.addEventListener("click", () => {
        const key = button.dataset.key;
        feedbackKey(key);
        if (key === "BACKSPACE") erase();
        else if (key === "PREV") move(-1);
        else if (key === "NEXT") move(1);
        else enterLetter(key);
      }));
      mount.querySelector("#crossHint").addEventListener("click", hint);
      const keyboardToggle = mount.querySelector("#crossKeyboardToggle");
      const keyboardPanel = mount.querySelector("#crossKeyboard");
      const keyboardMobileHome = keyboardPanel?.parentElement;
      const cluesPanel = mount.querySelector("#crossCluesPanel");
      const desktopKeyboard = matchMedia("(min-width: 768px)");
      const placeKeyboard = () => {
        const desktop = desktopKeyboard.matches;
        if (desktop && cluesPanel && keyboardToggle && keyboardPanel) {
          const layout = cluesPanel.parentElement;
          layout?.insertAdjacentElement("afterend", keyboardPanel);
          keyboardPanel.classList.remove("is-open");
          keyboardToggle.setAttribute("aria-expanded", "false");
          keyboardToggle.innerHTML = `${icon("fa6-solid:keyboard")} Exibir teclado`;
        } else if (!desktop && keyboardMobileHome && keyboardPanel) {
          keyboardMobileHome.appendChild(keyboardPanel);
          keyboardPanel.classList.remove("is-open");
        }
      };
      placeKeyboard();
      desktopKeyboard.addEventListener?.("change", placeKeyboard);
      state.keyboardMedia = desktopKeyboard;
      state.keyboardLayout = placeKeyboard;
      keyboardToggle?.addEventListener("click", () => {
        const open = keyboardPanel.classList.toggle("is-open");
        keyboardToggle.setAttribute("aria-expanded", String(open));
        keyboardToggle.innerHTML = `${icon("fa6-solid:keyboard")} ${open ? "Ocultar teclado" : "Exibir teclado"}`;
      });
      mount.tabIndex = -1;
      mount.addEventListener("keydown", event => {
        if (/^[a-zA-Z]$/.test(event.key)) {
          event.preventDefault(); feedbackKey(event.key); enterLetter(event.key);
        } else if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault(); feedbackKey("BACKSPACE"); erase();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault(); feedbackKey("PREV"); move(-1);
        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault(); feedbackKey("NEXT"); move(1);
        } else if (event.key === "Tab") {
          event.preventDefault();
          adjacentWord(event.shiftKey ? -1 : 1);
        }
      });
    }

    return {
      title: phase.title || "Cruzadinha",
      subtitle: phase.subtitle || "Complete os termos da fase",
      prompt: `Use as pistas para preencher ${placed.length} palavras conectadas.`,
      icon: "fa6-solid:table-cells",
      itemsCount: placed.length,
      initialScore: 100,
      initialAttempts: `0/${placed.length}`,
      initialItemsCount: 0,
      hudLabels: { score: "nota", attempts: "palavras", itemsCount: "dicas" },
      actionLabel: "",
      instructions: [
        { icon: "fa6-solid:list-ol", text: "Selecione uma pista horizontal ou vertical." },
        { icon: "fa6-solid:keyboard", text: "Use o teclado do jogo para preencher os quadrados." },
        { icon: "fa6-solid:lightbulb", text: "Cada dica preenche uma letra e reduz 10 pontos." }
      ],
      start() { render(); },
      destroy() {
        if (state.keyboardMedia && state.keyboardLayout) state.keyboardMedia.removeEventListener?.("change", state.keyboardLayout);
        const toast = document.getElementById("crossToast");
        if (toast) { clearTimeout(toast._timer); toast.remove(); }
      }
    };
  };
})();
