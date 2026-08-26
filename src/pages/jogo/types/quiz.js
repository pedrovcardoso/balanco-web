(() => {
  "use strict";
  window.BC_GAME_TYPES = window.BC_GAME_TYPES || {};
  const parseJson = (value, fallback = null) => { if (!value) return fallback; if (typeof value === "object") return value; try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const emit = (name, detail) => dispatchEvent(new CustomEvent(name, { detail }));
  const icon = name => `<iconify-icon icon="${name}" aria-hidden="true"></iconify-icon>`;
  const letters = index => "ABCDE"[index] || String(index + 1);

  function normalizeRows(rows) {
    return (rows || []).map((row, index) => {
      const metadata = parseJson(row.metadataJson || row.metadata_json || row.metadata, {}) || {};
      let options = parseJson(row.optionsJson || row.options_json || metadata.options, []);
      if (!Array.isArray(options)) options = [];
      const rawAnswer = metadata.answer ?? row.correctAnswer ?? row.correct_answer ?? 0;
      let answer = Number(rawAnswer);
      if (!Number.isFinite(answer)) answer = Math.max(0, options.findIndex(option => String(option) === String(rawAnswer)));
      return {
        prompt: row.prompt || metadata.prompt || `Pergunta ${index + 1}`,
        options,
        answer: Math.max(0, answer),
        explanation: row.simpleExplanation || row.simple_explanation || metadata.explanation || ""
      };
    }).filter(item => item.prompt && item.options.length >= 2);
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const random = Math.floor(Math.random() * (index + 1));
      [result[index], result[random]] = [result[random], result[index]];
    }
    return result;
  }

  window.BC_GAME_TYPES.quiz = ({ phase, mount, arena }) => {
    const source = normalizeRows(phase.rows);
    if (source.length < 2) throw new Error("Perguntas insuficientes para montar o quiz.");
    const configuredCount = Number(phase.metadata?.count || new URLSearchParams(location.search).get("count") || 8);
    const configuredTime = Number(phase.metadata?.time || new URLSearchParams(location.search).get("time") || 25);
    const items = shuffle(source).slice(0, Math.min(configuredCount, source.length)).map(item => {
      const options = shuffle(item.options.map((text, originalIndex) => ({ text, originalIndex })));
      return { ...item, options, correctIndex: options.findIndex(option => option.originalIndex === item.answer) };
    });
    const state = { index: 0, correct: 0, wrong: 0, sequence: 0, bestSequence: 0, score: 100, locked: true, finished: false, timer: null, timeLeft: configuredTime, selected: null, reviewReady: false, answers: [] };

    function updateState() {
      const penaltyPerError = 100 / items.length;
      state.score = Math.max(0, Math.round(100 - state.wrong * penaltyPerError));
      emit("bc-game:state", { score: state.score, attempts: `${Math.min(state.index + 1, items.length)}/${items.length}`, itemsCount: state.sequence, progress: Math.round((state.index / items.length) * 100) });
    }

    function stopTimer() { clearInterval(state.timer); state.timer = null; }
    function updateTimer() {
      const timer = mount.querySelector("#quizTimer");
      if (!timer) return;
      timer.style.setProperty("--quiz-progress", `${Math.max(0, state.timeLeft / configuredTime * 100)}%`);
      timer.querySelector("span").textContent = Math.ceil(state.timeLeft);
    }
    function startTimer() {
      stopTimer(); state.timeLeft = configuredTime; updateTimer();
      state.timer = setInterval(() => { state.timeLeft = Math.max(0, state.timeLeft - .1); updateTimer(); if (state.timeLeft <= 0) answer(-1, true); }, 100);
    }

    function renderQuestion() {
      state.locked = false; state.reviewReady = false; state.selected = null; updateState();
      const item = items[state.index];
      if (!item) return complete();
      mount.innerHTML = `<article class="quizCard relative mx-auto flex min-h-[360px] w-[min(94vw,620px)] select-none flex-col justify-center gap-4 px-4 pb-20 pt-14 sm:px-6"><div id="quizTimer" class="quizTimer absolute right-2 top-2 grid size-12 place-items-center rounded-full shadow-lg"><span class="grid size-[38px] place-items-center rounded-full bg-[#fff7dc] font-display text-sm font-bold text-[#5d2b0a]">${configuredTime}</span></div><div class="quizContent"><div class="mb-3 inline-flex items-center gap-1.5 rounded-full bg-wine/90 px-3 py-2 text-xs font-black uppercase tracking-wider text-white">${icon("fa6-solid:list-check")} questão ${state.index + 1} de ${items.length}</div><div class="font-display text-[clamp(1.25rem,5.8vw,2.25rem)] font-bold leading-none text-[#5d2b0a]">${escapeHtml(item.prompt)}</div><div class="mt-2 font-black text-[#7a4b13]">Selecione a alternativa correta.</div><div class="mt-4 grid gap-2.5">${item.options.map((option, optionIndex) => `<button class="quizOption grid grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-[20px] border-2 border-[#fff7dc]/80 bg-[#fff7dc]/65 px-3.5 py-3 text-left font-black text-[#5d2b0a] shadow-card transition" data-option="${optionIndex}" type="button"><span class="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-wine to-[#6f1620] font-display text-white">${letters(optionIndex)}</span><span>${escapeHtml(option.text)}</span><span class="quizOptionIcon opacity-0"></span></button>`).join("")}</div><div id="quizAnswer" class="mt-4"></div><button id="quizNext" type="button" class="mt-4 hidden min-h-11 w-full rounded-[18px] bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] px-4 py-3 font-black text-white">${state.index === items.length - 1 ? "Ver resultado" : "Ir para a próxima"}</button></div></article>`;
      mount.querySelectorAll("[data-option]").forEach(button => button.addEventListener("click", () => answer(Number(button.dataset.option), false)));
      mount.querySelector("#quizNext").addEventListener("click", next);
      startTimer();
    }

    function localPulse(correct) {
      arena.classList.remove("arenaPulseOk", "arenaPulseBad"); void arena.offsetWidth;
      arena.classList.add(correct ? "arenaPulseOk" : "arenaPulseBad");
      setTimeout(() => arena.classList.remove("arenaPulseOk", "arenaPulseBad"), 850);
    }

    function answer(selectedIndex, timedOut = false) {
      if (state.locked || state.finished) return;
      state.locked = true; stopTimer(); state.selected = selectedIndex;
      const item = items[state.index], correct = !timedOut && selectedIndex === item.correctIndex;
      if (correct) { state.correct++; state.sequence++; state.bestSequence = Math.max(state.bestSequence, state.sequence); }
      else { state.wrong++; state.sequence = 0; }
      state.answers.push({ question: item.prompt, selectedIndex, correctIndex: item.correctIndex, timedOut, correct });
      localPulse(correct);
      emit("bc-game:feedback", { correct });
      updateState();
      const card = mount.querySelector(".quizCard"); card?.classList.add("feedback-pending");
      setTimeout(() => {
        mount.querySelectorAll("[data-option]").forEach(button => {
          const index = Number(button.dataset.option); button.disabled = true;
          button.classList.toggle("correct", index === item.correctIndex);
          button.classList.toggle("wrong", !timedOut && index === selectedIndex && index !== item.correctIndex);
          button.classList.toggle("dimmed", index !== item.correctIndex && index !== selectedIndex);
          const status = button.querySelector(".quizOptionIcon");
          if (index === item.correctIndex) status.innerHTML = icon("fa6-solid:circle-check");
          else if (!timedOut && index === selectedIndex) status.innerHTML = icon("fa6-solid:circle-xmark");
          status.classList.toggle("opacity-0", !status.innerHTML);
          if (index === item.correctIndex) status.classList.add("text-green-600");
          else status.classList.add("text-red-600");
        });
        const correctText = item.options[item.correctIndex].text;
        const selectedText = timedOut ? "Sem resposta" : item.options[selectedIndex]?.text || "Sem resposta";
        mount.querySelector("#quizAnswer").innerHTML = `<div class="border-t border-[#5d2b0a]/10 pt-3"><div class="text-xs font-black uppercase tracking-wider text-[#7a4b13]">Resposta correta${timedOut ? " · tempo esgotado" : ""}</div><div class="font-display text-xl font-bold text-[#5d2b0a]">${escapeHtml(correctText)}</div><div class="mt-2 inline-flex items-center gap-2 rounded-full bg-white/40 px-3 py-2 text-sm font-black text-[#5d2b0a]">${icon(correct ? "fa6-solid:circle-check" : "fa6-solid:circle-xmark")} Sua resposta: ${escapeHtml(selectedText)}</div><div class="mt-2 font-black leading-tight text-[#6b3a1f]">${escapeHtml(item.explanation)}</div></div>`;
        card?.classList.remove("feedback-pending");
        state.reviewReady = true;
        mount.querySelector("#quizNext").classList.remove("hidden");
      }, 820);
    }

    function next() { if (!state.reviewReady || state.finished) return; state.index++; renderQuestion(); }
    function complete() {
      stopTimer(); state.finished = true; updateState();
      emit("bc-game:complete", { score: state.score, attempts: items.length, correctCount: state.correct, totalCount: items.length, answers: { responses: state.answers, bestSequence: state.bestSequence }, progress: 100 });
    }

    return {
      title: phase.title || "Quiz",
      subtitle: phase.subtitle || "Responda às questões da fase",
      prompt: `${phase.prompt || "Escolha uma alternativa por questão."} Você terá ${configuredTime} segundos para cada resposta.`,
      icon: "fa6-solid:list-check",
      itemsCount: items.length,
      initialScore: 100,
      initialAttempts: `1/${items.length}`,
      initialItemsCount: 0,
      hudLabels: { score: "nota", attempts: "questão", itemsCount: "sequência" },
      actionLabel: "",
      instructions: [
        { icon: "fa6-solid:circle-check", text: "Escolha uma alternativa por questão." },
        { icon: "fa6-solid:clock", text: `Você tem ${configuredTime} segundos para responder.` },
        { icon: "fa6-solid:star", text: "A nota final vai de 0 a 100." }
      ],
      start() { state.locked = false; renderQuestion(); },
      destroy() { stopTimer(); }
    };
  };
})();
