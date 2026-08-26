(() => {
  const ROOT_ID = "bc-mg-loading-showcase-v11";
  const previous = document.getElementById(ROOT_ID);
  const SCRIPT_BASE_URL = (() => {
    const script = document.currentScript;
    return script?.src ? new URL(".", script.src) : new URL(".", document.baseURI);
  })();
  const assetUrl = (name) => new URL(name, SCRIPT_BASE_URL).href;
  if (previous) previous.remove();

  const MG_GEOJSON_URL =
    "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-31-mun.json";

  const config = {
    messages: [
      "Consultando dados públicos...",
      "Organizando indicadores do Estado...",
      "Preparando a visão cidadã...",
      "Montando gráficos e resumos...",
      "Carregando informações do balanço...",
    ],
    loaders: [
      { id: "historico", accent: "#b57a3a", eta: 8, originalIndex: 3 },
    ],
  };

  const intervals = [];
  const style = document.createElement("style");
  style.textContent = `
    #${ROOT_ID} { position:fixed; inset:0; z-index:999999; display:flex; align-items:flex-start; justify-content:center; padding:28px; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain; scrollbar-gutter:stable; pointer-events:auto; font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:#12361c; }
    #${ROOT_ID} *, #${ROOT_ID} *::before, #${ROOT_ID} *::after { box-sizing:border-box; }
    #${ROOT_ID} { scrollbar-width:thin; scrollbar-color:rgba(31,143,70,.65) rgba(255,255,255,.18); }
    #${ROOT_ID}::-webkit-scrollbar { width:12px; }
    #${ROOT_ID}::-webkit-scrollbar-track { background:rgba(255,255,255,.16); border-radius:999px; }
    #${ROOT_ID}::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#2f9e44,#2686a6); border:3px solid rgba(255,255,255,.45); border-radius:999px; }
    #${ROOT_ID}::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg,#237b36,#1f718c); }
    #${ROOT_ID} .bc-showcase { width:min(1280px,calc(100vw - 40px)); position:relative; margin:auto 0; padding:12px 0 28px; pointer-events:auto; }
#${ROOT_ID} .bc-grid { display:grid; grid-template-columns:repeat(3,minmax(230px,1fr)); gap:16px; }
    #${ROOT_ID} .bc-card { --accent:#1f8f46; --accent-soft:rgba(31,143,70,.16); min-height:330px; position:relative; display:grid; grid-template-rows:1fr auto; padding:18px 16px; overflow:hidden; border:1px solid rgba(255,255,255,.32); border-radius:27px; background:rgba(255,255,255,.1); box-shadow:0 18px 42px rgba(12,56,19,.1),inset 0 1px 0 rgba(255,255,255,.3); backdrop-filter:blur(3px) saturate(108%); -webkit-backdrop-filter:blur(3px) saturate(108%); }
    #${ROOT_ID} .bc-card::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 8%,rgba(255,255,255,.17),transparent 35%),radial-gradient(circle at 50% 77%,var(--accent-soft),transparent 48%); pointer-events:none; }
    #${ROOT_ID} .bc-card::after { content:""; position:absolute; inset:0; background:linear-gradient(112deg,transparent 0%,rgba(255,255,255,.11) 45%,transparent 58%); transform:translateX(-140%); animation:bc-card-shine 6.8s ease-in-out infinite; pointer-events:none; }
    #${ROOT_ID} .bc-stage, #${ROOT_ID} .bc-footer { position:relative; z-index:2; }
    #${ROOT_ID} .bc-stage { min-height:195px; display:grid; place-items:center; }
    #${ROOT_ID} .bc-footer { display:grid; gap:9px; text-align:center; }
    #${ROOT_ID} .bc-message { min-height:42px; display:grid; place-items:center; color:#12361c; font-size:16px; font-weight:780; line-height:1.28; }
    #${ROOT_ID} .bc-eta { color:rgba(18,54,28,.74); font-size:13px; font-weight:650; }
    #${ROOT_ID} .bc-progress { height:10px; overflow:hidden; border:1px solid rgba(255,255,255,.38); border-radius:999px; background:rgba(18,54,28,.13); }
    #${ROOT_ID} .bc-progress-bar { width:0%; height:100%; border-radius:inherit; background:linear-gradient(90deg,var(--accent),#e4ad32 62%,#2f9e44); box-shadow:0 0 15px var(--accent-soft); transition:width 580ms cubic-bezier(.22,.8,.35,1); }
    #${ROOT_ID} .bc-progress-meta { display:flex; justify-content:center; gap:12px; color:rgba(18,54,28,.78); font-size:12px; font-weight:720; font-variant-numeric:tabular-nums; }

    /* MAPA: mantido, com ciclo mais lento. */
    #${ROOT_ID} .mg-real-map { width:194px; height:180px; position:relative; display:grid; place-items:center; }
    #${ROOT_ID} .mg-real-map svg { width:180px; height:166px; overflow:visible; filter:drop-shadow(0 14px 15px rgba(20,70,30,.17)); }
    #${ROOT_ID} .mg-map-feature { fill:rgba(31,143,70,.12); stroke:rgba(31,143,70,.37); stroke-width:.42; vector-effect:non-scaling-stroke; animation:mg-map-breathe 4.8s ease-in-out infinite; }
    #${ROOT_ID} .mg-map-outline { fill:none; stroke:var(--accent); stroke-width:3; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:720; stroke-dashoffset:720; vector-effect:non-scaling-stroke; animation:mg-outline-real 4.8s ease-in-out infinite; }
    #${ROOT_ID} .mg-map-scan { position:absolute; width:104px; height:104px; border-radius:50%; background:radial-gradient(circle,rgba(242,201,76,.27),transparent 66%); animation:mg-scan 5.2s ease-in-out infinite; pointer-events:none; }
    #${ROOT_ID} .mg-map-loading { color:var(--accent); font-size:12px; font-weight:750; opacity:.72; }
    #${ROOT_ID} .mg-map-pin { position:absolute; z-index:3; display:grid; place-items:center; width:25px; height:25px; border:1px solid rgba(255,255,255,.7); border-radius:50%; background:rgba(242,201,76,.92); color:#276f3d; box-shadow:0 7px 16px rgba(20,70,30,.17); animation:mg-pin-float 3.8s ease-in-out infinite; }
    #${ROOT_ID} .mg-map-pin iconify-icon { font-size:14px; }
    #${ROOT_ID} .mg-map-pin.a { left:28px; top:47px; }
    #${ROOT_ID} .mg-map-pin.b { right:31px; bottom:43px; animation-delay:.9s; }

    /* TREM: duas opcoes controladas por TRAIN_BACKGROUND_VARIANT. */
    #${ROOT_ID} .mg-train-scene { width:195px; height:180px; position:relative; overflow:hidden; border-radius:24px; }
    #${ROOT_ID} .train-sky-glow { position:absolute; left:25px; top:14px; width:144px; height:112px; border-radius:50%; background:radial-gradient(circle,rgba(242,201,76,.2),transparent 69%); animation:train-glow-loop 4.6s ease-in-out infinite; }
    #${ROOT_ID} .train-hills { position:absolute; left:-12px; right:-12px; bottom:51px; height:66px; opacity:.58; background:radial-gradient(ellipse at 5% 100%,rgba(48,110,57,.29) 0 43%,transparent 44%),radial-gradient(ellipse at 38% 100%,rgba(86,139,65,.3) 0 55%,transparent 56%),radial-gradient(ellipse at 75% 100%,rgba(48,110,57,.28) 0 49%,transparent 50%),radial-gradient(ellipse at 108% 100%,rgba(86,139,65,.26) 0 45%,transparent 46%); }
    #${ROOT_ID} .mg-train-scene.train-bg-none .train-hills, #${ROOT_ID} .mg-train-scene.train-bg-none .train-sky-glow { display:none; }
    #${ROOT_ID} .train-track { position:absolute; left:7px; right:7px; bottom:34px; height:28px; }
    #${ROOT_ID} .train-track::before, #${ROOT_ID} .train-track::after { content:""; position:absolute; left:0; right:0; height:4px; border-radius:999px; background:rgba(67,49,34,.72); }
    #${ROOT_ID} .train-track::before { top:4px; } #${ROOT_ID} .train-track::after { top:17px; }
    #${ROOT_ID} .train-sleepers { position:absolute; inset:3px 0 0; background:repeating-linear-gradient(90deg,transparent 0 12px,rgba(137,91,47,.52) 12px 19px,transparent 19px 31px); transform:perspective(80px) rotateX(55deg); animation:train-sleepers-loop 1.8s linear infinite; }
    #${ROOT_ID} .train-set { position:absolute; left:-142px; bottom:56px; display:flex; align-items:flex-end; gap:4px; filter:drop-shadow(0 13px 13px rgba(62,43,25,.2)); animation:train-trip 6.8s linear infinite; }
    #${ROOT_ID} .train-engine { width:73px; height:47px; position:relative; border:2px solid rgba(23,70,37,.74); border-radius:9px 22px 8px 8px; background:linear-gradient(180deg,#3b9855,#1d6235); }
    #${ROOT_ID} .train-cabin { position:absolute; left:8px; top:-26px; width:36px; height:30px; border:2px solid rgba(23,70,37,.74); border-radius:7px 7px 1px 1px; background:#2b7843; }
    #${ROOT_ID} .train-window { position:absolute; left:15px; top:-19px; width:21px; height:15px; border-radius:3px; background:linear-gradient(135deg,rgba(255,255,255,.82),rgba(197,226,204,.64)); }
    #${ROOT_ID} .train-boiler { position:absolute; right:5px; bottom:11px; width:32px; height:20px; border-radius:12px 16px 10px 10px; background:rgba(19,77,40,.78); }
    #${ROOT_ID} .train-chimney { position:absolute; right:14px; top:-20px; width:13px; height:24px; border-radius:3px 3px 7px 7px; background:#594126; }
    #${ROOT_ID} .train-chimney::before { content:""; position:absolute; left:-3px; top:-4px; width:19px; height:7px; border-radius:4px; background:#6d4c2c; }
    #${ROOT_ID} .train-lamp { position:absolute; right:-4px; top:10px; width:11px; height:11px; border-radius:50%; background:#f3d36c; box-shadow:10px 0 18px rgba(243,211,108,.62); animation:train-lamp-pulse 2.2s ease-in-out infinite; }
    #${ROOT_ID} .train-wagon { width:47px; height:36px; position:relative; display:grid; place-items:center; border:2px solid rgba(92,55,18,.65); border-radius:7px; background:linear-gradient(180deg,#dda135,#ad6e24); color:rgba(255,248,221,.94); }
    #${ROOT_ID} .train-wagon::before { content:""; position:absolute; left:-6px; top:21px; width:6px; height:4px; background:rgba(58,44,30,.8); }
    #${ROOT_ID} .train-wagon iconify-icon { font-size:20px; }
    #${ROOT_ID} .train-wheel { position:absolute; bottom:-8px; width:14px; height:14px; border:3px solid #bda569; border-radius:50%; background:#30271e; animation:train-wheel-spin 1.2s linear infinite; }
    #${ROOT_ID} .train-engine .train-wheel.w1 { left:10px; } #${ROOT_ID} .train-engine .train-wheel.w2 { right:10px; }
    #${ROOT_ID} .train-wagon .train-wheel.w1 { left:6px; } #${ROOT_ID} .train-wagon .train-wheel.w2 { right:6px; }
    #${ROOT_ID} .train-smoke { position:absolute; right:14px; top:-34px; width:13px; height:13px; border-radius:50%; background:rgba(255,255,255,.58); animation:train-smoke 2.3s ease-out infinite; }
    #${ROOT_ID} .train-smoke.s2 { animation-delay:.65s; } #${ROOT_ID} .train-smoke.s3 { animation-delay:1.3s; }

    /* QUEIJO: roda com oito fatias completadas em sequencia. */
    #${ROOT_ID} .mg-cheese-scene { width:195px; height:180px; position:relative; overflow:hidden; border-radius:24px; display:grid; place-items:center; }
    #${ROOT_ID} .cheese-halo { position:absolute; width:148px; height:148px; border-radius:50%; background:radial-gradient(circle,rgba(242,201,76,.2),transparent 68%); animation:cheese-halo 4.8s ease-in-out infinite; }
    #${ROOT_ID} .cheese-board { position:absolute; left:22px; right:22px; bottom:24px; height:25px; border-radius:50%; background:linear-gradient(180deg,rgba(163,101,39,.27),rgba(112,65,25,.15)); box-shadow:0 10px 18px rgba(86,51,18,.09); }
    #${ROOT_ID} .cheese-wheel-svg { position:absolute; left:17px; top:27px; width:105px; height:105px; overflow:visible; filter:drop-shadow(0 14px 12px rgba(92,55,15,.17)); }
    #${ROOT_ID} .cheese-base-ring { fill:rgba(217,154,32,.1); stroke:rgba(160,96,18,.18); stroke-width:2; }
    #${ROOT_ID} .cheese-wedge { stroke:#b87518; stroke-width:1.4; stroke-linejoin:round; opacity:0; transform-box:fill-box; transform-origin:center; animation:cheese-wedge-fill 8.4s ease-in-out infinite; }
    #${ROOT_ID} .cheese-wedge.w1 { animation-delay:0s; }
    #${ROOT_ID} .cheese-wedge.w2 { animation-delay:.38s; }
    #${ROOT_ID} .cheese-wedge.w3 { animation-delay:.76s; }
    #${ROOT_ID} .cheese-wedge.w4 { animation-delay:1.14s; }
    #${ROOT_ID} .cheese-wedge.w5 { animation-delay:1.52s; }
    #${ROOT_ID} .cheese-wedge.w6 { animation-delay:1.9s; }
    #${ROOT_ID} .cheese-wedge.w7 { animation-delay:2.28s; }
    #${ROOT_ID} .cheese-wedge.w8 { animation-delay:2.66s; }
    #${ROOT_ID} .cheese-hole { fill:rgba(151,88,14,.2); pointer-events:none; }
    #${ROOT_ID} .cheese-rind { fill:none; stroke:rgba(151,88,14,.32); stroke-width:3; pointer-events:none; }

    /* CESTA DE PAES DE QUEIJO: desenhada em HTML/CSS e integrada a cena do queijo. */
    #${ROOT_ID} .pao-basket { display:none; position:absolute; right:13px; bottom:31px; width:75px; height:62px; z-index:4; transform-origin:50% 100%; animation:basket-arrive 8.4s ease-in-out infinite; filter:drop-shadow(0 10px 8px rgba(91,53,19,.18)); }
    #${ROOT_ID} .basket-handle { position:absolute; left:13px; top:2px; width:49px; height:39px; border:5px solid #9b5c27; border-bottom:0; border-radius:28px 28px 0 0; opacity:.9; }
    #${ROOT_ID} .basket-body { position:absolute; left:5px; right:5px; bottom:0; height:35px; overflow:hidden; border:2px solid #8b4f20; border-radius:8px 8px 18px 18px; background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 5px,transparent 5px 13px),linear-gradient(180deg,#d7943b,#a95f25); }
    #${ROOT_ID} .basket-body::after { content:""; position:absolute; left:0; right:0; top:10px; height:5px; background:rgba(105,55,20,.44); box-shadow:0 10px 0 rgba(105,55,20,.35); }
    #${ROOT_ID} .pao { position:absolute; z-index:3; width:23px; height:20px; border:1px solid rgba(161,92,15,.45); border-radius:52% 48% 45% 55%; background:radial-gradient(circle at 36% 28%,#fff2ad 0 10%,transparent 11%),linear-gradient(145deg,#f7d66b,#d99525 72%); box-shadow:inset -3px -4px 5px rgba(150,83,12,.15); animation:pao-pop 8.4s ease-in-out infinite; }
    #${ROOT_ID} .pao.p1 { left:9px; top:19px; transform:rotate(-12deg); }
    #${ROOT_ID} .pao.p2 { left:27px; top:11px; animation-delay:.18s; }
    #${ROOT_ID} .pao.p3 { right:7px; top:20px; transform:rotate(13deg); animation-delay:.36s; }
    #${ROOT_ID} .pao.p4 { left:27px; top:27px; width:21px; height:18px; animation-delay:.54s; }
    /* RIO SAO FRANCISCO: composicao grafica em camadas, inspirada na referencia enviada. */
    #${ROOT_ID} .mg-river-scene { width:210px; height:180px; position:relative; overflow:hidden; border-radius:22px; background:#315a7a; box-shadow:inset 0 0 0 3px rgba(255,255,255,.38); }
    #${ROOT_ID} .river-cloud { position:absolute; left:78px; top:38px; width:62px; height:25px; border-radius:30px; background:#fff; opacity:.95; animation:river-cloud 7s ease-in-out infinite; }
    #${ROOT_ID} .river-cloud::before,#${ROOT_ID} .river-cloud::after { content:""; position:absolute; bottom:0; border-radius:50%; background:#fff; }
    #${ROOT_ID} .river-cloud::before { left:8px; width:31px; height:31px; } #${ROOT_ID} .river-cloud::after { right:7px; width:24px; height:24px; }
    #${ROOT_ID} .river-leaf { position:absolute; z-index:3; width:35px; height:67px; }
    #${ROOT_ID} .river-leaf.left { left:11px; top:27px; transform:rotate(-18deg); } #${ROOT_ID} .river-leaf.right { right:10px; top:24px; transform:scaleX(-1) rotate(-15deg); }
    #${ROOT_ID} .river-leaf span { position:absolute; width:24px; height:14px; border-radius:100% 0 100% 0; background:#b9d51d; transform-origin:right center; }
    #${ROOT_ID} .river-leaf span:nth-child(1){top:0;left:8px;transform:rotate(55deg)} #${ROOT_ID} .river-leaf span:nth-child(2){top:19px;left:0;transform:rotate(18deg)} #${ROOT_ID} .river-leaf span:nth-child(3){top:39px;left:8px;transform:rotate(-19deg)}
    #${ROOT_ID} .river-wave-back { position:absolute; left:-30px; right:-30px; bottom:25px; height:76px; z-index:2; background:#48a196; border-radius:48% 52% 0 0; animation:river-wave-back 4.3s ease-in-out infinite; }
    #${ROOT_ID} .river-wave-back::before { content:""; position:absolute; left:0; right:0; top:14px; height:16px; background:#fff; clip-path:polygon(0 50%,12% 0,25% 62%,39% 12%,55% 72%,70% 16%,84% 65%,100% 10%,100% 100%,0 100%); }
    #${ROOT_ID} .river-wave-front { position:absolute; left:-24px; right:-24px; bottom:-9px; height:62px; z-index:5; background:#171512; border-radius:50% 45% 0 0; animation:river-wave-front 3.6s ease-in-out infinite; }
    #${ROOT_ID} .river-canoe-group { position:absolute; left:24px; bottom:56px; z-index:4; width:161px; height:72px; animation:river-canoe 5.2s ease-in-out infinite; }
    #${ROOT_ID} .river-canoe { position:absolute; left:12px; bottom:0; width:142px; height:28px; background:#171512; clip-path:polygon(0 12%,100% 0,88% 78%,66% 100%,24% 91%,7% 61%); }
    #${ROOT_ID} .river-person { position:absolute; bottom:20px; width:17px; height:29px; border-radius:9px 9px 2px 2px; background:#171512; }
    #${ROOT_ID} .river-person::before { content:""; position:absolute; left:2px; top:-12px; width:13px; height:13px; border-radius:50%; background:#171512; }
    #${ROOT_ID} .river-person::after { content:""; position:absolute; left:-6px; top:5px; width:28px; height:5px; border-radius:6px; background:#171512; transform:rotate(-42deg); }
    #${ROOT_ID} .river-person.p1 { left:73px; } #${ROOT_ID} .river-person.p2 { left:103px; height:34px; } #${ROOT_ID} .river-person.p3 { left:130px; height:25px; }
    #${ROOT_ID} .river-carranca { position:absolute; left:10px; bottom:17px; width:48px; height:51px; background:#171512; clip-path:polygon(21% 0,75% 3%,66% 18%,91% 35%,76% 50%,94% 65%,68% 69%,77% 100%,28% 87%,19% 61%,0 48%,17% 33%); animation:river-carranca 2.7s ease-in-out infinite; }
    #${ROOT_ID} .river-carranca::before { content:""; position:absolute; left:25px; top:21px; width:7px; height:7px; border-radius:50%; background:#fff; }
    #${ROOT_ID} .river-carranca::after { content:""; position:absolute; right:0; top:31px; width:22px; height:9px; border-radius:0 0 12px 12px; background:#d9342b; box-shadow:inset 0 3px 0 #fff; }
    /* CAFE: liquido desenhado por SVG com morphing, sem bloco crescendo. */
    #${ROOT_ID} .mg-coffee-scene { width:195px; height:180px; position:relative; overflow:hidden; border-radius:24px; }
    #${ROOT_ID} .coffee-halo { position:absolute; left:22px; top:13px; width:151px; height:143px; border-radius:50%; background:radial-gradient(circle,rgba(184,125,70,.17),transparent 69%); }
    #${ROOT_ID} .kettle-wrap { position:absolute; left:17px; top:9px; z-index:4; color:#765034; transform-origin:75px 53px; filter:drop-shadow(0 12px 12px rgba(84,53,26,.17)); animation:kettle-pour 9.2s cubic-bezier(.42,0,.25,1) infinite; }
    #${ROOT_ID} .kettle-wrap iconify-icon { font-size:99px; }
    #${ROOT_ID} .coffee-drops { position:absolute; inset:0; z-index:3; width:195px; height:180px; overflow:visible; pointer-events:none; opacity:0; animation:coffee-drops-visible 9.2s ease-in-out infinite; }
    #${ROOT_ID} .coffee-cup { position:absolute; right:22px; bottom:31px; width:81px; height:55px; z-index:2; }
    #${ROOT_ID} .cup-shell { position:absolute; left:0; bottom:0; width:69px; height:48px; overflow:hidden; border:3px solid rgba(89,57,31,.7); border-top-width:2px; border-radius:7px 7px 25px 25px; background:rgba(255,248,229,.82); box-shadow:inset 0 4px 0 rgba(255,255,255,.35),0 13px 16px rgba(84,53,26,.14); }
    #${ROOT_ID} .cup-handle { position:absolute; right:0; top:10px; width:25px; height:27px; border:5px solid rgba(89,57,31,.68); border-left:0; border-radius:0 20px 20px 0; }
    #${ROOT_ID} .cup-saucer { position:absolute; left:-9px; bottom:-7px; width:88px; height:12px; border-radius:50%; background:rgba(102,67,38,.18); }
    #${ROOT_ID} .coffee-svg { position:absolute; inset:0; width:100%; height:100%; }
    #${ROOT_ID} .coffee-steam { position:absolute; z-index:5; bottom:85px; width:13px; height:29px; border-left:2px solid rgba(255,255,255,.66); border-radius:50%; opacity:0; animation:coffee-steam 3.2s ease-in-out infinite; }
    #${ROOT_ID} .coffee-steam.s1 { right:69px; animation-delay:.3s; } #${ROOT_ID} .coffee-steam.s2 { right:49px; animation-delay:1.1s; }

    /* HISTORICO: casa restaurada com arco, movimento suave de lampiao, sino e particulas. */
    #${ROOT_ID} .mg-historic-scene { width:195px; height:180px; position:relative; overflow:hidden; border-radius:24px; }
    #${ROOT_ID} .historic-moonlight { position:absolute; left:24px; top:12px; width:148px; height:139px; border-radius:50%; background:radial-gradient(circle,rgba(242,201,76,.16),transparent 70%); animation:historic-light 5.2s ease-in-out infinite; }
    #${ROOT_ID} .historic-arch { position:absolute; left:43px; bottom:49px; width:110px; height:91px; border:5px solid rgba(111,66,30,.68); border-bottom:0; border-radius:57px 57px 0 0; background:linear-gradient(180deg,rgba(255,245,223,.4),rgba(236,201,144,.17)); box-shadow:0 16px 20px rgba(75,45,20,.14); }
    #${ROOT_ID} .historic-arch::before { content:""; position:absolute; left:30px; right:30px; bottom:0; height:57px; border-radius:999px 999px 0 0; background:rgba(94,58,30,.34); }
    #${ROOT_ID} .historic-arch::after { content:""; position:absolute; left:50%; top:14px; width:15px; height:21px; transform:translateX(-50%); border:2px solid rgba(111,66,30,.48); border-radius:8px 8px 2px 2px; background:rgba(242,201,76,.24); }
    #${ROOT_ID} .historic-lamp { position:absolute; left:23px; bottom:57px; color:#724923; transform-origin:50% 9%; filter:drop-shadow(0 8px 9px rgba(75,45,20,.14)); animation:historic-lamp 3.8s ease-in-out infinite; }
    #${ROOT_ID} .historic-lamp iconify-icon { font-size:54px; }
    #${ROOT_ID} .historic-bell { position:absolute; right:27px; bottom:76px; color:#ad7135; transform-origin:top center; filter:drop-shadow(0 8px 9px rgba(75,45,20,.14)); animation:historic-bell 3.4s ease-in-out infinite; }
    #${ROOT_ID} .historic-bell iconify-icon { font-size:43px; }
    #${ROOT_ID} .stone-road { position:absolute; left:17px; right:17px; bottom:27px; height:23px; border-radius:50%; opacity:.68; background:radial-gradient(ellipse at 13px 12px,rgba(123,88,54,.55) 0 7px,transparent 8px),radial-gradient(ellipse at 39px 11px,rgba(184,145,96,.54) 0 8px,transparent 9px),radial-gradient(ellipse at 67px 13px,rgba(123,88,54,.48) 0 7px,transparent 8px); background-size:85px 23px; animation:stone-road-loop 4.8s linear infinite; }
    #${ROOT_ID} .gold-spark { position:absolute; width:6px; height:6px; border-radius:50%; background:rgba(242,201,76,.88); box-shadow:0 0 10px rgba(242,201,76,.53); animation:historic-spark 3.8s ease-in-out infinite; }
    #${ROOT_ID} .gold-spark.a { left:48px; top:42px; } #${ROOT_ID} .gold-spark.b { right:43px; top:26px; animation-delay:1.1s; } #${ROOT_ID} .gold-spark.c { left:94px; bottom:44px; animation-delay:2.2s; }

    @keyframes bc-card-shine { 0%,22%{transform:translateX(-140%)} 55%,100%{transform:translateX(140%)} }
    @keyframes mg-map-breathe { 0%,100%{opacity:.68} 50%{opacity:.96} }
    @keyframes mg-outline-real { 0%{stroke-dashoffset:720;opacity:.46} 42%{stroke-dashoffset:0;opacity:1} 68%{stroke-dashoffset:0;opacity:1} 100%{stroke-dashoffset:-720;opacity:.46} }
    @keyframes mg-scan { 0%,100%{transform:translate(-27px,-18px) scale(.9);opacity:.27} 50%{transform:translate(29px,22px) scale(1.08);opacity:.68} }
    @keyframes mg-pin-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes train-glow-loop { 0%,100%{transform:scale(.94);opacity:.42} 50%{transform:scale(1.05);opacity:.75} }
    @keyframes train-sleepers-loop { to{background-position:31px 0} }
    @keyframes train-trip { 0%{transform:translateX(0) translateY(2px);opacity:0} 8%{opacity:1} 44%{transform:translateX(145px) translateY(-2px);opacity:1} 44%,61%{transform:translateX(145px) translateY(-2px);opacity:1} 94%{transform:translateX(330px) translateY(1px);opacity:1} 100%{transform:translateX(365px) translateY(1px);opacity:0} }
    @keyframes train-wheel-spin { to{transform:rotate(360deg)} }
    @keyframes train-lamp-pulse { 0%,100%{opacity:.65} 50%{opacity:1} }
    @keyframes train-smoke { 0%{transform:translate(0,0) scale(.55);opacity:0} 22%{opacity:.57} 100%{transform:translate(-17px,-36px) scale(1.7);opacity:0} }
    @keyframes cheese-halo { 0%,100%{transform:scale(.95);opacity:.46} 50%{transform:scale(1.04);opacity:.78} }
    @keyframes cheese-wedge-fill { 0%,5%{opacity:0;transform:scale(.86)} 12%,73%{opacity:1;transform:scale(1)} 88%,100%{opacity:0;transform:scale(.94)} }
    @keyframes basket-arrive { 0%,7%{transform:translateX(30px) translateY(8px) rotate(5deg);opacity:0} 17%,76%{transform:translateX(0) translateY(0) rotate(0);opacity:1} 89%,100%{transform:translateX(22px) translateY(6px) rotate(4deg);opacity:0} }
    @keyframes pao-pop { 0%,10%{transform:translateY(12px) scale(.65);opacity:0} 22%,75%{transform:translateY(0) scale(1);opacity:1} 89%,100%{transform:translateY(6px) scale(.82);opacity:0} }
    @keyframes river-cloud { 0%,100%{transform:translateX(-4px)} 50%{transform:translateX(8px)} }
    @keyframes river-wave-back { 0%,100%{transform:translateX(-7px) translateY(2px)} 50%{transform:translateX(8px) translateY(-3px)} }
    @keyframes river-wave-front { 0%,100%{transform:translateX(7px)} 50%{transform:translateX(-8px)} }
    @keyframes river-canoe { 0%,100%{transform:translateY(2px) rotate(-1deg)} 50%{transform:translateY(-6px) rotate(1deg)} }
    @keyframes river-carranca { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(4deg)} }
    @keyframes kettle-pour { 0%,18%{transform:translate(0,0) rotate(0)} 35%,72%{transform:translate(9px,5px) rotate(27deg)} 88%,100%{transform:translate(0,0) rotate(0)} }
    @keyframes coffee-drops-visible { 0%,28%,81%,100%{opacity:0} 36%,74%{opacity:1} }
    @keyframes coffee-steam { 0%,42%{transform:translateY(7px) scaleY(.7);opacity:0} 58%{opacity:.58} 100%{transform:translateY(-18px) scaleY(1.1);opacity:0} }
    @keyframes historic-light { 0%,100%{opacity:.46;transform:scale(.96)} 50%{opacity:.8;transform:scale(1.04)} }
    @keyframes historic-lamp { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
    @keyframes historic-bell { 0%,28%,72%,100%{transform:rotate(0)} 42%{transform:rotate(-6deg)} 57%{transform:rotate(6deg)} }
    @keyframes stone-road-loop { to{background-position:85px 0} }
    @keyframes historic-spark { 0%,100%{transform:translateY(4px) scale(.72);opacity:.24} 50%{transform:translateY(-10px) scale(1.08);opacity:.9} }

    /* ANIMACOES COM ASSETS PNG DA MESMA PASTA DO ARQUIVO JS. */
    #${ROOT_ID} .mg-cheese-scene.asset-cheese { overflow:visible; }
    #${ROOT_ID} .asset-cheese .cheese-halo { width:160px; height:160px; }
    #${ROOT_ID} .asset-cheese .cheese-board { left:13px; right:13px; bottom:18px; height:21px; }
    #${ROOT_ID} .cheese-wheel-compact { position:absolute; left:9px; top:47px; width:84px; height:84px; overflow:visible; filter:drop-shadow(0 12px 10px rgba(92,55,15,.16)); animation:asset-cheese-wheel 7.4s ease-in-out infinite; }
    #${ROOT_ID} .pao-asset-wrap { position:absolute; right:0; bottom:15px; z-index:5; width:126px; height:126px; display:grid; place-items:center; transform-origin:50% 90%; animation:asset-basket-cycle 7.4s cubic-bezier(.22,.75,.28,1) infinite; }
    #${ROOT_ID} .pao-asset { display:block; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 13px 10px rgba(83,48,18,.2)); }
    #${ROOT_ID} .pao-shine { position:absolute; z-index:6; right:26px; top:26px; width:22px; height:22px; border-radius:50%; border:3px solid rgba(255,255,255,.9); border-left-color:transparent; border-bottom-color:transparent; animation:asset-pao-shine 2.4s ease-in-out infinite; pointer-events:none; }

    #${ROOT_ID} .mg-river-scene.asset-river { width:210px; height:180px; overflow:hidden; border-radius:24px; background:linear-gradient(180deg,#f5df9c 0 49%,#79c2bd 50% 100%); box-shadow:inset 0 0 0 1px rgba(255,255,255,.42); }
    #${ROOT_ID} .river-sun-asset { position:absolute; right:21px; top:18px; width:35px; height:35px; border-radius:50%; background:#efb52b; box-shadow:0 0 0 8px rgba(239,181,43,.12); animation:asset-river-sun 4s ease-in-out infinite; }
    #${ROOT_ID} .river-bank-asset { position:absolute; left:-12px; right:-12px; bottom:64px; height:43px; opacity:.88; background:radial-gradient(ellipse at 7% 100%,#4e8a51 0 44%,transparent 45%),radial-gradient(ellipse at 34% 100%,#789f48 0 48%,transparent 49%),radial-gradient(ellipse at 72% 100%,#4e8a51 0 45%,transparent 46%),radial-gradient(ellipse at 105% 100%,#789f48 0 49%,transparent 50%); }
    #${ROOT_ID} .river-wave-layer { position:absolute; left:-34px; width:278px; height:42px; border-radius:50%; }
    #${ROOT_ID} .river-wave-layer.w1 { bottom:44px; z-index:2; background:#f7f1dd; animation:asset-wave-a 3.2s ease-in-out infinite; }
    #${ROOT_ID} .river-wave-layer.w2 { bottom:31px; z-index:3; background:#3f9d98; animation:asset-wave-b 2.7s ease-in-out infinite; }
    #${ROOT_ID} .river-wave-layer.w3 { bottom:10px; z-index:5; background:#17647a; animation:asset-wave-a 2.4s ease-in-out infinite reverse; }
    #${ROOT_ID} .canoa-asset-wrap { position:absolute; z-index:4; left:-138px; bottom:45px; width:135px; height:83px; animation:asset-canoa-cross 9.5s linear infinite; }
    #${ROOT_ID} .canoa-asset { position:absolute; left:0; bottom:0; width:135px; height:70px; object-fit:contain; filter:drop-shadow(0 8px 6px rgba(16,65,73,.22)); }
    #${ROOT_ID} .carranca-asset { position:absolute; z-index:6; left:5px; bottom:38px; width:57px; height:72px; object-fit:contain; transform-origin:50% 100%; filter:drop-shadow(0 5px 4px rgba(0,0,0,.2)); animation:asset-carranca-nod 1.8s ease-in-out infinite; }
    #${ROOT_ID} .river-ripple { position:absolute; z-index:7; bottom:33px; left:42px; width:50px; height:9px; border-top:2px solid rgba(255,255,255,.75); border-radius:50%; opacity:0; animation:asset-ripple 9.5s linear infinite; }

    @keyframes asset-cheese-wheel { 0%,100%{transform:rotate(-4deg) scale(.96)} 50%{transform:rotate(5deg) scale(1.02)} }
    @keyframes asset-basket-cycle { 0%,8%{transform:translate(38px,18px) rotate(7deg) scale(.78);opacity:0} 20%,72%{transform:translate(0,0) rotate(0) scale(1);opacity:1} 82%{transform:translateY(-5px) scale(1.03);opacity:1} 94%,100%{transform:translate(35px,15px) rotate(6deg) scale(.82);opacity:0} }
    @keyframes asset-pao-shine { 0%,100%{transform:translate(-5px,5px) rotate(5deg) scale(.7);opacity:0} 45%{opacity:.9} 70%{transform:translate(8px,-7px) rotate(28deg) scale(1);opacity:0} }
    @keyframes asset-river-sun { 0%,100%{transform:scale(.94);opacity:.75} 50%{transform:scale(1.08);opacity:1} }
    @keyframes asset-wave-a { 0%,100%{transform:translateX(-9px) translateY(2px)} 50%{transform:translateX(12px) translateY(-3px)} }
    @keyframes asset-wave-b { 0%,100%{transform:translateX(12px)} 50%{transform:translateX(-13px)} }
    @keyframes asset-canoa-cross { 0%{transform:translateX(0) translateY(3px) rotate(-1deg);opacity:0} 7%{opacity:1} 48%{transform:translateX(174px) translateY(-4px) rotate(1deg);opacity:1} 92%{opacity:1} 100%{transform:translateX(365px) translateY(2px) rotate(-1deg);opacity:0} }
    @keyframes asset-carranca-nod { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(4deg) translateY(-2px)} }
    @keyframes asset-ripple { 0%,8%{transform:translateX(-110px) scaleX(.4);opacity:0} 20%,75%{opacity:.8} 100%{transform:translateX(250px) scaleX(1.2);opacity:0} }
    /* AJUSTES FINAIS: fatias originais, cesta fixa, carranca fixa e canoa navegando. */
    #${ROOT_ID} .asset-cheese .cheese-wheel-svg { left:17px; top:25px; width:112px; height:112px; }
    #${ROOT_ID} .pao-static-wrap { position:absolute; right:0; bottom:23px; z-index:5; width:94px; height:94px; transform:rotate(2deg); }
    #${ROOT_ID} .pao-static { display:block; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 12px 10px rgba(83,48,18,.2)); }
    #${ROOT_ID} .pao-static-wrap .pao-shine { right:15px; top:15px; }
    #${ROOT_ID} .carranca-fixed-wrap { position:absolute; z-index:8; left:9px; bottom:45px; width:62px; height:78px; transform-origin:50% 100%; animation:asset-carranca-fixed 2.4s ease-in-out infinite; }
    #${ROOT_ID} .carranca-fixed { display:block; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 6px 5px rgba(0,0,0,.22)); }
    #${ROOT_ID} .canoa-only-wrap { position:absolute; z-index:4; left:-142px; bottom:45px; width:135px; height:70px; animation:asset-canoa-cross 9.5s linear infinite; }
    #${ROOT_ID} .canoa-only { display:block; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 8px 6px rgba(16,65,73,.22)); }
    @keyframes asset-carranca-fixed { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(5deg)} }

    /* NIEMEYER: formas abstratas baseadas em curvas, cupulas, colunas e concreto branco. */
    #${ROOT_ID} .mg-niemeyer-scene { width:210px; height:180px; position:relative; overflow:hidden; border-radius:24px; background:linear-gradient(180deg,#86b9d7 0 62%,#d9cda9 63% 100%); }
    #${ROOT_ID} .niemeyer-sun { position:absolute; right:23px; top:17px; width:31px; height:31px; border-radius:50%; background:#f0c64c; box-shadow:0 0 24px rgba(240,198,76,.4); animation:niemeyer-sun 4.2s ease-in-out infinite; }
    #${ROOT_ID} .niemeyer-cloud { position:absolute; top:34px; left:-47px; width:43px; height:12px; border-radius:20px; background:rgba(255,255,255,.7); animation:niemeyer-cloud 9s linear infinite; }
    #${ROOT_ID} .niemeyer-platform { position:absolute; left:12px; right:12px; bottom:26px; height:7px; border-radius:50%; background:rgba(84,78,69,.2); box-shadow:0 9px 10px rgba(84,78,69,.13); }
    #${ROOT_ID} .niemeyer-dome { position:absolute; left:31px; bottom:36px; width:76px; height:38px; overflow:hidden; border-radius:76px 76px 4px 4px; background:linear-gradient(180deg,#fff,#d9e0e1); transform-origin:50% 100%; animation:niemeyer-dome 6.5s ease-in-out infinite; }
    #${ROOT_ID} .niemeyer-dome::after { content:""; position:absolute; left:7px; right:7px; bottom:0; height:5px; border-radius:50%; background:#355c76; }
    #${ROOT_ID} .niemeyer-bowl { position:absolute; right:24px; bottom:37px; width:70px; height:32px; border-radius:0 0 70px 70px; background:linear-gradient(180deg,#f9fbfb,#d6dedf); transform-origin:50% 0; animation:niemeyer-bowl 6.5s ease-in-out infinite; }
    #${ROOT_ID} .niemeyer-towers { position:absolute; left:95px; bottom:38px; width:39px; height:105px; display:flex; gap:7px; align-items:flex-end; }
    #${ROOT_ID} .niemeyer-tower { width:16px; height:0; border-radius:2px 2px 0 0; background:linear-gradient(90deg,#eef3f3 0 36%,#668da5 37% 63%,#fff 64%); box-shadow:0 6px 8px rgba(47,79,96,.14); animation:niemeyer-tower-rise 6.5s cubic-bezier(.2,.75,.23,1) infinite; }
    #${ROOT_ID} .niemeyer-tower.t2 { animation-delay:.35s; }
    #${ROOT_ID} .niemeyer-columns { position:absolute; left:12px; bottom:38px; width:181px; height:83px; opacity:.9; }
    #${ROOT_ID} .niemeyer-column { position:absolute; bottom:0; width:7px; height:69px; border-radius:50%; border-left:5px solid rgba(255,255,255,.92); transform:skewX(-18deg); opacity:0; animation:niemeyer-columns-draw 6.5s ease-in-out infinite; }
    #${ROOT_ID} .niemeyer-column:nth-child(1){left:7px} #${ROOT_ID} .niemeyer-column:nth-child(2){left:30px;animation-delay:.12s} #${ROOT_ID} .niemeyer-column:nth-child(3){right:29px;transform:skewX(18deg);animation-delay:.24s} #${ROOT_ID} .niemeyer-column:nth-child(4){right:6px;transform:skewX(18deg);animation-delay:.36s}
    #${ROOT_ID} .niemeyer-line { position:absolute; left:9px; bottom:17px; width:190px; height:25px; border-top:3px solid rgba(49,91,138,.75); border-radius:50%; animation:niemeyer-line-draw 6.5s ease-in-out infinite; }
    @keyframes niemeyer-sun { 0%,100%{transform:scale(.94);opacity:.75} 50%{transform:scale(1.08);opacity:1} }
    @keyframes niemeyer-cloud { 0%{transform:translateX(0);opacity:0} 10%,88%{opacity:.8} 100%{transform:translateX(300px);opacity:0} }
    @keyframes niemeyer-tower-rise { 0%,8%{height:0;opacity:0} 30%,76%{height:103px;opacity:1} 92%,100%{height:0;opacity:0} }
    @keyframes niemeyer-dome { 0%,12%{transform:scaleX(.15);opacity:0} 32%,78%{transform:scaleX(1);opacity:1} 94%,100%{transform:scaleX(.15);opacity:0} }
    @keyframes niemeyer-bowl { 0%,18%{transform:scaleX(.15);opacity:0} 38%,78%{transform:scaleX(1);opacity:1} 94%,100%{transform:scaleX(.15);opacity:0} }
    @keyframes niemeyer-columns-draw { 0%,10%{height:0;opacity:0} 35%,78%{height:69px;opacity:1} 94%,100%{height:0;opacity:0} }
    @keyframes niemeyer-line-draw { 0%,100%{transform:scaleX(.1);opacity:0} 30%,80%{transform:scaleX(1);opacity:1} }
    /* AJUSTE DO RIO: carranca menor, quase fixa; movimento principal concentrado na canoa. */
    #${ROOT_ID} .carranca-fixed-wrap { left:13px; bottom:48px; width:43px; height:55px; animation:asset-carranca-gentle 5.8s ease-in-out infinite; }
    #${ROOT_ID} .river-wave-layer.w1 { animation-duration:7.2s; }
    #${ROOT_ID} .river-wave-layer.w2 { animation-duration:6.4s; }
    #${ROOT_ID} .river-wave-layer.w3 { animation-duration:5.8s; }
    #${ROOT_ID} .canoa-only-wrap { animation-duration:8.2s; }
    @keyframes asset-carranca-gentle { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-2px) rotate(1.5deg)} }

    /* LAGOA DA PAMPULHA: foco na Igrejinha de Sao Francisco de Assis. */
    #${ROOT_ID} .mg-pampulha-scene { width:210px; height:180px; position:relative; overflow:hidden; border-radius:24px; background:linear-gradient(180deg,#83b9d8 0 53%,#d8e8df 54% 63%,#4e9da9 64% 100%); }
    #${ROOT_ID} .pampulha-sun { position:absolute; right:22px; top:17px; width:30px; height:30px; border-radius:50%; background:#efc24d; box-shadow:0 0 22px rgba(239,194,77,.42); animation:pampulha-sun 5s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-cloud { position:absolute; left:-58px; top:29px; width:49px; height:13px; border-radius:20px; background:rgba(255,255,255,.75); animation:pampulha-cloud 10s linear infinite; }
    #${ROOT_ID} .pampulha-cloud::before,#${ROOT_ID} .pampulha-cloud::after { content:""; position:absolute; bottom:0; border-radius:50%; background:inherit; }
    #${ROOT_ID} .pampulha-cloud::before { left:8px; width:20px; height:20px; } #${ROOT_ID} .pampulha-cloud::after { right:7px; width:16px; height:16px; }
    #${ROOT_ID} .pampulha-shore { position:absolute; left:-10px; right:-10px; bottom:58px; height:24px; background:radial-gradient(ellipse at 8% 100%,#56894b 0 48%,transparent 50%),radial-gradient(ellipse at 35% 100%,#76a257 0 53%,transparent 55%),radial-gradient(ellipse at 70% 100%,#56894b 0 48%,transparent 50%),radial-gradient(ellipse at 104% 100%,#76a257 0 52%,transparent 54%); }
    #${ROOT_ID} .pampulha-church { position:absolute; left:31px; bottom:58px; z-index:4; width:146px; height:91px; filter:drop-shadow(0 10px 8px rgba(40,72,79,.18)); animation:pampulha-church-reveal 7s ease-in-out infinite; transform-origin:50% 100%; }
    #${ROOT_ID} .church-main-vault { position:absolute; left:38px; bottom:0; width:74px; height:63px; overflow:hidden; border-radius:74px 74px 5px 5px; background:linear-gradient(90deg,#f8f4e8 0 68%,#dfe5e3 69%); }
    #${ROOT_ID} .church-main-vault::before { content:""; position:absolute; left:7px; bottom:7px; width:59px; height:31px; border-radius:3px; background:repeating-linear-gradient(90deg,#e7f0ed 0 7px,#447fa0 7px 13px); opacity:.92; }
    #${ROOT_ID} .church-main-vault::after { content:""; position:absolute; left:11px; bottom:12px; width:51px; height:20px; background:linear-gradient(155deg,transparent 0 18%,rgba(255,255,255,.65) 19% 22%,transparent 23% 44%,rgba(255,255,255,.62) 45% 48%,transparent 49%); }
    #${ROOT_ID} .church-small-vault { position:absolute; left:101px; bottom:0; width:41px; height:42px; border-radius:41px 41px 4px 4px; background:#f5f1e6; }
    #${ROOT_ID} .church-marquee { position:absolute; left:20px; bottom:34px; width:47px; height:5px; border-radius:4px; background:#fffdf5; transform:rotate(-6deg); }
    #${ROOT_ID} .church-bell { position:absolute; left:3px; bottom:6px; width:23px; height:78px; border:4px solid #f7f3e9; border-bottom-width:7px; transform:skewX(-5deg); }
    #${ROOT_ID} .church-bell::before { content:""; position:absolute; left:4px; top:6px; width:7px; height:50px; border-left:3px solid #f7f3e9; border-right:3px solid #f7f3e9; }
    #${ROOT_ID} .church-bell::after { content:""; position:absolute; left:5px; top:26px; width:7px; height:7px; border-radius:50%; background:#315b8a; animation:pampulha-bell 3.8s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-cross { position:absolute; left:9px; top:-9px; width:3px; height:13px; background:#f7f3e9; }
    #${ROOT_ID} .pampulha-cross::after { content:""; position:absolute; left:-4px; top:4px; width:11px; height:3px; background:#f7f3e9; }
    #${ROOT_ID} .pampulha-water { position:absolute; z-index:5; left:-22px; right:-22px; bottom:-10px; height:66px; background:repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 2px,transparent 2px 12px),linear-gradient(180deg,#5aabb4,#237587); border-radius:48% 54% 0 0; animation:pampulha-water 6.3s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-reflection { position:absolute; z-index:6; left:53px; bottom:4px; width:91px; height:40px; opacity:.32; transform:scaleY(-1) skewX(-8deg); background:repeating-linear-gradient(90deg,transparent 0 7px,rgba(247,243,233,.8) 7px 12px,transparent 12px 18px); clip-path:polygon(18% 0,82% 0,100% 100%,0 100%); animation:pampulha-reflection 4.8s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-ripple { position:absolute; z-index:7; left:19px; bottom:30px; width:174px; height:16px; border-top:2px solid rgba(255,255,255,.72); border-radius:50%; animation:pampulha-ripple 4.4s ease-in-out infinite; }
    @keyframes pampulha-sun { 0%,100%{transform:scale(.95);opacity:.78} 50%{transform:scale(1.07);opacity:1} }
    @keyframes pampulha-cloud { 0%{transform:translateX(0);opacity:0} 10%,88%{opacity:.8} 100%{transform:translateX(320px);opacity:0} }
    @keyframes pampulha-church-reveal { 0%,9%{transform:translateY(13px);opacity:0} 27%,82%{transform:translateY(0);opacity:1} 94%,100%{transform:translateY(7px);opacity:0} }
    @keyframes pampulha-bell { 0%,42%,58%,100%{transform:translateX(0)} 48%{transform:translateX(-2px)} 52%{transform:translateX(2px)} }
    @keyframes pampulha-water { 0%,100%{transform:translateX(-6px) translateY(1px)} 50%{transform:translateX(7px) translateY(-2px)} }
    @keyframes pampulha-reflection { 0%,100%{transform:scaleY(-1) skewX(-8deg) translateX(-3px);opacity:.24} 50%{transform:scaleY(-1) skewX(5deg) translateX(4px);opacity:.4} }
    @keyframes pampulha-ripple { 0%,100%{transform:scaleX(.72);opacity:.35} 50%{transform:scaleX(1.08);opacity:.82} }
    /* REFINO FINAL DO RIO: carranca em destaque e canoa como elemento navegante. */
    #${ROOT_ID} .carranca-fixed-wrap { left:5px; bottom:42px; width:82px; height:104px; z-index:9; animation:asset-carranca-highlight 6.8s ease-in-out infinite; }
    #${ROOT_ID} .carranca-fixed { filter:drop-shadow(0 8px 7px rgba(0,0,0,.26)); }
    #${ROOT_ID} .canoa-only-wrap { z-index:6; bottom:42px; }
    @keyframes asset-carranca-highlight { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-2px) rotate(1deg)} }

    /* PAMPULHA RECONSTRUIDA: perfil ondulado fiel ao formato das referencias. */
    #${ROOT_ID} .mg-pampulha-scene.pampulha-v2 { background:linear-gradient(180deg,#9bc7df 0 54%,#e9e3c9 55% 67%,#4d98aa 68% 100%); }
    #${ROOT_ID} .pampulha-v2 .pampulha-shore { bottom:51px; height:37px; background:linear-gradient(170deg,transparent 0 18%,#79a955 19% 100%); border-radius:50% 52% 0 0; }
    #${ROOT_ID} .pampulha-v2 .pampulha-church { left:20px; bottom:58px; width:170px; height:92px; animation:pampulha-v2-reveal 7.4s ease-in-out infinite; }
    #${ROOT_ID} .church-wave-shell { position:absolute; left:8px; bottom:1px; width:126px; height:78px; filter:drop-shadow(0 7px 5px rgba(52,80,87,.16)); }
    #${ROOT_ID} .church-vault-back { position:absolute; left:0; bottom:0; width:53px; height:43px; border:3px solid #548095; border-bottom:0; border-radius:52px 52px 4px 4px; background:#edf2ed; transform-origin:50% 100%; animation:pampulha-vault-back 7.4s ease-in-out infinite; }
    #${ROOT_ID} .church-vault-mid { position:absolute; left:29px; bottom:0; width:57px; height:58px; border:3px solid #548095; border-bottom:0; border-radius:57px 57px 4px 4px; background:#f4f1e7; transform-origin:50% 100%; animation:pampulha-vault-mid 7.4s ease-in-out infinite; }
    #${ROOT_ID} .church-vault-main { position:absolute; left:57px; bottom:0; width:69px; height:78px; overflow:hidden; border:3px solid #426f86; border-bottom:0; border-radius:69px 69px 3px 3px; background:linear-gradient(90deg,#d9ebec 0 67%,#f8f3e8 68%); transform-origin:50% 100%; animation:pampulha-vault-main 7.4s ease-in-out infinite; }
    #${ROOT_ID} .church-vault-main::before { content:""; position:absolute; left:7px; right:7px; bottom:8px; height:54px; border-radius:50px 50px 2px 2px; background:repeating-linear-gradient(90deg,#9bcbd3 0 5px,#4d8da5 5px 8px); opacity:.85; }
    #${ROOT_ID} .church-vault-main::after { content:""; position:absolute; left:10px; right:10px; bottom:9px; height:26px; border-radius:45px 45px 2px 2px; background:#9b6546; box-shadow:inset 0 4px 0 rgba(255,255,255,.22); }
    #${ROOT_ID} .church-entry { position:absolute; left:71px; bottom:3px; z-index:5; width:43px; height:21px; border-radius:35px 35px 2px 2px; background:linear-gradient(90deg,#81523c 0 31%,#b57854 32% 65%,#81523c 66%); }
    #${ROOT_ID} .church-awning { position:absolute; left:47px; bottom:26px; z-index:6; width:31px; height:4px; border-radius:5px; background:#fffdf4; transform:rotate(-8deg); }
    #${ROOT_ID} .church-tower-v2 { position:absolute; right:7px; bottom:1px; width:29px; height:87px; background:#f7efd3; border:3px solid #a28b47; clip-path:polygon(22% 0,100% 0,77% 100%,0 100%); transform-origin:50% 100%; animation:pampulha-tower-rise 7.4s ease-in-out infinite; }
    #${ROOT_ID} .church-tower-v2::before { content:""; position:absolute; inset:8px 6px 15px; background:repeating-linear-gradient(45deg,transparent 0 5px,rgba(67,91,90,.72) 5px 7px),repeating-linear-gradient(-45deg,transparent 0 5px,rgba(67,91,90,.72) 5px 7px); }
    #${ROOT_ID} .church-cross-v2 { position:absolute; right:15px; top:-9px; width:3px; height:13px; background:#776b3f; }
    #${ROOT_ID} .church-cross-v2::after { content:""; position:absolute; left:-4px; top:4px; width:11px; height:3px; background:#776b3f; }
    #${ROOT_ID} .pampulha-v2 .pampulha-water { bottom:-13px; height:65px; animation:pampulha-water-v2 7s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-v2 .pampulha-reflection { left:48px; width:105px; bottom:0; opacity:.24; }
    #${ROOT_ID} .pampulha-v2 .pampulha-ripple { bottom:25px; animation-duration:5.6s; }
    @keyframes pampulha-v2-reveal { 0%,8%{transform:translateY(7px);opacity:0} 25%,84%{transform:translateY(0);opacity:1} 96%,100%{transform:translateY(5px);opacity:0} }
    @keyframes pampulha-vault-back { 0%,11%{transform:scaleX(.15);opacity:0} 28%,86%{transform:scaleX(1);opacity:1} 97%,100%{transform:scaleX(.25);opacity:0} }
    @keyframes pampulha-vault-mid { 0%,15%{transform:scaleX(.15);opacity:0} 34%,86%{transform:scaleX(1);opacity:1} 97%,100%{transform:scaleX(.25);opacity:0} }
    @keyframes pampulha-vault-main { 0%,19%{transform:scaleX(.12);opacity:0} 40%,86%{transform:scaleX(1);opacity:1} 97%,100%{transform:scaleX(.2);opacity:0} }
    @keyframes pampulha-tower-rise { 0%,27%{transform:scaleY(.08);opacity:0} 47%,86%{transform:scaleY(1);opacity:1} 97%,100%{transform:scaleY(.12);opacity:0} }
    @keyframes pampulha-water-v2 { 0%,100%{transform:translateX(-4px) translateY(1px)} 50%{transform:translateX(5px) translateY(-1px)} }
    /* AJUSTES DE COMPOSICAO FINAIS. */
    #${ROOT_ID} .pao-static-wrap { right:10px; bottom:27px; width:104px; height:104px; z-index:7; transform:rotate(1deg); }
    #${ROOT_ID} .asset-cheese .cheese-wheel-svg { left:20px; top:26px; width:114px; height:114px; }

    /* VELHO CHICO: canoa mais viva e agua com camadas entrelacadas. */
    #${ROOT_ID} .asset-river { background:linear-gradient(180deg,#f1d58c 0 45%,#b6c775 46% 56%,#4ca7a4 57% 100%); }
    #${ROOT_ID} .asset-river::after { content:""; position:absolute; z-index:4; left:-30px; right:-30px; bottom:18px; height:55px; opacity:.58; background:repeating-linear-gradient(165deg,transparent 0 13px,rgba(255,255,255,.28) 13px 17px,transparent 17px 31px),repeating-linear-gradient(20deg,transparent 0 18px,rgba(19,97,118,.3) 18px 24px,transparent 24px 40px); animation:river-texture-weave 5.2s linear infinite; pointer-events:none; }
    #${ROOT_ID} .river-wave-layer.w1 { bottom:47px; background:linear-gradient(90deg,#f6f0d8 0 28%,#b8ded3 29% 54%,#f6f0d8 55% 100%); opacity:.92; }
    #${ROOT_ID} .river-wave-layer.w2 { bottom:31px; background:linear-gradient(100deg,#2b8f93 0 22%,#65b4a1 23% 47%,#237a91 48% 72%,#58aaa4 73% 100%); }
    #${ROOT_ID} .river-wave-layer.w3 { bottom:4px; height:58px; background:linear-gradient(85deg,#124f6d 0 24%,#1d7483 25% 45%,#163f62 46% 66%,#287f86 67% 100%); }
    #${ROOT_ID} .canoa-only-wrap { bottom:43px; animation:asset-canoa-lively 7.8s linear infinite; transform-origin:50% 75%; }
    #${ROOT_ID} .river-ripple { width:67px; border-top:3px solid rgba(255,255,255,.78); }
    @keyframes asset-canoa-lively { 0%{transform:translateX(0) translateY(4px) rotate(-2deg);opacity:0} 7%{opacity:1} 22%{transform:translateX(75px) translateY(-4px) rotate(2.2deg);opacity:1} 43%{transform:translateX(154px) translateY(2px) rotate(-1.5deg);opacity:1} 65%{transform:translateX(236px) translateY(-5px) rotate(2.5deg);opacity:1} 91%{opacity:1} 100%{transform:translateX(365px) translateY(2px) rotate(-1deg);opacity:0} }
    @keyframes river-texture-weave { from{background-position:0 0,0 0} to{background-position:62px 0,-80px 0} }

    /* IGREJINHA DA PAMPULHA: silhueta continua com quatro cascas parabolicas e campanario independente. */
    #${ROOT_ID} .pampulha-v3 .pampulha-church { left:20px; bottom:57px; width:174px; height:100px; }
    #${ROOT_ID} .church-shell-svg { position:absolute; left:0; bottom:0; width:139px; height:91px; overflow:visible; filter:drop-shadow(0 8px 6px rgba(43,75,83,.18)); }
    #${ROOT_ID} .church-shell-outline { fill:#f5f1e8; stroke:#426f86; stroke-width:2.4; stroke-linejoin:round; }
    #${ROOT_ID} .church-glass { fill:#8fc5d0; stroke:#426f86; stroke-width:2; }
    #${ROOT_ID} .church-glass-line { stroke:rgba(62,116,139,.62); stroke-width:1.2; }
    #${ROOT_ID} .church-door { fill:#9d684c; stroke:#744a38; stroke-width:1.4; }
    #${ROOT_ID} .church-canopy { fill:none; stroke:#fffdf5; stroke-width:4; stroke-linecap:round; }
    #${ROOT_ID} .church-shell-draw { stroke-dasharray:520; stroke-dashoffset:520; animation:pampulha-shell-draw 7.8s ease-in-out infinite; }
    #${ROOT_ID} .church-tower-svg { position:absolute; right:2px; bottom:1px; width:37px; height:95px; overflow:visible; filter:drop-shadow(0 7px 5px rgba(43,75,83,.15)); animation:pampulha-tower-v3 7.8s ease-in-out infinite; transform-origin:50% 100%; }
    #${ROOT_ID} .tower-body { fill:#f1e7ba; stroke:#9e8746; stroke-width:2; }
    #${ROOT_ID} .tower-grid { stroke:#607f81; stroke-width:1.2; opacity:.8; }
    #${ROOT_ID} .tower-cross { stroke:#655a39; stroke-width:2.6; stroke-linecap:round; }
    #${ROOT_ID} .pampulha-v3 .pampulha-reflection { left:43px; width:112px; opacity:.2; }
    @keyframes pampulha-shell-draw { 0%,8%{stroke-dashoffset:520;opacity:.15} 36%,84%{stroke-dashoffset:0;opacity:1} 96%,100%{stroke-dashoffset:-520;opacity:.15} }
    @keyframes pampulha-tower-v3 { 0%,24%{transform:scaleY(.08);opacity:0} 45%,85%{transform:scaleY(1);opacity:1} 97%,100%{transform:scaleY(.1);opacity:0} }
    /* ===== REFACTOR VISUAL V4 ===== */
    #${ROOT_ID} .bc-grid { grid-template-columns:repeat(3,minmax(230px,1fr)); gap:18px; }
    #${ROOT_ID} .bc-card { min-height:342px; }
    #${ROOT_ID} .bc-stage { min-height:205px; }

    /* QUEIJO: mantem as fatias; cesta apenas como composicao lateral. */
    #${ROOT_ID} .asset-cheese .cheese-wheel-svg { left:13px; top:27px; width:122px; height:122px; }
    #${ROOT_ID} .pao-static-wrap { right:-1px; bottom:22px; width:112px; height:112px; z-index:7; transform:none; }
    #${ROOT_ID} .pao-static { filter:drop-shadow(0 12px 9px rgba(82,48,20,.17)); }
    #${ROOT_ID} .pao-static-wrap .pao-shine { display:none; }

    /* VELHO CHICO: uma cena clara, sem excesso de camadas. */
    #${ROOT_ID} .mg-river-scene.asset-river { width:210px; height:184px; background:linear-gradient(180deg,#f2d58f 0 44%,#d7dcaa 45% 56%,#56aaa7 57% 100%); }
    #${ROOT_ID} .asset-river::after { content:""; position:absolute; left:-25px; right:-25px; bottom:4px; height:79px; z-index:3; opacity:.55; background:repeating-radial-gradient(ellipse at 20px 0,transparent 0 15px,rgba(255,255,255,.34) 16px 18px,transparent 19px 31px); animation:river-water-texture 5.6s linear infinite; pointer-events:none; }
    #${ROOT_ID} .river-wave-layer.w1 { z-index:2; bottom:43px; height:43px; background:#eaf0d8; opacity:.88; animation:river-wave-soft-a 5.4s ease-in-out infinite; }
    #${ROOT_ID} .river-wave-layer.w2 { z-index:3; bottom:25px; height:51px; background:linear-gradient(90deg,#449e98,#70b7a3 42%,#238395 72%,#52aaa4); animation:river-wave-soft-b 4.6s ease-in-out infinite; }
    #${ROOT_ID} .river-wave-layer.w3 { z-index:5; bottom:-10px; height:61px; background:linear-gradient(90deg,#174f70,#1e7483 44%,#143f62 70%,#287d84); animation:river-wave-soft-a 4.2s ease-in-out infinite reverse; }
    #${ROOT_ID} .carranca-fixed-wrap { left:7px; bottom:43px; width:88px; height:112px; z-index:10; animation:carranca-breathe 7.5s ease-in-out infinite; }
    #${ROOT_ID} .carranca-fixed { filter:drop-shadow(0 9px 7px rgba(20,47,51,.28)); }
    #${ROOT_ID} .canoa-only-wrap { left:-145px; bottom:42px; width:140px; height:74px; z-index:7; animation:canoa-v4 8.3s linear infinite; }
    #${ROOT_ID} .river-ripple { display:none; }
    @keyframes river-water-texture { to{background-position:64px 0} }
    @keyframes river-wave-soft-a { 0%,100%{transform:translateX(-8px) translateY(1px)} 50%{transform:translateX(10px) translateY(-2px)} }
    @keyframes river-wave-soft-b { 0%,100%{transform:translateX(11px)} 50%{transform:translateX(-12px)} }
    @keyframes carranca-breathe { 0%,100%{transform:rotate(-.7deg) translateY(0)} 50%{transform:rotate(.8deg) translateY(-1px)} }
    @keyframes canoa-v4 { 0%{transform:translateX(0) translateY(4px) rotate(-2deg);opacity:0} 7%{opacity:1} 25%{transform:translateX(92px) translateY(-5px) rotate(2.4deg)} 49%{transform:translateX(181px) translateY(2px) rotate(-1.4deg)} 73%{transform:translateX(271px) translateY(-4px) rotate(2deg)} 93%{opacity:1} 100%{transform:translateX(375px) translateY(1px) rotate(-1deg);opacity:0} }

    /* PAMPULHA V4: silhueta limpa da igreja, sem volumes genericos. */
    #${ROOT_ID} .mg-pampulha-scene.pampulha-v4 { width:210px; height:184px; background:linear-gradient(180deg,#a8d0e2 0 55%,#e8e0c3 56% 69%,#579dae 70% 100%); }
    #${ROOT_ID} .pampulha-v4 .pampulha-shore { left:-8px; right:-8px; bottom:49px; height:36px; border-radius:55% 48% 0 0; background:linear-gradient(175deg,transparent 0 18%,#77a756 19% 100%); }
    #${ROOT_ID} .pampulha-v4 .pampulha-church { left:13px; bottom:55px; width:185px; height:108px; animation:none; }
    #${ROOT_ID} .pampulha-church-svg { position:absolute; inset:0; width:185px; height:108px; overflow:visible; filter:drop-shadow(0 8px 6px rgba(43,72,80,.18)); }
    #${ROOT_ID} .pampulha-shell { fill:#f7f3e8; stroke:#486f83; stroke-width:2.2; stroke-linejoin:round; }
    #${ROOT_ID} .pampulha-glass { fill:#91c5ce; stroke:#486f83; stroke-width:2; }
    #${ROOT_ID} .pampulha-glass-grid { stroke:#5c96a7; stroke-width:1; opacity:.72; }
    #${ROOT_ID} .pampulha-door { fill:#a97050; stroke:#794b39; stroke-width:1.3; }
    #${ROOT_ID} .pampulha-canopy { fill:none; stroke:#fffdf4; stroke-width:4; stroke-linecap:round; }
    #${ROOT_ID} .pampulha-tower { fill:#efe4b4; stroke:#928044; stroke-width:2; }
    #${ROOT_ID} .pampulha-tower-grid { stroke:#687e77; stroke-width:1; opacity:.75; }
    #${ROOT_ID} .pampulha-cross { stroke:#625839; stroke-width:2.5; stroke-linecap:round; }
    #${ROOT_ID} .pampulha-draw { stroke-dasharray:650; stroke-dashoffset:650; animation:pampulha-outline-v4 7.8s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-fill { animation:pampulha-fill-v4 7.8s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-v4 .pampulha-water { bottom:-15px; height:67px; opacity:.9; animation:river-wave-soft-a 6.8s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-v4 .pampulha-reflection { left:48px; bottom:0; width:105px; opacity:.18; animation:pampulha-reflection 6s ease-in-out infinite; }
    #${ROOT_ID} .pampulha-v4 .pampulha-ripple { bottom:24px; opacity:.45; animation-duration:6s; }
    @keyframes pampulha-outline-v4 { 0%,7%{stroke-dashoffset:650;opacity:.25} 34%,84%{stroke-dashoffset:0;opacity:1} 96%,100%{stroke-dashoffset:-650;opacity:.2} }
    @keyframes pampulha-fill-v4 { 0%,14%{opacity:0} 37%,85%{opacity:1} 96%,100%{opacity:0} }
    @media (max-width:1180px) { #${ROOT_ID}{padding:24px 20px} #${ROOT_ID} .bc-grid{grid-template-columns:repeat(2,minmax(220px,1fr))} }
    @media (max-width:760px) { #${ROOT_ID}{padding:18px 14px 28px} #${ROOT_ID} .bc-showcase{width:min(420px,100%)} #${ROOT_ID} .bc-grid{grid-template-columns:1fr} #${ROOT_ID} .bc-card{min-height:315px} }
    @media (prefers-reduced-motion:reduce) { #${ROOT_ID} *,#${ROOT_ID} *::before,#${ROOT_ID} *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important} }
  `;

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = `
    <section class="bc-showcase" aria-label="Opções de carregamento do Balanço Cidadão de Minas Gerais">
      <div class="bc-grid">
        ${config.loaders
          .map(
            (item, index) => `
          <article class="bc-card" style="--accent:${item.accent};--accent-soft:${hexToRgba(item.accent, 0.18)}" data-card data-index="${item.originalIndex}" data-eta="${item.eta}">
            <div class="bc-stage" aria-hidden="true">${renderLoader(item.id)}</div>
            <footer class="bc-footer">
              <div class="bc-message" data-message>${config.messages[item.originalIndex % config.messages.length]}</div>
              <div class="bc-eta" data-eta-label>Tempo previsto: ${item.eta} segundos</div>
              <div class="bc-progress" role="progressbar" aria-label="Progresso do carregamento" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bc-progress-bar" data-progress-bar></div></div>
              <div class="bc-progress-meta"><span data-percent>0%</span><span data-status>Carregando</span></div>
            </footer>
          </article>`,
          )
          .join("")}
      </div>
    </section>`;

  document.head.appendChild(style);
  document.body.appendChild(root);
  setupProgress();
  loadMinasGeoJson();

  function destroy() {
    intervals.forEach((id) => clearInterval(id));
    intervals.length = 0;
    root.remove();
    style.remove();
  }

  function setupProgress() {
    [...root.querySelectorAll("[data-card]")].forEach((card) => {
      const index = Number(card.dataset.index);
      let progress = Math.min(index * 8, 30);
      let messageIndex = index % config.messages.length;
      const baseEta = Number(card.dataset.eta);
      const progressBar = card.querySelector("[data-progress-bar]");
      const progressWrap = card.querySelector(".bc-progress");
      const percent = card.querySelector("[data-percent]");
      const status = card.querySelector("[data-status]");
      const message = card.querySelector("[data-message]");
      const etaLabel = card.querySelector("[data-eta-label]");
      update();
      const id = setInterval(
        () => {
          progress += (1.6 + Math.random() * 3.2) * (progress > 78 ? 0.58 : 1);
          if (progress >= 100) {
            progress = 0;
            messageIndex = (messageIndex + 1) % config.messages.length;
          }
          update();
        },
        620 + index * 90,
      );
      intervals.push(id);
      function update() {
        const rounded = Math.round(progress);
        const remaining = Math.max(
          1,
          Math.ceil(baseEta * (1 - progress / 100)),
        );
        progressBar.style.width = `${rounded}%`;
        progressWrap.setAttribute("aria-valuenow", String(rounded));
        percent.textContent = `${rounded}%`;
        message.textContent = config.messages[messageIndex];
        status.textContent =
          rounded >= 92
            ? "Finalizando"
            : rounded >= 66
              ? "Processando"
              : rounded >= 34
                ? "Coletando dados"
                : "Carregando";
        etaLabel.textContent = `Tempo previsto: ${remaining} segundo${remaining === 1 ? "" : "s"}`;
      }
    });
  }

  async function loadMinasGeoJson() {
    const host = root.querySelector("[data-mg-real-map]");
    if (!host) return;
    try {
      const response = await fetch(MG_GEOJSON_URL);
      if (!response.ok)
        throw new Error(`GeoJSON indisponível: ${response.status}`);
      const geojson = await response.json();
      host.innerHTML = `<div class="mg-map-scan"></div><div class="mg-map-pin a"><iconify-icon icon="mdi:finance"></iconify-icon></div><div class="mg-map-pin b"><iconify-icon icon="mdi:account-group"></iconify-icon></div>${buildGeoJsonSvg(geojson)}`;
    } catch (error) {
      console.warn("[Balanço Cidadão MG] Falha no GeoJSON:", error);
      host.innerHTML = `<div class="mg-map-scan"></div><svg viewBox="0 0 260 220" role="img" aria-label="Representação de Minas Gerais"><path class="mg-map-outline" d="M58 83 L83 58 L105 65 L121 47 L151 51 L171 39 L196 51 L215 73 L206 99 L230 119 L214 144 L185 150 L168 174 L138 164 L118 181 L91 164 L61 167 L46 143 L59 119 L41 101 Z"></path></svg>`;
    }
  }

  function buildGeoJsonSvg(geojson) {
    const rings = [];
    (Array.isArray(geojson.features) ? geojson.features : []).forEach(
      (feature) => {
        const geometry = feature.geometry;
        if (!geometry?.coordinates) return;
        if (geometry.type === "Polygon")
          geometry.coordinates.forEach(
            (ring) => ring.length && rings.push(ring),
          );
        if (geometry.type === "MultiPolygon")
          geometry.coordinates.forEach((polygon) =>
            polygon.forEach((ring) => ring.length && rings.push(ring)),
          );
      },
    );
    if (!rings.length) throw new Error("GeoJSON sem geometrias válidas");
    const points = rings.flat();
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const width = 240,
      height = 190,
      padding = 12;
    const rangeX = Math.max(maxX - minX, 0.0001),
      rangeY = Math.max(maxY - minY, 0.0001);
    const scale = Math.min(
      (width - padding * 2) / rangeX,
      (height - padding * 2) / rangeY,
    );
    const offsetX = (width - rangeX * scale) / 2,
      offsetY = (height - rangeY * scale) / 2;
    const project = ([lon, lat]) => [
      offsetX + (lon - minX) * scale,
      height - (offsetY + (lat - minY) * scale),
    ];
    const paths = rings
      .map(
        (ring) =>
          `<path class="mg-map-feature" d="${ring
            .map((point, i) => {
              const [x, y] = project(point);
              return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ")} Z"></path>`,
      )
      .join("");
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Mapa de Minas Gerais">${paths}<path class="mg-map-outline" d="${buildOuterApproxPath(rings, project)}"></path></svg>`;
  }

  function buildOuterApproxPath(rings, project) {
    const all = rings.flat().map(project);
    const center = all.reduce(
      (acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }),
      { x: 0, y: 0 },
    );
    center.x /= all.length;
    center.y /= all.length;
    const buckets = new Map(),
      bucketCount = 96;
    all.forEach(([x, y]) => {
      const raw = Math.atan2(y - center.y, x - center.x),
        angle = raw < 0 ? raw + Math.PI * 2 : raw;
      const bucket = Math.floor((angle / (Math.PI * 2)) * bucketCount),
        distance = Math.hypot(x - center.x, y - center.y),
        current = buckets.get(bucket);
      if (!current || distance > current.distance)
        buckets.set(bucket, { x, y, distance });
    });
    return (
      [...buckets.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(
          ([, p], i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
        )
        .join(" ") + " Z"
    );
  }

  function renderLoader(type) {
    if (type === "mapa")
      return `<div class="mg-real-map" data-mg-real-map><div class="mg-map-loading">Carregando mapa MG...</div></div>`;
    if (type === "trem-serras") {
      const bgClass = "train-bg-hills";
      return `<div class="mg-train-scene ${bgClass}"><div class="train-sky-glow"></div><div class="train-hills"></div><div class="train-track"><div class="train-sleepers"></div></div><div class="train-set"><div class="train-wagon"><iconify-icon icon="mdi:database-outline"></iconify-icon><div class="train-wheel w1"></div><div class="train-wheel w2"></div></div><div class="train-wagon"><iconify-icon icon="mdi:chart-box-outline"></iconify-icon><div class="train-wheel w1"></div><div class="train-wheel w2"></div></div><div class="train-engine"><div class="train-cabin"></div><div class="train-window"></div><div class="train-boiler"></div><div class="train-chimney"></div><div class="train-lamp"></div><div class="train-smoke s1"></div><div class="train-smoke s2"></div><div class="train-smoke s3"></div><div class="train-wheel w1"></div><div class="train-wheel w2"></div></div></div></div>`;
    }
    if (type === "queijo")
      return `<div class="mg-cheese-scene asset-cheese"><div class="cheese-halo"></div><div class="cheese-board"></div><svg class="cheese-wheel-svg" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="bc-cheese-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a0"/><stop offset=".56" stop-color="#f2c94c"/><stop offset="1" stop-color="#d7901c"/></linearGradient></defs><circle class="cheese-base-ring" cx="60" cy="60" r="51"/><g fill="url(#bc-cheese-gold)"><path class="cheese-wedge w1" d="M60 60 L60 9 A51 51 0 0 1 96.06 23.94 Z"/><path class="cheese-wedge w2" d="M60 60 L96.06 23.94 A51 51 0 0 1 111 60 Z"/><path class="cheese-wedge w3" d="M60 60 L111 60 A51 51 0 0 1 96.06 96.06 Z"/><path class="cheese-wedge w4" d="M60 60 L96.06 96.06 A51 51 0 0 1 60 111 Z"/><path class="cheese-wedge w5" d="M60 60 L60 111 A51 51 0 0 1 23.94 96.06 Z"/><path class="cheese-wedge w6" d="M60 60 L23.94 96.06 A51 51 0 0 1 9 60 Z"/><path class="cheese-wedge w7" d="M60 60 L9 60 A51 51 0 0 1 23.94 23.94 Z"/><path class="cheese-wedge w8" d="M60 60 L23.94 23.94 A51 51 0 0 1 60 9 Z"/></g><circle class="cheese-hole" cx="78" cy="31" r="4"/><circle class="cheese-hole" cx="91" cy="66" r="3.5"/><circle class="cheese-hole" cx="67" cy="91" r="4"/><circle class="cheese-hole" cx="34" cy="74" r="3.5"/><circle class="cheese-hole" cx="39" cy="39" r="3"/><circle class="cheese-rind" cx="60" cy="60" r="51"/></svg><div class="pao-static-wrap"><img class="pao-static" src="${assetUrl("pao-de-queijo.png")}" alt=""><span class="pao-shine"></span></div></div>`;
    if (type === "cafe")
      return `<div class="mg-coffee-scene"><div class="coffee-halo"></div><div class="kettle-wrap"><iconify-icon icon="mdi:kettle-outline"></iconify-icon></div><svg class="coffee-drops" viewBox="0 0 195 180" aria-hidden="true"><g fill="#744320"><ellipse cx="113" cy="73" rx="2.1" ry="4.2"><animate attributeName="cy" dur="1.05s" repeatCount="indefinite" values="73;105;128"/><animate attributeName="opacity" dur="1.05s" repeatCount="indefinite" values="0;1;0"/></ellipse><ellipse cx="117" cy="73" rx="1.8" ry="3.7"><animate attributeName="cy" dur="1.05s" begin=".34s" repeatCount="indefinite" values="73;105;128"/><animate attributeName="opacity" dur="1.05s" begin=".34s" repeatCount="indefinite" values="0;1;0"/></ellipse><ellipse cx="121" cy="73" rx="1.6" ry="3.3"><animate attributeName="cy" dur="1.05s" begin=".68s" repeatCount="indefinite" values="73;105;128"/><animate attributeName="opacity" dur="1.05s" begin=".68s" repeatCount="indefinite" values="0;1;0"/></ellipse></g></svg><div class="coffee-steam s1"></div><div class="coffee-steam s2"></div><div class="coffee-cup"><div class="cup-saucer"></div><div class="cup-handle"></div><div class="cup-shell"><svg class="coffee-svg" viewBox="0 0 69 48" preserveAspectRatio="none" aria-hidden="true"><path fill="#6b3b1d"><animate attributeName="d" dur="9.2s" repeatCount="indefinite" values="M3 43 Q18 40 34 43 T66 43 L66 48 L3 48 Z;M3 43 Q18 40 34 43 T66 43 L66 48 L3 48 Z;M3 38 Q18 34 34 38 T66 38 L66 48 L3 48 Z;M3 33 Q18 38 34 33 T66 33 L66 48 L3 48 Z;M3 27 Q18 22 34 27 T66 27 L66 48 L3 48 Z;M3 21 Q18 26 34 21 T66 21 L66 48 L3 48 Z;M3 15 Q18 10 34 15 T66 15 L66 48 L3 48 Z;M3 11 Q18 16 34 11 T66 11 L66 48 L3 48 Z;M3 12 Q18 8 34 12 T66 12 L66 48 L3 48 Z;M3 43 Q18 40 34 43 T66 43 L66 48 L3 48 Z" keyTimes="0;.28;.36;.44;.52;.6;.68;.74;.86;1" calcMode="spline" keySplines=".42 0 .58 1;.3 0 .25 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"/></path><ellipse cx="34.5" cy="12" rx="31" ry="4" fill="#8b572d" opacity="0"><animate attributeName="cy" dur="9.2s" repeatCount="indefinite" values="43;43;38;33;27;21;15;11;12;43" keyTimes="0;.28;.36;.44;.52;.6;.68;.74;.86;1"/><animate attributeName="ry" dur="2.1s" repeatCount="indefinite" values="3;4.5;3"/><animate attributeName="opacity" dur="9.2s" repeatCount="indefinite" values="0;0;.34;.48;.58;.66;.72;.76;.72;0" keyTimes="0;.28;.36;.44;.52;.6;.68;.74;.86;1"/></ellipse></svg></div></div></div>`;
    if (type === "rio-sao-francisco")
      return `<div class="mg-river-scene asset-river"><div class="river-sun-asset"></div><div class="river-bank-asset"></div><div class="river-wave-layer w1"></div><div class="river-wave-layer w2"></div><div class="carranca-fixed-wrap"><img class="carranca-fixed" src="${assetUrl("carranca.png")}" alt=""></div><div class="canoa-only-wrap"><img class="canoa-only" src="${assetUrl("canoa.png")}" alt=""></div><div class="river-ripple"></div><div class="river-wave-layer w3"></div></div>`;
    if (type === "pampulha")
      return `<div class="mg-pampulha-scene pampulha-v4"><div class="pampulha-sun"></div><div class="pampulha-cloud"></div><div class="pampulha-shore"></div><div class="pampulha-church"><svg class="pampulha-church-svg" viewBox="0 0 185 108" aria-hidden="true"><path class="pampulha-shell pampulha-draw" d="M4 99 C7 81 14 68 27 64 C31 48 40 39 52 42 C59 25 70 17 81 23 C90 7 103 2 114 10 C127 20 130 46 133 65 C143 66 150 77 153 99 Z"/><path class="pampulha-glass pampulha-fill" d="M82 95 C84 46 96 16 113 11 C126 23 130 56 131 95 Z"/><g class="pampulha-glass-grid pampulha-fill"><path d="M89 93 L91 50 M98 94 L101 27 M107 95 L112 13 M117 95 L120 21 M126 94 L127 54"/><path d="M84 70 L130 70 M87 48 L127 48 M95 28 L121 28"/></g><path class="pampulha-door pampulha-fill" d="M91 95 L92 79 Q105 70 121 79 L123 95 Z"/><path class="pampulha-canopy pampulha-fill" d="M50 80 Q71 74 92 79"/><path class="pampulha-tower pampulha-draw" d="M151 99 L157 13 L180 8 L176 99 Z"/><g class="pampulha-tower-grid pampulha-fill"><path d="M159 19 L176 91 M158 37 L174 99 M162 12 L178 73"/><path d="M177 20 L158 88 M176 40 L157 99 M174 11 L160 72"/></g><path class="pampulha-cross pampulha-fill" d="M149 26 L149 7 M143 15 L155 15"/></svg></div><div class="pampulha-water"></div><div class="pampulha-reflection"></div><div class="pampulha-ripple"></div></div>`;
    return `<div class="mg-historic-scene"><div class="historic-moonlight"></div><div class="gold-spark a"></div><div class="gold-spark b"></div><div class="gold-spark c"></div><div class="historic-arch"></div><div class="historic-lamp"><iconify-icon icon="mdi:coach-lamp"></iconify-icon></div><div class="historic-bell"><iconify-icon icon="mdi:bell-ring-outline"></iconify-icon></div><div class="stone-road"></div></div>`;
  }

  function hexToRgba(hex, alpha) {
    const value = parseInt(hex.replace("#", ""), 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
})();
