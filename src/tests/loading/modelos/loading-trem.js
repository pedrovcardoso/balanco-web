(() => {
  const ROOT_ID = "bc-mg-loading-trem";
  document.getElementById(ROOT_ID)?.remove();

  const messages = [
    "Consultando dados públicos...",
    "Organizando indicadores do Estado...",
    "Preparando a visão cidadã...",
    "Montando gráficos e resumos...",
    "Carregando informações do balanço...",
  ];

  const style = document.createElement("style");
  style.textContent = `
    #${ROOT_ID} {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: grid;
      place-items: center;
      padding: 18px;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #12361c;
      pointer-events: auto;
    }

    #${ROOT_ID},
    #${ROOT_ID} *,
    #${ROOT_ID} *::before,
    #${ROOT_ID} *::after {
      box-sizing: border-box;
    }

    #${ROOT_ID} .bc-card {
      --accent: #8b5a2b;
      width: min(460px, calc(100vw - 28px));
      min-height: 342px;
      position: relative;
      display: grid;
      grid-template-rows: 205px auto;
      gap: 8px;
      padding: 18px 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.34);
      border-radius: 27px;
      background: rgba(255,255,255,.1);
      box-shadow: 0 18px 42px rgba(12,56,19,.1), inset 0 1px 0 rgba(255,255,255,.3);
      backdrop-filter: blur(3px) saturate(108%);
      -webkit-backdrop-filter: blur(3px) saturate(108%);
    }

    #${ROOT_ID} .bc-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 50% 8%, rgba(255,255,255,.17), transparent 35%),
        radial-gradient(circle at 50% 77%, rgba(139,90,43,.16), transparent 48%);
      pointer-events: none;
    }

    #${ROOT_ID} .bc-stage,
    #${ROOT_ID} .bc-footer {
      position: relative;
      z-index: 2;
    }

    #${ROOT_ID} .bc-stage {
      display: grid;
      place-items: center;
      min-width: 0;
      overflow: hidden;
    }

    #${ROOT_ID} .bc-footer {
      display: grid;
      gap: 9px;
      text-align: center;
    }

    #${ROOT_ID} .bc-message {
      min-height: 42px;
      display: grid;
      place-items: center;
      font-size: 16px;
      font-weight: 780;
      line-height: 1.28;
    }

    #${ROOT_ID} .bc-eta {
      color: rgba(18,54,28,.74);
      font-size: 13px;
      font-weight: 650;
    }

    #${ROOT_ID} .bc-progress {
      height: 10px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.38);
      border-radius: 999px;
      background: rgba(18,54,28,.13);
    }

    #${ROOT_ID} .bc-progress-bar {
      width: 0;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #8b5a2b, #e4ad32 62%, #2f9e44);
      transition: width 580ms cubic-bezier(.22,.8,.35,1);
    }

    #${ROOT_ID} .bc-progress-meta {
      display: flex;
      justify-content: center;
      gap: 12px;
      color: rgba(18,54,28,.78);
      font-size: 12px;
      font-weight: 720;
      font-variant-numeric: tabular-nums;
    }

    #${ROOT_ID} .mg-train-scene {
      width: 195px;
      height: 180px;
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      isolation: isolate;
    }

    #${ROOT_ID} .train-glow {
      position: absolute;
      left: 26px;
      top: 17px;
      width: 142px;
      height: 108px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(242,201,76,.18), transparent 69%);
    }

    #${ROOT_ID} .train-hills {
      position: absolute;
      left: -12px;
      right: -12px;
      bottom: 48px;
      height: 65px;
      opacity: .4;
      background:
        radial-gradient(ellipse at 5% 100%, rgba(48,110,57,.29) 0 43%, transparent 44%),
        radial-gradient(ellipse at 38% 100%, rgba(86,139,65,.3) 0 55%, transparent 56%),
        radial-gradient(ellipse at 75% 100%, rgba(48,110,57,.28) 0 49%, transparent 50%),
        radial-gradient(ellipse at 108% 100%, rgba(86,139,65,.26) 0 45%, transparent 46%);
    }

    #${ROOT_ID} .train-track {
      position: absolute;
      left: 7px;
      right: 7px;
      bottom: 31px;
      height: 28px;
    }

    #${ROOT_ID} .train-track::before,
    #${ROOT_ID} .train-track::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      border-radius: 999px;
      background: rgba(67,49,34,.76);
    }

    #${ROOT_ID} .train-track::before { top: 4px; }
    #${ROOT_ID} .train-track::after { top: 17px; }

    #${ROOT_ID} .train-sleepers {
      position: absolute;
      inset: 3px 0 0;
      background: repeating-linear-gradient(
        90deg,
        transparent 0 12px,
        rgba(137,91,47,.52) 12px 19px,
        transparent 19px 31px
      );
      transform: perspective(80px) rotateX(55deg);
      animation: bc-train-sleepers .85s linear infinite;
    }

    /* Trem menor: 390px no SVG, exibido dentro da cena de 195px. */
    #${ROOT_ID} .train-svg {
      position: absolute;
      left: -390px;
      bottom: 26px;
      width: 390px;
      height: 103px;
      overflow: visible;
      filter: drop-shadow(0 7px 6px rgba(62,43,25,.18));
      animation: bc-train-cross 5.6s linear infinite;
      will-change: transform;
    }

    #${ROOT_ID} .train-wheel-spin {
      transform-box: fill-box;
      transform-origin: center;
      animation: bc-train-wheel .55s linear infinite;
    }

    #${ROOT_ID} .train-smoke-puff {
      transform-box: fill-box;
      transform-origin: center;
      animation: bc-train-smoke 1.8s ease-out infinite;
    }

    #${ROOT_ID} .train-smoke-puff.s2 { animation-delay: .56s; }
    #${ROOT_ID} .train-smoke-puff.s3 { animation-delay: 1.12s; }

    @keyframes bc-train-cross {
      0% { transform: translateX(0); opacity: 0; }
      3% { opacity: 1; }
      97% { opacity: 1; }
      100% { transform: translateX(630px); opacity: 0; }
    }

    @keyframes bc-train-wheel {
      to { transform: rotate(360deg); }
    }

    @keyframes bc-train-sleepers {
      to { background-position: 31px 0; }
    }

    @keyframes bc-train-smoke {
      0% { transform: translate(0,0) scale(.55); opacity: 0; }
      20% { opacity: .5; }
      100% { transform: translate(-14px,-23px) scale(1.5); opacity: 0; }
    }

    @media (max-width: 520px) {
      #${ROOT_ID} .bc-card {
        min-height: 320px;
        grid-template-rows: 188px auto;
        padding: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #${ROOT_ID} *,
      #${ROOT_ID} *::before,
      #${ROOT_ID} *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .001ms !important;
      }
    }
  `;

  const wheel = (x, size = 11) => `
    <g class="train-wheel-spin">
      <circle cx="${x}" cy="102" r="${size}" fill="#29332e" stroke="#2d3932" stroke-width="3"/>
      <circle cx="${x}" cy="102" r="${Math.round(size * .45)}" fill="#b79d62"/>
      <path d="M${x} ${102-size+1}v${size*2-2}M${x-size+1} 102h${size*2-2}" stroke="#806f51" stroke-width="2"/>
    </g>`;

  const wagon = (x, fill, inner) => `
    <g transform="translate(${x} 55)" stroke="#2d3932" stroke-width="3" stroke-linejoin="round">
      <rect width="68" height="42" rx="9" fill="${fill}"/>
      <rect x="8" y="10" width="52" height="19" rx="5" fill="${inner}" opacity=".64"/>
      <path d="M11 9h46" stroke="#fff4cf" opacity=".22"/>
      <path d="M68 30h9" stroke="#554234" stroke-width="5"/>
    </g>`;

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = `
    <article class="bc-card">
      <div class="bc-stage" aria-hidden="true">
        <div class="mg-train-scene">
          <div class="train-glow"></div>
          <div class="train-hills"></div>
          <div class="train-track"><div class="train-sleepers"></div></div>
          <svg class="train-svg" viewBox="0 0 500 132">
            <defs>
              <linearGradient id="bc-train-gold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#edc15b"/><stop offset="1" stop-color="#ce8d32"/></linearGradient>
              <linearGradient id="bc-train-cabin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c97649"/><stop offset="1" stop-color="#964d35"/></linearGradient>
              <linearGradient id="bc-wagon-green" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#78966c"/><stop offset="1" stop-color="#486249"/></linearGradient>
              <linearGradient id="bc-wagon-blue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#689294"/><stop offset="1" stop-color="#3d6163"/></linearGradient>
              <linearGradient id="bc-wagon-earth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bd8a58"/><stop offset="1" stop-color="#80543a"/></linearGradient>
            </defs>

            ${wagon(3, "url(#bc-wagon-green)", "#9caf7b")}
            ${wagon(80, "url(#bc-wagon-earth)", "#c49a69")}
            ${wagon(157, "url(#bc-wagon-blue)", "#83a9a5")}
            ${wagon(234, "url(#bc-wagon-green)", "#94a96f")}
            ${wagon(311, "url(#bc-wagon-earth)", "#b77d56")}

            <g transform="translate(388 0)" stroke="#2d3932" stroke-width="3" stroke-linejoin="round">
              <path d="M6 91V25c0-9 7-16 16-16h28c9 0 16 7 16 16v66z" fill="url(#bc-train-cabin)"/>
              <rect x="6" y="5" width="60" height="16" rx="8" fill="#397789"/>
              <path d="M10 12h52" stroke="#76a4a8" opacity=".42"/>
              <rect x="17" y="32" width="28" height="28" rx="5" fill="#91c6c6"/>
              <path d="M21 36h17L21 53z" fill="#e2f0e9" opacity=".68"/>
              <path d="M61 52h45c20 0 33 12 33 29v10H61c-6 0-10-4-10-10V62c0-6 4-10 10-10z" fill="url(#bc-train-gold)"/>
              <path d="M69 66h27M69 78h36" stroke="#b96937" stroke-width="5" stroke-linecap="round"/>
              <path d="M80 52V38c0-5 4-9 9-9h9c5 0 9 4 9 9v14" fill="#397789"/>
              <path d="M113 53V25h14v31" fill="#a7603a"/>
              <rect x="109" y="18" width="22" height="10" rx="4" fill="#aa4f42"/>
              <ellipse cx="132" cy="71" rx="16" ry="20" fill="#c66c3b"/>
              <ellipse cx="132" cy="71" rx="7" ry="11" fill="#e7c664"/>
              <rect x="2" y="86" width="140" height="18" rx="6" fill="#ad513f"/>
              <path d="M138 83h23l-5 24h-25z" fill="#ad513f"/>
              <path d="M149 89l-3 11" stroke="#e7c664" stroke-width="5" stroke-linecap="round"/>
            </g>

            ${[21,53,98,130,175,207,252,284,329,361].map(x => wheel(x)).join("")}
            ${wheel(421, 15)}
            ${wheel(485, 15)}

            <path d="M421 104h64" stroke="#d0c29b" stroke-width="6" stroke-linecap="round"/>
            <path d="M421 104h64" stroke="#2d3932" stroke-width="2" stroke-linecap="round"/>

            <g fill="rgba(255,255,255,.52)" stroke="rgba(45,57,50,.3)" stroke-width="2">
              <circle class="train-smoke-puff s1" cx="510" cy="18" r="8"/>
              <circle class="train-smoke-puff s2" cx="510" cy="18" r="8"/>
              <circle class="train-smoke-puff s3" cx="510" cy="18" r="8"/>
            </g>
          </svg>
        </div>
      </div>

      <footer class="bc-footer">
        <div class="bc-message" data-message>${messages[0]}</div>
        <div class="bc-eta" data-eta>Tempo previsto: 10 segundos</div>
        <div class="bc-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="bc-progress-bar" data-bar></div>
        </div>
        <div class="bc-progress-meta"><span data-percent>0%</span><span data-status>Carregando</span></div>
      </footer>
    </article>`;

  document.head.appendChild(style);
  document.body.appendChild(root);

  let progress = 0;
  let messageIndex = 0;
  const bar = root.querySelector("[data-bar]");
  const progressBox = root.querySelector(".bc-progress");
  const percent = root.querySelector("[data-percent]");
  const status = root.querySelector("[data-status]");
  const message = root.querySelector("[data-message]");
  const eta = root.querySelector("[data-eta]");

  const timer = setInterval(() => {
    progress += (2 + Math.random() * 3.6) * (progress > 80 ? .62 : 1);
    if (progress >= 100) {
      progress = 0;
      messageIndex = (messageIndex + 1) % messages.length;
    }

    const value = Math.round(progress);
    const remaining = Math.max(1, Math.ceil(10 * (1 - progress / 100)));
    bar.style.width = `${value}%`;
    progressBox.setAttribute("aria-valuenow", String(value));
    percent.textContent = `${value}%`;
    message.textContent = messages[messageIndex];
    eta.textContent = `Tempo previsto: ${remaining} segundo${remaining === 1 ? "" : "s"}`;
    status.textContent = value >= 92 ? "Finalizando" : value >= 66 ? "Processando" : value >= 34 ? "Coletando dados" : "Carregando";
  }, 520);

  root.destroy = () => {
    clearInterval(timer);
    root.remove();
    style.remove();
  };
})();
