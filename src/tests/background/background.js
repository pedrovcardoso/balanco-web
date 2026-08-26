(() => {
  "use strict";

  const CONFIG = {
    panoramaId: "panorama",
    styleId: "bc-background-style",
    readyClass: "bg-ready",
    canvasIds: {
      landscape: "landscapeCanvas",
      clouds: "cloudsCanvas",
      birds: "birdsCanvas",
    },
  };

  if (window.BC_BACKGROUND?.installed) return;
  window.BC_BACKGROUND = { installed: true };

  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const fract = (v) => v - Math.floor(v);
  const hash = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

  let bgReadyQueued = false;
  let resizeRaf = 0;
  let started = false;

  function onBodyReady(callback) {
    if (document.body) {
      callback();
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.body) return;
      observer.disconnect();
      callback();
    });

    observer.observe(document.documentElement, { childList: true });

    document.addEventListener(
      "DOMContentLoaded",
      () => {
        if (document.body) {
          observer.disconnect();
          callback();
        }
      },
      { once: true },
    );
  }

  function installCSS() {
    if (document.getElementById(CONFIG.styleId)) return;

    const style = document.createElement("style");
    style.id = CONFIG.styleId;
    style.textContent = `
      html {
        background: #86cbed;
      }

      body {
        margin: 0;
        background: #86cbed;
      }

      #${CONFIG.panoramaId},
      .panorama-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        background: #86cbed;
        opacity: 0 !important;
        transition: opacity 0.18s ease !important;
        transform: translateZ(0);
        backface-visibility: hidden;
        pointer-events: none;
      }

      html.${CONFIG.readyClass} #${CONFIG.panoramaId},
      body.${CONFIG.readyClass} #${CONFIG.panoramaId},
      html.${CONFIG.readyClass} .panorama-bg,
      body.${CONFIG.readyClass} .panorama-bg {
        opacity: 1 !important;
      }

      #${CONFIG.canvasIds.landscape},
      #${CONFIG.canvasIds.clouds},
      #${CONFIG.canvasIds.birds} {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      #${CONFIG.panoramaId} .sun-glow {
        position: absolute;
        right: 8vw;
        top: 8vh;
        width: min(44vw, 620px);
        height: min(44vw, 620px);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,249,206,.76), rgba(245,168,0,.25) 34%, rgba(245,168,0,.06) 62%, transparent 77%);
        mix-blend-mode: screen;
      }

      #${CONFIG.panoramaId} .gold-haze {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,231,170,.18) 43%, rgba(245,168,0,.1) 60%, rgba(44,107,56,.08));
      }

      #${CONFIG.panoramaId} .soft-vignette {
        position: absolute;
        inset: 0;
        box-shadow: inset 0 0 8vw rgba(21,45,62,.16), inset 0 -18vh 18vh rgba(18,54,28,.15);
      }

      #${CONFIG.panoramaId} .grain {
        position: absolute;
        inset: 0;
        opacity: .04;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E");
        transform: translate3d(0, 0, 0);
      }

      @media (max-width: 767px) {
        #${CONFIG.panoramaId} .sun-glow,
        #${CONFIG.panoramaId} .gold-haze,
        #${CONFIG.panoramaId} .grain {
          display: none !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${CONFIG.panoramaId},
        #${CONFIG.panoramaId} * {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function createBackgroundDOM() {
    let panorama = document.getElementById(CONFIG.panoramaId);

    if (!panorama) {
      panorama = document.createElement("div");
      panorama.id = CONFIG.panoramaId;
      panorama.className = "panorama-bg";
      panorama.setAttribute("aria-hidden", "true");
      panorama.innerHTML = `
        <canvas id="${CONFIG.canvasIds.landscape}"></canvas>
        <canvas id="${CONFIG.canvasIds.clouds}"></canvas>
        <canvas id="${CONFIG.canvasIds.birds}"></canvas>
        <div class="sun-glow"></div>
        <div class="gold-haze"></div>
        <div class="soft-vignette"></div>
        <div class="grain"></div>
      `;
      document.body.prepend(panorama);
      return panorama;
    }

    panorama.classList.add("panorama-bg");
    panorama.setAttribute("aria-hidden", "true");

    const ensureCanvas = (id) => {
      let canvas = document.getElementById(id);
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = id;
        panorama.prepend(canvas);
      }
      return canvas;
    };

    ensureCanvas(CONFIG.canvasIds.landscape);
    ensureCanvas(CONFIG.canvasIds.clouds);
    ensureCanvas(CONFIG.canvasIds.birds);

    ["sun-glow", "gold-haze", "soft-vignette", "grain"].forEach((className) => {
      if (!panorama.querySelector(`.${className}`)) {
        const layer = document.createElement("div");
        layer.className = className;
        panorama.appendChild(layer);
      }
    });

    return panorama;
  }

  function markBackgroundReady() {
    document.documentElement.classList.add(CONFIG.readyClass);
    if (document.body) document.body.classList.add(CONFIG.readyClass);
  }

  function queueBackgroundReady() {
    if (bgReadyQueued) return;
    bgReadyQueued = true;
    requestAnimationFrame(() => requestAnimationFrame(markBackgroundReady));
  }

  function noise(x) {
    const i = Math.floor(x);
    const f = x - i;
    return lerp(hash(i), hash(i + 1), smooth(f)) * 2 - 1;
  }

  function fbm(x, o = 5) {
    let v = 0;
    let a = 0.55;
    let n = 0;

    for (let i = 0; i < o; i += 1) {
      v += noise(x) * a;
      n += a;
      x *= 2.03;
      a *= 0.52;
    }

    return v / n;
  }

  function startBackground() {
    if (started) return;
    started = true;

    installCSS();
    createBackgroundDOM();

    const canvas = document.getElementById(CONFIG.canvasIds.landscape);
    const cloudsCanvas = document.getElementById(CONFIG.canvasIds.clouds);
    const birdsCanvas = document.getElementById(CONFIG.canvasIds.birds);

    if (!canvas || !cloudsCanvas || !birdsCanvas) {
      queueBackgroundReady();
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const cx = cloudsCanvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    const bx = birdsCanvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    const skyCanvas = document.createElement("canvas");
    const sctx = skyCanvas.getContext("2d", { alpha: false });

    const scene = {
      w: innerWidth,
      h: innerHeight,
      dpr: Math.min(devicePixelRatio || 1, innerWidth <= 767 ? 1 : 1.15),
      t: 0,
      last: performance.now(),
      camera: 0,
      birds: [],
      staticRendered: false,
      lastDraw: 0,
      targetFrameMs: 1000 / 24,
      skyCached: false,
    };

    const layers = [
      {
        base: 0.5,
        amp: 42,
        scale: 0.00125,
        par: 0.055,
        step: 18,
        top: "#9CC7B2",
        mid: "#79AC82",
        bot: "#5D8D69",
        alpha: 0.72,
        mist: 0.3,
        line: 0.025,
      },
      {
        base: 0.59,
        amp: 58,
        scale: 0.00175,
        par: 0.095,
        step: 16,
        top: "#7DB66D",
        mid: "#5F984D",
        bot: "#457641",
        alpha: 0.86,
        mist: 0.2,
        line: 0.04,
      },
      {
        base: 0.7,
        amp: 78,
        scale: 0.00235,
        par: 0.16,
        step: 14,
        top: "#65A34F",
        mid: "#4B833B",
        bot: "#2F5F33",
        alpha: 0.95,
        mist: 0.11,
        line: 0.055,
      },
      {
        base: 0.82,
        amp: 98,
        scale: 0.00305,
        par: 0.27,
        step: 12,
        top: "#5F963F",
        mid: "#3F742D",
        bot: "#1E481F",
        alpha: 1,
        mist: 0.04,
        line: 0.07,
      },
    ];

    const clouds = Array.from({ length: 14 }, (_, i) => ({
      x: hash(i + 20) * 1900,
      y: 0.07 + hash(i + 44) * 0.26,
      s: 0.72 + hash(i + 81) * 1.08,
      v: 0.012 + hash(i + 103) * 0.026,
      a: 0.22 + hash(i + 149) * 0.2,
      p: hash(i + 190) * TAU,
    }));

    let cachedMountainGrads = null;

    function resize() {
      scene.w = innerWidth;
      scene.h = innerHeight;
      scene.dpr = Math.min(devicePixelRatio || 1, innerWidth <= 767 ? 1 : 1.15);

      [canvas, cloudsCanvas, birdsCanvas].forEach((c) => {
        c.width = Math.floor(scene.w * scene.dpr);
        c.height = Math.floor(scene.h * scene.dpr);
        c.style.width = `${scene.w}px`;
        c.style.height = `${scene.h}px`;
      });

      ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      cx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      bx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);

      skyCanvas.width = Math.floor(scene.w * scene.dpr);
      skyCanvas.height = Math.floor(scene.h * scene.dpr);
      sctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);

      cachedMountainGrads = null;
      scene.skyCached = false;
      scene.staticRendered = false;
    }

    function sky() {
      const { w, h } = scene;

      if (scene.skyCached) {
        ctx.drawImage(skyCanvas, 0, 0, w, h);
        return;
      }

      const mobileCleanSky = innerWidth <= 767;
      const g = sctx.createLinearGradient(0, 0, 0, h);

      if (mobileCleanSky) {
        g.addColorStop(0, "#78C8F2");
        g.addColorStop(0.52, "#B7E1F5");
        g.addColorStop(1, "#86CBED");
        sctx.fillStyle = g;
        sctx.fillRect(0, 0, w, h);
      } else {
        g.addColorStop(0, "#78C8F2");
        g.addColorStop(0.33, "#B7E1F5");
        g.addColorStop(0.57, "#F6DEA5");
        g.addColorStop(0.74, "#E7B764");
        g.addColorStop(1, "#6FA66A");
        sctx.fillStyle = g;
        sctx.fillRect(0, 0, w, h);

        const sx = w * 0.74;
        const sy = h * 0.23;
        const rg = sctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.72);
        rg.addColorStop(0, "rgba(255,250,211,.66)");
        rg.addColorStop(0.2, "rgba(255,216,120,.24)");
        rg.addColorStop(0.56, "rgba(245,168,0,.07)");
        rg.addColorStop(1, "rgba(245,168,0,0)");
        sctx.fillStyle = rg;
        sctx.fillRect(0, 0, w, h);
      }

      scene.skyCached = true;
      ctx.drawImage(skyCanvas, 0, 0, w, h);
    }

    function drawCloud(o, x, y, s) {
      cx.save();
      cx.translate(x, y);
      cx.scale(s, s);
      cx.globalAlpha = o.a;
      cx.globalCompositeOperation = "screen";

      const g = cx.createLinearGradient(0, -38, 0, 42);
      g.addColorStop(0, "rgba(255,255,255,.95)");
      g.addColorStop(0.4, "rgba(255,248,230,.75)");
      g.addColorStop(0.75, "rgba(255,230,175,.3)");
      g.addColorStop(1, "rgba(255,224,162,0)");
      cx.fillStyle = g;

      for (let k = 0; k < 5; k += 1) {
        cx.beginPath();
        cx.ellipse(
          (k - 2) * 42,
          Math.sin(k + o.p) * 7,
          42 + hash(k + o.s) * 28,
          12 + hash(k + 33) * 10,
          0,
          0,
          TAU,
        );
        cx.fill();
      }

      cx.restore();
    }

    function cloudsLayer() {
      const { w, h, camera, t } = scene;
      cx.clearRect(0, 0, w, h);

      for (const o of clouds) {
        const range = w + 540;
        const x = ((((o.x - camera * o.v) % range) + range) % range) - 270;
        const y = h * o.y + Math.sin(t * 0.16 + o.p) * 2.4;
        drawCloud(o, x, y, o.s);
      }
    }

    function mountainY(x, layer, index) {
      const n = fbm(x * layer.scale + index * 37.7, 3);
      const r = 1 - Math.abs(fbm(x * layer.scale * 0.62 + index * 19, 3));
      return scene.h * layer.base - n * layer.amp - r * layer.amp * 0.45;
    }

    function getMountainGrads(h) {
      if (cachedMountainGrads?.height === h) return cachedMountainGrads.grads;

      const grads = layers.map((layer) => {
        const fill = ctx.createLinearGradient(0, h * 0.35, 0, h);
        fill.addColorStop(0, layer.top);
        fill.addColorStop(0.55, layer.mid);
        fill.addColorStop(1, layer.bot);

        let mistGrad = null;
        if (layer.mist) {
          mistGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.9);
          mistGrad.addColorStop(0, `rgba(245,255,248,${layer.mist})`);
          mistGrad.addColorStop(1, "rgba(245,255,248,0)");
        }

        return { fill, mistGrad };
      });

      cachedMountainGrads = { height: h, grads };
      return grads;
    }

    function mountains() {
      const { w, h, camera, t } = scene;
      const grads = getMountainGrads(h);

      layers.forEach((layer, index) => {
        const off = camera * layer.par;
        const pts = [];

        ctx.save();
        ctx.globalAlpha = layer.alpha;
        ctx.beginPath();
        ctx.moveTo(0, h + 40);

        for (let sx = -layer.step; sx <= w + layer.step; sx += layer.step) {
          const y =
            mountainY(sx + off, layer, index) +
            Math.sin(t * 0.05 + sx * 0.003 + index) * 0.7;
          pts.push([sx, y]);
          ctx.lineTo(sx, y);
        }

        ctx.lineTo(w, h + 40);
        ctx.closePath();

        const g = grads[index];
        ctx.fillStyle = g.fill;
        ctx.fill();

        if (g.mistGrad) {
          ctx.fillStyle = g.mistGrad;
          ctx.fill();
        }

        ctx.globalCompositeOperation = "screen";
        ctx.beginPath();

        for (let p = 0; p < pts.length - 1; p += 1) {
          const a = pts[p];
          const b = pts[p + 1];
          if (b[1] < a[1] + 5) {
            ctx.moveTo(a[0], a[1] + 1);
            ctx.lineTo(b[0], b[1] + 1);
          }
        }

        ctx.strokeStyle = `rgba(255,219,132,${layer.line})`;
        ctx.lineWidth = 0.55 + index * 0.12;
        ctx.stroke();
        ctx.restore();
      });
    }

    function foreground() {
      const { w, h, camera } = scene;
      const base = h * 0.88;
      const grd = ctx.createLinearGradient(0, h * 0.76, 0, h);
      grd.addColorStop(0, "rgba(54,112,43,.52)");
      grd.addColorStop(1, "rgba(25,69,28,.88)");

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let x = 0; x <= w; x += 18) {
        ctx.lineTo(x, base + fbm((x + camera * 0.24) * 0.012, 3) * 16);
      }

      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    function makeBird(x, y) {
      return {
        x,
        y,
        s: 0.5 + Math.random() * 0.48,
        v: 20 + Math.random() * 20,
        p: Math.random() * TAU,
        a: 0.3 + Math.random() * 0.2,
      };
    }

    function spawnBirds() {
      const n = 2 + Math.floor(Math.random() * 3);
      const y = scene.h * (0.12 + Math.random() * 0.22);
      const x = scene.w + 60;

      for (let i = 0; i < n; i += 1) {
        scene.birds.push(makeBird(x + i * 28, y + (Math.random() - 0.5) * 26));
      }
    }

    function seedInitialBirds() {
      scene.birds.length = 0;

      for (let f = 0; f < 3; f += 1) {
        const baseX = scene.w * (0.18 + f * 0.27) + Math.random() * 40;
        const baseY = scene.h * (0.12 + Math.random() * 0.2);
        const count = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i += 1) {
          scene.birds.push(
            makeBird(baseX + i * 24, baseY + (Math.random() - 0.5) * 24),
          );
        }
      }
    }

    function birds(dt) {
      const { w, h } = scene;
      bx.clearRect(0, 0, w, h);

      if (Math.random() < dt * 0.075 && scene.birds.length < 14) spawnBirds();

      for (let i = scene.birds.length - 1; i >= 0; i -= 1) {
        if (scene.birds[i].x <= -80) scene.birds.splice(i, 1);
      }

      for (const bird of scene.birds) {
        bird.x -= bird.v * dt;
        bird.y += Math.sin(scene.t * 0.75 + bird.p) * 0.06;
        bird.p += dt * 3.1;

        const flap = Math.sin(bird.p) * 2.5 * bird.s;
        const sz = 8 * bird.s;

        bx.save();
        bx.translate(bird.x, bird.y);
        bx.globalAlpha = bird.a;
        bx.strokeStyle = "#24342b";
        bx.lineWidth = 1.2;
        bx.lineCap = "round";
        bx.beginPath();
        bx.moveTo(0, 0);
        bx.quadraticCurveTo(sz, -sz * 0.62 - flap, sz * 1.9, -1);
        bx.moveTo(0, 0);
        bx.quadraticCurveTo(-sz, -sz * 0.62 + flap, -sz * 1.9, -1);
        bx.stroke();
        bx.restore();
      }
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) return;

      const reduceMotion =
        document.documentElement.classList.contains("a11y-reduced-motion") ||
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobileNoAnimation = innerWidth <= 767;

      if (reduceMotion || mobileNoAnimation) {
        if (!scene.staticRendered) {
          sky();
          cloudsLayer();
          mountains();
          foreground();
          bx.clearRect(0, 0, scene.w, scene.h);
          scene.staticRendered = true;
          queueBackgroundReady();
        }

        scene.last = now;
        return;
      }

      scene.staticRendered = false;

      if (now - scene.lastDraw < scene.targetFrameMs) return;
      scene.lastDraw = now;

      const dt = Math.min(0.04, (now - scene.last) / 1000 || 0.016);
      scene.last = now;
      scene.t += dt;
      scene.camera += dt * 58;

      sky();
      cloudsLayer();
      mountains();
      foreground();
      birds(dt);
      queueBackgroundReady();
    }

    function initFadeInUp() {
      const elements = document.querySelectorAll(".fade-in-up, .fade-rise");
      if (!elements.length) return;

      const reveal = (el) => el.classList.add("is-visible");

      if (!("IntersectionObserver" in window)) {
        elements.forEach(reveal);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px" },
      );

      elements.forEach((el) => observer.observe(el));
    }

    addEventListener(
      "resize",
      () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = 0;
          resize();
          seedInitialBirds();
        });
      },
      { passive: true },
    );

    addEventListener("pageshow", queueBackgroundReady, { passive: true });

    resize();
    seedInitialBirds();
    initFadeInUp();
    requestAnimationFrame(frame);
  }

  installCSS();
  onBodyReady(startBackground);
})();
