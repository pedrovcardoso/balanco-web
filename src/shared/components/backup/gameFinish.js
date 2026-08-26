(() => {
  "use strict";

  const STYLE_ID = "bc-game-finish-styles";
  const ENGINE_PATHS = {
    "caca-palavras": "../caca_palavras/",
    flow: "../flow/",
    "ordem-correta": "../ordem_correta/",
    ordem: "../ordem_correta/",
    quiz: "../quiz/",
    swipe: "../swipe/",
    cruzadinha: "../cruzadinha/",
  };

  const CSS = `
  .visuallyHidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
  .gameFinish{position:relative;overflow:hidden;isolation:isolate;width:min(92vw,520px);padding:18px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;animation:gf-card-in .58s cubic-bezier(.16,1,.3,1) both}
  .gameFinish__score{font:700 clamp(3.2rem,10vw,4.7rem)/.9 var(--font-display,"Fredoka",sans-serif);color:#5d2b0a;animation:gf-score .72s cubic-bezier(.16,1,.3,1) both}
  .gameFinish__bar{width:82%;height:18px;background:rgba(93,43,10,.13);border-radius:999px;overflow:hidden}.gameFinish__barFill{height:100%;width:0;background:linear-gradient(90deg,#ef4444,#f5a800,#22c55e);border-radius:inherit;animation:gf-bar 1.25s ease .2s forwards}
  .gameFinish__meta,.gameFinish__status{margin:0;font-weight:900;color:#6b3a1f}.gameFinish__stars{display:flex;justify-content:center;gap:8px;margin:4px 0;perspective:600px}.gameFinish__star{display:inline-block;font-size:clamp(2.6rem,9vw,3.8rem);line-height:1;color:rgba(139,94,60,.2);opacity:0;transform:translateY(-120px) rotate(-260deg) scale(.2);filter:drop-shadow(0 8px 0 rgba(139,94,60,.15));animation:gf-star-off .55s ease forwards}.gameFinish__star.is-on{color:#f5a800;animation:gf-star-on 1.05s cubic-bezier(.15,1.18,.35,1) forwards}
  .gameFinish__saving{display:inline-flex;align-items:center;gap:.5rem;padding:.68rem .9rem;border-radius:999px;background:rgba(253,246,227,.78);color:#6b3a1f;font-weight:900;box-shadow:0 10px 24px rgba(76,38,10,.1);transition:opacity .3s ease,transform .3s ease}.gameFinish__saving.is-leaving{opacity:0;transform:translateY(-8px) scale(.96)}.gameFinish__saving iconify-icon{color:#2d6a4f;animation:gf-spin 1s linear infinite}.gameFinish__saveError{margin:0;color:#9e1f28;font-weight:900}
  .gameFinish__actions{width:100%;display:grid;gap:10px;margin-top:6px}.gameFinish__actions[hidden]{display:none}.gameFinish__button{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;border:0;border-radius:22px;padding:14px 16px;color:#fff;font:900 1rem var(--font-body,"Nunito",sans-serif);text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 7px 0 rgba(93,43,10,.2),0 12px 22px rgba(0,0,0,.1);opacity:0;transform:translateY(18px) scale(.97);animation:gf-button-in .52s cubic-bezier(.16,1,.3,1) forwards;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease}.gameFinish__button:nth-child(2){animation-delay:.1s}.gameFinish__button:nth-child(3){animation-delay:.2s}.gameFinish__button:hover{transform:translateY(-3px) scale(1.015);filter:brightness(1.08);box-shadow:0 10px 0 rgba(93,43,10,.18),0 18px 28px rgba(0,0,0,.14)}.gameFinish__button:active{transform:translateY(3px) scale(.99);box-shadow:0 3px 0 rgba(93,43,10,.2),0 8px 15px rgba(0,0,0,.1)}.gameFinish__button--next{background:linear-gradient(135deg,#0f7a55,#0b3f2d)}.gameFinish__button--map{background:linear-gradient(135deg,#9e1f28,#6f1620)}.gameFinish__button--replay{background:rgba(255,247,220,.65);color:#6b3a1f;border:1.5px solid rgba(93,43,10,.24);box-shadow:none}
  .gameFinish__confetti{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}.gameFinish>*:not(.gameFinish__confetti){position:relative;z-index:1}
  @keyframes gf-card-in{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}@keyframes gf-score{from{opacity:0;transform:translateY(28px) scale(.85)}to{opacity:1;transform:none}}@keyframes gf-bar{to{width:var(--gf-score,0%)}}@keyframes gf-star-on{0%{opacity:0;transform:translateY(-120px) rotate(-260deg) scale(.2)}62%{opacity:1;transform:translateY(10px) rotate(20deg) scale(1.18)}100%{opacity:1;transform:none}}@keyframes gf-star-off{to{opacity:1;transform:none}}@keyframes gf-button-in{to{opacity:1;transform:none}}@keyframes gf-spin{to{transform:rotate(360deg)}}
  @media(prefers-reduced-motion:reduce){.gameFinish *{animation-duration:.01ms!important;animation-delay:0ms!important;transition-duration:.01ms!important}}
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const withTimeout = (promise, ms, label) =>
    Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} excedeu ${ms}ms`)), ms),
      ),
    ]);
  const clampScore = (score) => Math.max(0, Math.min(100, Number(score) || 0));
  const calculateStars = (score) =>
    score >= 95 ? 3 : score >= 80 ? 2 : score >= 60 ? 1 : 0;

  function phaseUrl(next) {
    if (!next?.publicPhaseId) return "";
    const url = new URL(location.href);
    url.searchParams.set("phase", next.publicPhaseId);
    return url.toString();
  }

  function starText(stars) {
    if (stars === 0) return "Nenhuma estrela conquistada";
    if (stars === 1) return "1 estrela conquistada";
    return `${stars} estrelas conquistadas`;
  }

  function attemptText(attempts) {
    return attempts === 1
      ? "Concluído em 1 tentativa"
      : `Concluído em ${attempts} tentativas`;
  }

  function starMarkup(stars) {
    return [1, 2, 3]
      .map(
        (index) =>
          `<span class="gameFinish__star ${index <= stars ? "is-on" : ""}" style="animation-delay:${0.25 + index * 0.3}s" aria-hidden="true">★</span>`,
      )
      .join("");
  }

  function celebrate(host) {
    injectStyles();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = host instanceof Element ? host : null;
    if (!target) return;
    target.querySelector(".gameFinish__confetti")?.remove();
    const canvas = document.createElement("canvas");
    canvas.className = "gameFinish__confetti";
    canvas.setAttribute("aria-hidden", "true");
    target.prepend(canvas);
    const context = canvas.getContext("2d");
    const rect = target.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);
    const colors = ["#15803d", "#b45309", "#1d4ed8", "#be185d"];
    const pieces = Array.from({ length: 72 }, () => ({
      x: width / 2,
      y: height * 0.42,
      vx: (Math.random() - 0.5) * 10,
      vy: -2 - Math.random() * 7,
      g: 0.13 + Math.random() * 0.11,
      s: 4 + Math.random() * 7,
      r: Math.random() * Math.PI,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let frame = 0;
    (function draw() {
      context.clearRect(0, 0, width, height);
      pieces.forEach((piece) => {
        piece.x += piece.vx;
        piece.vy += piece.g;
        piece.y += piece.vy;
        piece.r += 0.12;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.r);
        context.fillStyle = piece.c;
        context.fillRect(-piece.s / 2, -piece.s / 2, piece.s, piece.s);
        context.restore();
      });
      if (++frame < 100) requestAnimationFrame(draw);
      else canvas.remove();
    })();
  }

  function feedback(host, options = {}) {
    const { correct = false } = options;
    injectStyles();
    if (!correct) return;
    celebrate(host);
  }

  async function show(options = {}) {
    injectStyles();
    const {
      mount,
      api = window.BC_API,
      user,
      phaseId,
      score,
      attempts = 1,
      durationSeconds = null,
      answers = {},
      correctCount = 0,
      totalCount = 0,
      hintsUsed = 0,
      mapUrl = "../trilha-jogos/",
      minimumVisibleMs = 900,
      requestTimeoutMs = 7000,
      confetti = false,
      onBeforeRender,
      onComplete,
    } = options;
    if (!(mount instanceof Element))
      throw new TypeError("GameFinish.show: mount deve ser um elemento DOM.");
    if (!phaseId) throw new Error("GameFinish.show: phaseId é obrigatório.");
    const finalScore = clampScore(score),
      stars = calculateStars(finalScore);
    onBeforeRender?.({ score: finalScore, stars });
    mount.innerHTML = `<section class="gameFinish" style="--gf-score:${finalScore}%" aria-labelledby="gameFinishTitle" tabindex="-1"><h2 id="gameFinishTitle" class="visuallyHidden">Resultado da fase</h2><div class="gameFinish__score">${finalScore}</div><div class="gameFinish__bar" aria-label="Pontuação ${finalScore} de 100"><div class="gameFinish__barFill"></div></div><p class="gameFinish__meta">${attemptText(attempts)}</p><div class="gameFinish__stars" aria-label="${stars} de 3 estrelas">${starMarkup(stars)}</div><p class="gameFinish__status" role="status" aria-live="polite">${starText(stars)}</p><div class="gameFinish__saving" role="status" aria-live="polite"><iconify-icon icon="fa6-solid:circle-notch" aria-hidden="true"></iconify-icon><span>Salvando resultado...</span></div><p class="gameFinish__saveError" hidden></p><div class="gameFinish__actions" hidden></div></section>`;
    const resultCard = mount.querySelector(".gameFinish");
    if (confetti) celebrate(resultCard);
    requestAnimationFrame(() => resultCard?.focus({ preventScroll: true }));

    const nextPromise =
      api?.getNextPhaseForPhase && user?.publicUserId
        ? withTimeout(
            api.getNextPhaseForPhase(user.publicUserId, phaseId),
            requestTimeoutMs,
            "Busca da próxima fase",
          )
        : Promise.resolve(null);
    const savePromise =
      api?.registerGameAttempt && user?.publicUserId
        ? withTimeout(
            api.registerGameAttempt(user.publicUserId, phaseId, {
              score: finalScore,
              stars,
              hintsUsed,
              attemptsUsed: attempts,
              correctCount,
              totalCount,
              durationSeconds,
              answers,
            }),
            requestTimeoutMs,
            "Registro da tentativa",
          )
        : Promise.resolve(null);
    const [nextResult, saveResult] = await Promise.all([
      Promise.allSettled([nextPromise, savePromise]),
      wait(minimumVisibleMs),
    ]).then(([results]) => results);
    const next = nextResult.status === "fulfilled" ? nextResult.value : null;
    const saveError =
      saveResult.status === "rejected" ? saveResult.reason : null;
    if (nextResult.status === "rejected")
      console.warn(
        "[GameFinish] Próxima fase indisponível:",
        nextResult.reason,
      );
    if (saveError) console.warn("[GameFinish] Falha ao salvar:", saveError);

    const saving = mount.querySelector(".gameFinish__saving");
    saving?.classList.add("is-leaving");
    await wait(300);
    saving?.remove();
    const actions = mount.querySelector(".gameFinish__actions");
    const nextHref = phaseUrl(next);
    const passed = stars >= 1;
    const mapButton = `<a class="gameFinish__button gameFinish__button--map" href="${new URL(mapUrl, location.href)}"><iconify-icon icon="fa6-solid:map-location-dot" aria-hidden="true"></iconify-icon> Voltar para o mapa</a>`;
    const replayButton = `<button class="gameFinish__button ${passed ? "gameFinish__button--replay" : "gameFinish__button--next"}" type="button"><iconify-icon icon="fa6-solid:rotate-right" aria-hidden="true"></iconify-icon> Jogar novamente</button>`;
    const nextButton = passed && nextHref ? `<a class="gameFinish__button gameFinish__button--next" href="${nextHref}"><iconify-icon icon="fa6-solid:forward" aria-hidden="true"></iconify-icon> Próxima fase</a>` : "";
    actions.innerHTML = passed
      ? `${nextButton}${mapButton}${replayButton}`
      : `${replayButton}${mapButton}`;
    actions
      .querySelector("button")
      ?.addEventListener("click", () => location.reload());
    if (saveError) {
      const box = mount.querySelector(".gameFinish__saveError");
      box.textContent =
        "O resultado não foi salvo. Tente novamente ou volte ao mapa.";
      box.hidden = false;
    }
    actions.hidden = false;
    const result = { score: finalScore, stars, nextPhase: next, saveError };
    onComplete?.(result);
    return result;
  }

  injectStyles();
  window.GameFinish = Object.freeze({ show, feedback, calculateStars });
})();
