(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const phaseId = new URLSearchParams(location.search).get("phase") || "";
  const MAP_URL = "../trilha-jogos/";
  let user = null, phase = null, game = null, startedAt = null;

  const setLoading = (text) => { if ($("apiLoadingText")) $("apiLoadingText").textContent = text; };
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const parseJson = (value, fallback = {}) => { if (!value) return fallback; if (typeof value === "object") return value; try { return JSON.parse(value); } catch { return fallback; } };
  const icon = (name) => `<iconify-icon icon="${name}" aria-hidden="true"></iconify-icon>`;

  function typeSlug(value) {
    const slug = String(value || "ordem-correta").toLowerCase().replace(/_/g, "-");
    return slug === "ordem" ? "ordem-correta" : slug;
  }

  function normalizePhase(mapPhase, rows) {
    const metadata = parseJson(mapPhase.metadataJson || mapPhase.metadata_json || mapPhase.metadata, {});
    return {
      ...mapPhase,
      metadata,
      type: typeSlug(mapPhase.engineSlug || metadata.engineSlug || metadata.type),
      title: metadata.title || mapPhase.title || mapPhase.phaseTitle || "Jogo",
      subtitle: metadata.subtitle || mapPhase.subtitle || "Complete a missão",
      prompt: metadata.prompt || mapPhase.prompt || "Conclua o desafio proposto.",
      rows: rows || []
    };
  }

  async function loadPhase() {
    if (!phaseId) throw new Error("Fase não informada. Use ?phase=IDENTIFICADOR.");
    setLoading("Identificando participante...");
    user = await BC_API.requireUser();
    setLoading("Consultando fase no banco...");
    const map = await BC_API.getGameMap(user.publicUserId);
    const mapPhase = (map || []).find(item => String(item.publicPhaseId || "") === String(phaseId));
    if (!mapPhase) throw new Error("A fase informada não foi encontrada.");
    if (String(mapPhase.status || "locked").toLowerCase() === "locked") return showLocked(mapPhase);
    setLoading("Carregando dados do jogo...");
    const rows = await BC_API.getQuestionsForPhase(phaseId, { limit: 20, random: false });
    phase = normalizePhase(mapPhase, rows);
    const factory = window.BC_GAME_TYPES?.[phase.type];
    if (typeof factory !== "function") {
      const error = new Error(`O tipo de jogo “${phase.type || "não informado"}” ainda não está disponível.`);
      error.code = "UNSUPPORTED_GAME_TYPE";
      throw error;
    }
    game = factory({ phase, mount: $("gameMount"), arena: $("arena") });
    if (!game || typeof game.start !== "function") throw new Error(`Contrato inválido do jogo: ${phase.type}`);
    renderShell();
  }

  function renderShell() {
    $("gameTitle").textContent = game.title || phase.title;
    $("subtitle").textContent = game.subtitle || phase.subtitle;
    $("introTitle").textContent = game.title || phase.title;
    $("introText").textContent = game.prompt || phase.prompt;
    $("gameIcon").innerHTML = icon(game.icon || "fa6-solid:gamepad");
    $("introIcon").innerHTML = icon(game.icon || "fa6-solid:gamepad");
    $("introInstructions").innerHTML = game.introContent || (game.instructions || []).map(item => `<div class="rounded-2xl bg-white/50 px-2.5 py-2 text-[.82rem] font-black leading-tight text-[#5d2b0a]">${icon(item.icon)} ${escapeHtml(item.text)}</div>`).join("");
    const hudLabels = game.hudLabels || {};
    document.querySelector("#score + span").textContent = hudLabels.score || "nota";
    document.querySelector("#attempts + span").textContent = hudLabels.attempts || "tentativas";
    document.querySelector("#itemsCount + span").textContent = hudLabels.itemsCount || "itens";
    const action = $("primaryAction");
    action.innerHTML = game.actionLabel || "";
    action.closest(".actions").classList.toggle("hidden", !game.actionLabel);
    updateHud({ score: game.initialScore ?? 0, attempts: game.initialAttempts ?? 0, itemsCount: game.initialItemsCount ?? Number(game.itemsCount || 0), progress: 0 });
    document.body.classList.add("game-ready");
    setTimeout(() => document.body.classList.remove("loading-game"), 620);
  }

  function updateHud(detail = {}) {
    if (detail.score != null) $("score").textContent = detail.score;
    if (detail.attempts != null) $("attempts").textContent = detail.attempts;
    if (detail.itemsCount != null) $("itemsCount").textContent = detail.itemsCount;
    if (detail.progress != null) {
      const progress = Math.max(0, Math.min(100, Number(detail.progress) || 0));
      $("progressFill").style.width = `${progress}%`;
      document.querySelector(".progress")?.setAttribute("aria-valuenow", String(progress));
    }
  }

  function showFeedback({ correct, hideMark = false }) {
    const arena = $("arena"), mark = $("mark");
    document.body.classList.add("feedback-mode");
    arena.classList.remove("arenaPulseOk", "arenaPulseBad");
    void arena.offsetWidth;
    arena.classList.add(correct ? "arenaPulseOk" : "arenaPulseBad");

    mark.classList.remove("show", "text-green-600", "text-red-600");
    if (!hideMark) {
      mark.textContent = correct ? "✓" : "×";
      mark.classList.add(correct ? "text-green-600" : "text-red-600");
      void mark.offsetWidth;
      mark.classList.add("show");
    }

    GameFinish.feedback(arena, { correct });
    setTimeout(() => {
      mark.classList.remove("show");
      document.body.classList.remove("feedback-mode");
    }, 820);
  }

  async function finish(detail) {
    game?.destroy?.();
    game = null;
    $("gameMount").replaceChildren();
    ["flowToast", "wordToast", "crossToast"].forEach(id => {
      const toast = document.getElementById(id);
      if (!toast) return;
      clearTimeout(toast._timer || toast._to);
      toast.remove();
    });
    document.body.classList.add("finish-mode");
    await GameFinish.show({
      mount: $("gameMount"), api: window.BC_API, user, phaseId,
      score: detail.score, attempts: detail.attempts,
      correctCount: detail.correctCount, totalCount: detail.totalCount,
      durationSeconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : null,
      answers: detail.answers || {}, mapUrl: MAP_URL,
      confetti: detail.confetti !== false
    });
  }

  function showLocked(mapPhase) {
    document.body.classList.remove("loading-game"); document.body.classList.add("game-ready", "phase-locked");
    const loading = $("apiLoading"); loading.classList.add("is-locked");
    loading.innerHTML = `<section class="phaseLockedCard relative w-full max-w-[460px] overflow-hidden rounded-[30px] border-[3px] border-white/90 bg-gradient-to-br from-[#fffdf2] to-[#ffe8a3] px-6 pb-6 pt-7 text-center"><div class="relative mx-auto mb-3 grid size-20 place-items-center rounded-full bg-stone-600 text-3xl text-white">${icon("fa6-solid:lock")}</div><h1 class="relative font-display text-4xl font-bold text-[#5d2b0a]">Fase bloqueada</h1><p class="relative my-4 font-extrabold text-[#6b3a1f]">Complete as fases anteriores para continuar.</p><a class="relative inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-gradient-to-br from-wine to-[#6f1620] font-black text-white no-underline" href="${new URL(MAP_URL, location.href)}">Voltar para o mapa</a></section>`;
  }

  function fail(error) {
    const unsupported = error?.code === "UNSUPPORTED_GAME_TYPE";
    document.body.classList.remove("loading-game", "intro-mode", "feedback-mode", "phase-locked");
    document.body.classList.add("game-ready", "finish-mode", "load-error-mode");
    $("intro")?.classList.add("hidden");
    $("apiLoading")?.classList.remove("is-locked");
    document.querySelector(".actions")?.classList.add("hidden");
    document.querySelector(".progress")?.classList.add("hidden");

    $("gameMount").innerHTML = `<section class="mx-auto flex w-[min(92vw,520px)] flex-col items-center justify-center rounded-[30px] border border-white/60 bg-[#fdf6e3]/75 p-6 text-center shadow-xl backdrop-blur-xl">
      <div class="mb-3 grid size-16 place-items-center rounded-[20px] border-2 border-gold bg-gradient-to-br from-wine to-[#6f1620] text-2xl text-white shadow-lg">${icon("fa6-solid:triangle-exclamation")}</div>
      <h1 class="m-0 font-display text-[clamp(1.6rem,6vw,2.35rem)] font-bold leading-none text-[#5d2b0a]">Não foi possível exibir os dados desta página</h1>
      <p class="my-4 max-w-[400px] font-black leading-tight text-[#7a4b13]">${unsupported ? "Este tipo de jogo ainda não está disponível." : escapeHtml(error.message || error)}</p>
      <a class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-br from-wine to-[#6f1620] px-4 py-3 font-black text-white no-underline shadow-lg" href="../trilha-jogos/">${icon("fa6-solid:map-location-dot")} Ir para o mapa de fases</a>
    </section>`;
  }

  const exitModal = $("exitGameModal");
  const openExitModal = () => {
    exitModal?.classList.remove("hidden");
    exitModal?.classList.add("grid");
    setTimeout(() => $("exitGameCancel")?.focus(), 0);
  };
  const closeExitModal = () => {
    exitModal?.classList.add("hidden");
    exitModal?.classList.remove("grid");
    $("exitGame")?.focus();
  };
  $("exitGame")?.addEventListener("click", openExitModal);
  $("exitGameCancel")?.addEventListener("click", closeExitModal);
  exitModal?.addEventListener("click", event => { if (event.target === exitModal) closeExitModal(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !exitModal?.classList.contains("hidden")) closeExitModal();
  });

  $("start").addEventListener("click", () => {
    if (!game) return; startedAt = Date.now(); document.body.classList.remove("intro-mode"); $("intro").classList.add("hidden"); game.start();
  });
  $("primaryAction").addEventListener("click", () => game?.primaryAction?.());
  addEventListener("bc-game:state", event => updateHud(event.detail));
  addEventListener("bc-game:feedback", event => showFeedback(event.detail));
  addEventListener("bc-game:complete", event => {
    const detail = event.detail || {};
    updateHud(detail);
    if (detail.celebrate) {
      showFeedback({ correct: true });
      setTimeout(() => {
        game?.destroy?.();
        game = null;
        $("gameMount").replaceChildren();
        document.body.classList.remove("feedback-mode");
        finish({ ...detail, confetti: false });
      }, 820);
      return;
    }
    setTimeout(() => finish(detail), 820);
  });
  addEventListener("beforeunload", () => game?.destroy?.());
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("bg-ready")));
  loadPhase().catch(fail);
})();