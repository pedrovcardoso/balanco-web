(() => {
  "use strict";

  const A11Y_ID = "bc-a11y-root";
  const A11Y_STYLE_ID = "bc-a11y-style";
  const VLibrAS_SCRIPT_ID = "bc-a11y-vlibras-script";
  const STORAGE_KEY = "bc_a11y_preferences";
  const BACK_TO_TOP_ID = "bc-back-to-top";
  const INLINE_TAG = "data-bc-a11y-priority-inline";
  const PRIORITY_EXCLUDE_SELECTOR = `#${A11Y_ID}, #${A11Y_ID} *, [vw], [vw] *`;

  if (window.__BCA11Y_LOADED__) return;
  window.__BCA11Y_LOADED__ = true;

  const defaults = {
    fontScale: 1,
    highContrast: false,
    readableFont: false,
    openDyslexic: false,
    largeSpacing: false,
    underlineLinks: false,
    reducedMotion: false,
    theme: "default",
  };

  let state = { ...defaults };
  let liveRegion = null;
  let priorityObserver = null;
  let priorityObserverRaf = 0;
  const root = document.documentElement;

  const css = `
@font-face {
  font-family: "OpenDyslexic";
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src:
    url("https://cdn.jsdelivr.net/fontsource/fonts/opendyslexic@latest/latin-400-normal.woff2") format("woff2"),
    url("https://cdn.jsdelivr.net/fontsource/fonts/opendyslexic@latest/latin-400-normal.woff") format("woff");
}
@font-face {
  font-family: "OpenDyslexic";
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src:
    url("https://cdn.jsdelivr.net/fontsource/fonts/opendyslexic@latest/latin-700-normal.woff2") format("woff2"),
    url("https://cdn.jsdelivr.net/fontsource/fonts/opendyslexic@latest/latin-700-normal.woff") format("woff");
}
:root {
  --a11y-font-scale: 1;
  --a11y-topbar-height: 52px;
}
html {
  font-size: calc(16px * var(--a11y-font-scale));
}
body {
  padding-top: var(--a11y-topbar-height) !important;
}
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
#bc-a11y-root,
#bc-a11y-root *,
#bc-a11y-root *::before,
#bc-a11y-root *::after {
  box-sizing: border-box !important;
  font-family: Arial, Verdana, Tahoma, sans-serif;
}
.skip-link {
  position: fixed;
  left: 1rem;
  top: 0.45rem;
  z-index: 100000;
  transform: translateY(-180%);
  background: #111827;
  color: #fff;
  padding: 0.6rem 0.85rem;
  border-radius: 0.65rem;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.24);
}
.skip-link:focus {
  transform: translateY(0);
  outline: 4px solid #f5a800;
  outline-offset: 3px;
}
.accessibility-topbar {
  position: fixed;
  inset: 0 0 auto 0;
  min-height: var(--a11y-topbar-height);
  z-index: 99990;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  border-bottom: 3px solid #c0272d;
  box-shadow: 0 4px 14px rgba(17, 24, 39, 0.12);
  backdrop-filter: blur(12px);
  overflow: visible !important;
}
.accessibility-topbar-inner {
  width: min(1240px, 100%);
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.22rem 0.68rem;
  position: relative !important;
  min-height: var(--a11y-topbar-height) !important;
}
.accessibility-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.accessibility-brand img {
  display: block;
  width: auto;
  height: 28px;
  max-width: 126px;
  object-fit: contain;
}
.accessibility-brand .accessibility-logo-sccg {
  height: 18px;
  max-width: 82px;
}
.accessibility-brand-separator {
  width: 2px;
  height: 27px;
  background: rgba(192, 39, 45, 0.22);
  flex: 0 0 auto;
}
.accessibility-toolbar,
.a11y-more-grid {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.a11y-btn,
.a11y-select {
  min-height: 1.82rem;
  border: 2px solid rgba(31, 41, 55, 0.22);
  border-radius: 0.48rem;
  background: #fff;
  color: #111827;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
  transition: background-color .16s ease, color .16s ease, border-color .16s ease, box-shadow .16s ease;
}
.a11y-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  padding: 0.3rem 0.46rem;
  cursor: pointer;
}
.a11y-btn:hover,
.a11y-select:hover,
.a11y-btn[aria-pressed="true"] {
  border-color: #c0272d;
  background: #fff7ed;
  color: #8f1e23;
}
.a11y-select {
  padding: 0.3rem 0.46rem;
  max-width: 13rem;
}
.a11y-more-panel {
  display: none;
  position: fixed !important;
  top: calc(var(--a11y-topbar-height) + 0.35rem) !important;
  left: max(0.5rem, env(safe-area-inset-left)) !important;
  right: max(0.5rem, env(safe-area-inset-right)) !important;
  width: auto !important;
  padding: 0.42rem !important;
  margin: 0 !important;
  z-index: 100002 !important;
  border: 1px solid rgba(31, 41, 55, 0.14) !important;
  border-radius: 0.8rem !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.16) !important;
  backdrop-filter: blur(12px) !important;
  max-height: calc(100vh - var(--a11y-topbar-height) - 0.85rem) !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}
.a11y-more-panel.is-open {
  display: block !important;
}
.a11y-more-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  align-items: stretch !important;
  gap: 0.28rem !important;
}
.a11y-help-text {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  margin: 0 0 0.12rem !important;
  text-align: center !important;
  font-size: 0.64rem !important;
  line-height: 1.25 !important;
  font-weight: 800;
  color: #374151;
}
.a11y-more-grid > .a11y-btn,
.a11y-theme-trigger {
  width: 100% !important;
}
.a11y-theme-picker {
  position: relative !important;
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
}
.a11y-theme-trigger {
  min-height: 1.62rem !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 0.42rem !important;
  padding: 0.24rem 0.5rem !important;
  border: 2px solid rgba(31, 41, 55, 0.22) !important;
  border-radius: 0.52rem !important;
  background: #fff !important;
  color: #111827 !important;
  font: inherit !important;
  font-size: 0.62rem !important;
  font-weight: 900 !important;
  line-height: 1 !important;
  cursor: pointer !important;
  transition: background-color .16s ease, color .16s ease, border-color .16s ease, box-shadow .16s ease;
}
.a11y-theme-trigger:hover {
  border-color: #c0272d !important;
}
.a11y-theme-dot {
  width: 0.58rem !important;
  height: 0.58rem !important;
  border-radius: 999px !important;
  background: linear-gradient(135deg, #c0272d, #f5a800) !important;
  flex: 0 0 auto !important;
}
.a11y-theme-current {
  flex: 1 !important;
  min-width: 0 !important;
  text-align: left !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.a11y-theme-arrow {
  color: #8f1e23 !important;
  font-size: 0.8rem !important;
  line-height: 1 !important;
  flex: 0 0 auto !important;
}
.a11y-theme-options {
  display: none !important;
  position: static !important;
  width: 100% !important;
  margin-top: 0.28rem !important;
  padding: 0.28rem !important;
  border: 1px solid rgba(143, 30, 35, 0.22) !important;
  border-radius: 0.65rem !important;
  background: #fffaf0 !important;
  box-shadow: inset 0 0 0 1px rgba(245, 168, 0, 0.1) !important;
}
.a11y-theme-picker.is-open .a11y-theme-options {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 0.18rem !important;
}
.a11y-theme-picker.is-open .a11y-theme-arrow {
  transform: rotate(180deg) !important;
}
.a11y-theme-options button {
  width: 100% !important;
  min-height: 1.8rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 0.45rem !important;
  padding: 0.38rem 0.5rem !important;
  border: 0 !important;
  border-radius: 0.48rem !important;
  background: transparent !important;
  color: #5d2b0a !important;
  font: inherit !important;
  font-size: 0.64rem !important;
  font-weight: 900 !important;
  text-align: left !important;
  cursor: pointer !important;
}
.a11y-theme-options button:hover,
.a11y-theme-options button:focus-visible {
  background: rgba(143, 30, 35, 0.1) !important;
  color: #8f1e23 !important;
  outline: 0 !important;
  box-shadow: none !important;
}
.a11y-theme-options button[aria-selected="true"] {
  background: linear-gradient(135deg, rgba(143, 30, 35, 0.14), rgba(245, 168, 0, 0.18)) !important;
  color: #8f1e23 !important;
}
.a11y-theme-options button[aria-selected="true"]::after {
  content: "✓";
  font-weight: 900;
  color: #8f1e23;
}
a:focus-visible,
button:focus-visible,
select:focus-visible,
[tabindex]:focus-visible {
  outline: 4px solid #f5a800 !important;
  outline-offset: 4px !important;
  box-shadow: 0 0 0 7px rgba(17, 24, 39, 0.32) !important;
}
html.a11y-underline-links a {
  text-decoration: underline !important;
  text-underline-offset: 0.22em !important;
  text-decoration-thickness: 0.12em !important;
}
html.a11y-readable-font body,
html.a11y-readable-font button,
html.a11y-readable-font select,
html.a11y-readable-font input,
html.a11y-readable-font textarea,
html.a11y-readable-font .font-display,
html.a11y-readable-font .font-body {
  font-family: Arial, Verdana, Tahoma, sans-serif !important;
}
html.a11y-open-dyslexic body,
html.a11y-open-dyslexic button,
html.a11y-open-dyslexic select,
html.a11y-open-dyslexic input,
html.a11y-open-dyslexic textarea,
html.a11y-open-dyslexic .font-display,
html.a11y-open-dyslexic .font-body,
html.a11y-open-dyslexic h1,
html.a11y-open-dyslexic h2,
html.a11y-open-dyslexic h3,
html.a11y-open-dyslexic p,
html.a11y-open-dyslexic span,
html.a11y-open-dyslexic a {
  font-family: "OpenDyslexic", Arial, Verdana, Tahoma, sans-serif !important;
}
html.a11y-large-spacing body {
  letter-spacing: 0.06em;
  word-spacing: 0.12em;
  line-height: 1.75;
}
html.a11y-reduced-motion *,
html.a11y-reduced-motion *::before,
html.a11y-reduced-motion *::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}
html.a11y-reduced-motion body::before,
html.a11y-reduced-motion .sun-glow,
html.a11y-reduced-motion .gold-haze,
html.a11y-reduced-motion .soft-vignette,
html.a11y-reduced-motion .grain {
  display: none !important;
}
html.a11y-reduced-motion main,
html.a11y-reduced-motion footer,
html.a11y-reduced-motion .fade-in-up,
html.a11y-reduced-motion .fade-rise,
html.a11y-reduced-motion .trail-stop {
  opacity: 1 !important;
  transform: none !important;
}
html.a11y-high-contrast body {
  background: #000 !important;
  color: #fff !important;
}
html.a11y-high-contrast #panorama {
  filter: grayscale(1) contrast(1.45) brightness(0.55);
}
html.a11y-high-contrast .accessibility-topbar {
  background: #000 !important;
  color: #fff !important;
  border-bottom-color: #ffff00 !important;
}
html.a11y-high-contrast .a11y-help-text {
  color: #fff !important;
}
html.a11y-high-contrast .placa-colonial,
html.a11y-high-contrast .mission-box,
html.a11y-high-contrast .map-parchment,
html.a11y-high-contrast .trail-card,
html.a11y-high-contrast .footer-bar {
  background: #000 !important;
  color: #fff !important;
  border-color: #ffff00 !important;
  box-shadow: none !important;
}
html.a11y-high-contrast .placa-colonial *,
html.a11y-high-contrast .mission-box *,
html.a11y-high-contrast .map-parchment *,
html.a11y-high-contrast .footer-bar * {
  color: #fff !important;
}
html.a11y-high-contrast .a11y-btn,
html.a11y-high-contrast .a11y-select,
html.a11y-high-contrast .a11y-theme-trigger,
html.a11y-high-contrast .a11y-theme-options button {
  background: #000 !important;
  color: #fff !important;
  border-color: #ffff00 !important;
}
html.a11y-high-contrast .a11y-more-panel,
html.a11y-high-contrast .a11y-theme-options {
  background: #000 !important;
  border-color: #ffff00 !important;
}
html.a11y-high-contrast a {
  color: #ffff00 !important;
}
html.a11y-theme-deuteranopia {
  filter: url("#a11y-deuteranopia-filter");
}
html.a11y-theme-protanopia {
  filter: url("#a11y-protanopia-filter");
}
html.a11y-theme-tritanopia {
  filter: url("#a11y-tritanopia-filter");
}
html.a11y-theme-achromatopsia {
  filter: grayscale(1) contrast(1.22);
}
html.a11y-theme-achromatopsia body {
  background: #f5f5f5 !important;
  color: #111 !important;
}
html.a11y-theme-achromatopsia #panorama {
  filter: grayscale(1) contrast(1.1) brightness(0.9);
}
html.a11y-theme-achromatopsia .trophy-end,
html.a11y-theme-achromatopsia .achievements-link,
html.a11y-theme-achromatopsia .trophy-end * {
  background: #ffffff !important;
  color: #000000 !important;
  border-color: #000000 !important;
  text-shadow: none !important;
}
html.a11y-theme-achromatopsia .trophy-end {
  box-shadow: 0 0 0 4px #000 !important;
}

/* Camada de prioridade máxima */
html.a11y-open-dyslexic,
html.a11y-open-dyslexic *,
html.a11y-open-dyslexic *::before,
html.a11y-open-dyslexic *::after {
  font-family: "OpenDyslexic", Arial, Verdana, Tahoma, sans-serif !important;
}
html.a11y-readable-font,
html.a11y-readable-font *,
html.a11y-readable-font *::before,
html.a11y-readable-font *::after {
  font-family: Arial, Verdana, Tahoma, sans-serif !important;
}
html.a11y-high-contrast,
html.a11y-high-contrast body {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #fff !important;
}
html.a11y-high-contrast body *:not(#bc-a11y-root):not(#bc-a11y-root *):not([vw]):not([vw] *) {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #fff !important;
  border-color: #ffff00 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  outline-color: #ffff00 !important;
  fill: currentColor !important;
  stroke: currentColor !important;
}
html.a11y-high-contrast body a:not(#bc-a11y-root a),
html.a11y-high-contrast body a:not(#bc-a11y-root a) * {
  color: #ffff00 !important;
  text-decoration-color: #ffff00 !important;
}
html.a11y-high-contrast body button:not(#bc-a11y-root button),
html.a11y-high-contrast body input,
html.a11y-high-contrast body select,
html.a11y-high-contrast body textarea,
html.a11y-high-contrast body [role="button"]:not(#bc-a11y-root [role="button"]) {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #fff !important;
  border-color: #ffff00 !important;
}
html.a11y-high-contrast body img:not(#bc-a11y-root img),
html.a11y-high-contrast body video,
html.a11y-high-contrast body canvas,
html.a11y-high-contrast body svg:not(#bc-a11y-root svg) {
  filter: grayscale(1) contrast(1.35) brightness(0.82) !important;
}
html.a11y-high-contrast #bc-a11y-root .accessibility-topbar,
html.a11y-high-contrast #bc-a11y-root .a11y-more-panel,
html.a11y-high-contrast #bc-a11y-root .a11y-theme-options,
html.a11y-high-contrast #bc-a11y-root .a11y-btn,
html.a11y-high-contrast #bc-a11y-root .a11y-select,
html.a11y-high-contrast #bc-a11y-root .a11y-theme-trigger,
html.a11y-high-contrast #bc-a11y-root .a11y-theme-options button {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #fff !important;
  border-color: #ffff00 !important;
  box-shadow: none !important;
}
html.a11y-large-spacing *,
html.a11y-large-spacing *::before,
html.a11y-large-spacing *::after {
  letter-spacing: 0.06em !important;
  word-spacing: 0.12em !important;
  line-height: 1.75 !important;
}
@media (max-width: 900px) {
  :root { --a11y-topbar-height: 72px; }
  .accessibility-topbar-inner {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.18rem;
    padding: 0.22rem 0.42rem;
  }
  .accessibility-brand img { height: 20px; max-width: 94px; }
  .accessibility-brand .accessibility-logo-sccg { height: 14px; max-width: 66px; }
  .accessibility-brand-separator { height: 20px; }
  .accessibility-toolbar,
  .a11y-more-grid { justify-content: center; gap: 0.22rem; }
  .a11y-btn,
  .a11y-select {
    min-height: 1.52rem;
    font-size: 0.62rem;
    border-width: 1.5px;
    border-radius: 0.4rem;
  }
  .a11y-btn { padding: 0.2rem 0.32rem; }
  .a11y-help-text {
    width: 100%;
    margin: 0;
    text-align: center;
    font-size: 0.64rem;
  }
}
@media (max-width: 520px) {
  :root { --a11y-topbar-height: 82px; }
  .accessibility-brand { gap: 0.3rem; justify-content: center; }
  .accessibility-brand img { height: 18px; max-width: 88px; }
  .accessibility-brand .accessibility-logo-sccg { height: 13px; max-width: 60px; }
  .accessibility-brand-separator { height: 18px; }
  .accessibility-toolbar { gap: 0.18rem; }
  .a11y-btn {
    font-size: 0.58rem;
    padding: 0.18rem 0.26rem;
    min-height: 1.42rem;
  }
  .a11y-select {
    width: min(100%, 15rem);
    font-size: 0.58rem;
    min-height: 1.42rem;
  }
  .a11y-more-panel { padding-top: 0.25rem; }
}
@media (min-width: 1024px) {
  .a11y-more-panel {
    position: fixed !important;
    top: calc(var(--a11y-topbar-height) + 0.35rem) !important;
    left: 50% !important;
    right: auto !important;
    width: min(1120px, calc(100vw - 2rem)) !important;
    transform: translateX(-50%) !important;
    padding: 0.55rem 0.7rem !important;
    z-index: 100002 !important;
    overflow: visible !important;
    max-height: calc(100vh - var(--a11y-topbar-height) - 0.85rem) !important;
    border-radius: 0.85rem !important;
  }
  .a11y-more-grid {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 0.42rem !important;
  }
  .a11y-help-text {
    width: auto !important;
    min-width: 265px !important;
    margin: 0 auto 0 0 !important;
    text-align: left !important;
    font-size: 0.72rem !important;
    line-height: 1.2 !important;
    white-space: normal !important;
  }
  .a11y-theme-picker {
    grid-column: auto !important;
    width: auto !important;
    min-width: 13rem !important;
    flex: 0 0 13rem !important;
  }
  .a11y-theme-trigger {
    min-height: 1.9rem !important;
    font-size: 0.74rem !important;
    padding: 0.36rem 0.52rem 0.36rem 0.62rem !important;
  }
  .a11y-theme-options {
    position: absolute !important;
    z-index: 100001 !important;
    top: calc(100% + 0.35rem) !important;
    left: 0 !important;
    right: 0 !important;
    margin-top: 0 !important;
    box-shadow: 0 12px 26px rgba(17, 24, 39, 0.18) !important;
    backdrop-filter: blur(10px) !important;
  }
  .a11y-theme-options button {
    min-height: 2rem !important;
    font-size: 0.78rem !important;
    padding: 0.45rem 0.58rem !important;
  }
  .a11y-more-grid > .a11y-btn {
    width: auto !important;
    flex: 0 0 auto !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* BC_A11Y_VISUAL_REFINEMENT_START
   Layout original preservado; refinamentos visuais, responsividade e tolerancia a aumento de fonte.
*/
#bc-a11y-root,
#bc-a11y-root *,
#bc-a11y-root *::before,
#bc-a11y-root *::after {
  box-sizing: border-box !important;
  font-family: Arial, Verdana, Tahoma, sans-serif;
}
#bc-a11y-root {
  position: relative !important;
  z-index: 100000 !important;
}
#bc-a11y-root .accessibility-topbar {
  z-index: 100000 !important;
  overflow: visible !important;
}
#bc-a11y-root .accessibility-topbar-inner {
  min-width: 0 !important;
  max-width: min(1240px, 100%) !important;
}
#bc-a11y-root .accessibility-brand,
#bc-a11y-root .accessibility-toolbar,
#bc-a11y-root .a11y-more-panel,
#bc-a11y-root .a11y-more-grid,
#bc-a11y-root .a11y-theme-picker {
  min-width: 0 !important;
}
#bc-a11y-root .accessibility-toolbar,
#bc-a11y-root .a11y-more-panel,
#bc-a11y-root .a11y-more-grid {
  overflow: visible !important;
}
#bc-a11y-root .a11y-btn,
#bc-a11y-root .a11y-select,
#bc-a11y-root .a11y-theme-trigger,
#bc-a11y-root .a11y-theme-options button {
  max-width: 100% !important;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease !important;
}
#bc-a11y-root .a11y-btn:hover,
#bc-a11y-root .a11y-select:hover,
#bc-a11y-root .a11y-theme-trigger:hover {
  border-color: #f5a800 !important;
  background: #fffaf0 !important;
  color: #5d2b0a !important;
  box-shadow: 0 5px 12px rgba(143, 30, 35, 0.10) !important;
}
#bc-a11y-root .a11y-btn[aria-pressed="true"] {
  border-color: #c0272d !important;
  background: linear-gradient(135deg, #8f1e23, #c0272d) !important;
  color: #ffffff !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16), 0 6px 14px rgba(143, 30, 35, 0.18) !important;
}
#bc-a11y-root .a11y-btn[aria-pressed="true"]:hover {
  border-color: #f5a800 !important;
  background: linear-gradient(135deg, #7c171c, #b51f25) !important;
  color: #ffffff !important;
}
#bc-a11y-root .a11y-more-panel {
  z-index: 100010 !important;
  max-width: calc(100vw - 1rem) !important;
}
#bc-a11y-root .a11y-help-text {
  min-width: 0 !important;
  overflow-wrap: anywhere !important;
}
#bc-a11y-root .a11y-theme-picker {
  z-index: 100020 !important;
}
#bc-a11y-root .a11y-theme-trigger {
  position: relative !important;
  min-width: 0 !important;
}
#bc-a11y-root .a11y-theme-current {
  min-width: 0 !important;
}
#bc-a11y-root .a11y-theme-arrow {
  width: 1rem !important;
  height: 1rem !important;
  display: inline-grid !important;
  place-items: center !important;
  line-height: 1 !important;
  transform-origin: center center !important;
  transition: transform 0.18s ease, color 0.16s ease !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-arrow {
  transform: rotate(180deg) !important;
}
#bc-a11y-root .a11y-theme-options {
  z-index: 100030 !important;
  transform-origin: top center !important;
  animation: bcA11yMenuIn 0.16s ease both;
}
#bc-a11y-root .a11y-theme-options button:hover,
#bc-a11y-root .a11y-theme-options button:focus-visible {
  background: #fff3d0 !important;
  color: #5d2b0a !important;
  box-shadow: inset 3px 0 0 #f5a800 !important;
  outline: 0 !important;
}
#bc-a11y-root .a11y-theme-options button[aria-selected="true"] {
  background: linear-gradient(135deg, #8f1e23, #c0272d) !important;
  color: #ffffff !important;
  box-shadow: inset 3px 0 0 #f5a800 !important;
}
#bc-a11y-root .a11y-theme-options button[aria-selected="true"]::after {
  color: #f5a800 !important;
}
@keyframes bcA11yMenuIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (min-width: 1024px) {
  #bc-a11y-root .accessibility-topbar-inner {
    padding-left: clamp(1.25rem, 2.2vw, 2.25rem) !important;
    padding-right: clamp(1rem, 2vw, 2rem) !important;
    gap: clamp(0.75rem, 1.6vw, 1.2rem) !important;
  }
  #bc-a11y-root .accessibility-toolbar {
    justify-content: flex-end !important;
    flex-wrap: wrap !important;
  }
  #bc-a11y-root .a11y-more-panel {
    width: min(1120px, calc(100vw - 2rem)) !important;
    overflow: visible !important;
  }
  #bc-a11y-root .a11y-more-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 0.42rem !important;
  }
  #bc-a11y-root .a11y-help-text {
    flex: 1 1 265px !important;
    min-width: min(265px, 100%) !important;
    width: auto !important;
    text-align: left !important;
  }
  #bc-a11y-root .a11y-theme-picker {
    flex: 0 1 13rem !important;
    min-width: 11rem !important;
    width: auto !important;
  }
  #bc-a11y-root .a11y-theme-options {
    position: absolute !important;
    top: calc(100% + 0.35rem) !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-height: min(16rem, calc(100vh - var(--a11y-topbar-height) - 3rem)) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  #bc-a11y-root .a11y-more-grid > .a11y-btn {
    width: auto !important;
    flex: 0 1 auto !important;
    min-width: max-content !important;
  }
}
@media (min-width: 901px) and (max-width: 1180px) {
  #bc-a11y-root .accessibility-topbar-inner {
    grid-template-columns: 1fr !important;
    justify-items: center !important;
  }
  #bc-a11y-root .accessibility-toolbar {
    justify-content: center !important;
  }
}
@media (max-width: 900px) {
  #bc-a11y-root .a11y-more-panel {
    overflow: visible !important;
  }
  #bc-a11y-root .a11y-more-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #bc-a11y-root .a11y-theme-options {
    position: static !important;
    max-height: calc(100vh - var(--a11y-topbar-height) - 7rem) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
}
@media (max-width: 520px) {
  #bc-a11y-root .a11y-btn,
  #bc-a11y-root .a11y-theme-trigger,
  #bc-a11y-root .a11y-theme-options button {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    line-height: 1.12 !important;
  }
}
html.a11y-large-spacing #bc-a11y-root .accessibility-toolbar,
html.a11y-large-spacing #bc-a11y-root .a11y-more-grid {
  display: flex !important;
  flex-wrap: wrap !important;
}
html.a11y-large-spacing #bc-a11y-root .a11y-btn,
html.a11y-large-spacing #bc-a11y-root .a11y-theme-trigger,
html.a11y-large-spacing #bc-a11y-root .a11y-theme-options button {
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  height: auto !important;
  line-height: 1.25 !important;
}

/* BC_A11Y_FIXES_START
   Ajustes: animação de abertura, seta do seletor e posição responsiva do menu avançado.
*/
#bc-a11y-root .a11y-more-panel {
  display: block !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  top: var(--a11y-more-panel-top, calc(var(--a11y-topbar-height) + 0.45rem)) !important;
  left: var(--a11y-more-panel-left, max(0.5rem, env(safe-area-inset-left))) !important;
  right: var(--a11y-more-panel-right, max(0.5rem, env(safe-area-inset-right))) !important;
  width: var(--a11y-more-panel-width, auto) !important;
  transform: var(--a11y-more-panel-transform-closed, translateY(-8px) scale(0.985)) !important;
  transform-origin: top center !important;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0s linear 0.2s !important;
  will-change: opacity, transform !important;
}
#bc-a11y-root .a11y-more-panel.is-open {
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: var(--a11y-more-panel-transform-open, translateY(0) scale(1)) !important;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0s linear 0s !important;
}
#bc-a11y-root .a11y-theme-arrow {
  width: 0.92rem !important;
  height: 0.92rem !important;
  border-radius: 999px !important;
  background: rgba(192, 39, 45, 0.08) !important;
  border: 1px solid rgba(192, 39, 45, 0.26) !important;
  position: relative !important;
  color: transparent !important;
  font-size: 0 !important;
}
#bc-a11y-root .a11y-theme-arrow::before {
  content: "" !important;
  position: absolute !important;
  left: 50% !important;
  top: 47% !important;
  width: 0.34rem !important;
  height: 0.34rem !important;
  border-right: 2px solid #8f1e23 !important;
  border-bottom: 2px solid #8f1e23 !important;
  transform: translate(-50%, -60%) rotate(45deg) !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-arrow {
  background: rgba(192, 39, 45, 0.14) !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-arrow::before {
  transform: translate(-50%, -35%) rotate(225deg) !important;
}
@media (min-width: 1024px) {
  #bc-a11y-root .a11y-more-panel {
    right: var(--a11y-more-panel-right, auto) !important;
    max-width: calc(100vw - 2rem) !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  #bc-a11y-root .a11y-more-panel {
    transition: none !important;
    transform: var(--a11y-more-panel-transform-open, none) !important;
  }
}
html.a11y-reduced-motion #bc-a11y-root .a11y-more-panel {
  transition: none !important;
  transform: var(--a11y-more-panel-transform-open, none) !important;
}

/* BC_A11Y_BREAKPOINT_FIXES_START
   Refinos solicitados: icone no botao + opcoes, respiro da borda vermelha e layout em linha no desktop.
*/
#bc-a11y-root [data-a11y-action="more"] {
  position: relative !important;
  padding-right: 1.62rem !important;
}
#bc-a11y-root [data-a11y-action="more"]::after {
  content: "" !important;
  position: absolute !important;
  right: 0.42rem !important;
  top: 50% !important;
  width: 0.92rem !important;
  height: 0.92rem !important;
  margin-top: -0.46rem !important;
  border-radius: 999px !important;
  background: rgba(192, 39, 45, 0.08) !important;
  border: 1px solid rgba(192, 39, 45, 0.26) !important;
  transition: transform 0.18s ease, background-color 0.16s ease, border-color 0.16s ease !important;
}
#bc-a11y-root [data-a11y-action="more"]::before {
  content: "" !important;
  position: absolute !important;
  right: 0.715rem !important;
  top: 50% !important;
  width: 0.34rem !important;
  height: 0.34rem !important;
  margin-top: -0.15rem !important;
  border-right: 2px solid #8f1e23 !important;
  border-bottom: 2px solid #8f1e23 !important;
  transform: rotate(45deg) !important;
  transform-origin: center !important;
  z-index: 1 !important;
  transition: transform 0.18s ease, margin-top 0.18s ease !important;
}
#bc-a11y-root [data-a11y-action="more"][aria-expanded="true"]::after {
  background: rgba(192, 39, 45, 0.14) !important;
}
#bc-a11y-root [data-a11y-action="more"][aria-expanded="true"]::before {
  margin-top: -0.02rem !important;
  transform: rotate(225deg) !important;
}
@media (min-width: 1024px) {
  #bc-a11y-root .a11y-more-panel {
    width: min(1500px, calc(100vw - 2rem)) !important;
    padding: 0.55rem 0.95rem !important;
  }
  #bc-a11y-root .a11y-more-grid {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.42rem !important;
  }
  #bc-a11y-root .a11y-help-text {
    flex: 0 1 330px !important;
    min-width: 250px !important;
    max-width: 330px !important;
    margin: 0 0.25rem 0 0 !important;
    text-align: left !important;
  }
  #bc-a11y-root .a11y-theme-picker {
    flex: 0 0 16rem !important;
    min-width: 16rem !important;
  }
  #bc-a11y-root .a11y-more-grid > .a11y-btn {
    flex: 0 0 auto !important;
    min-width: max-content !important;
    white-space: nowrap !important;
  }
}
@media (min-width: 1024px) and (max-width: 1520px) {
  #bc-a11y-root .a11y-more-panel {
    width: calc(100vw - 1rem) !important;
    padding-left: 0.7rem !important;
    padding-right: 0.7rem !important;
  }
  #bc-a11y-root .a11y-more-grid {
    gap: 0.32rem !important;
  }
  #bc-a11y-root .a11y-help-text {
    flex-basis: 275px !important;
    min-width: 230px !important;
    max-width: 285px !important;
    font-size: 0.68rem !important;
  }
  #bc-a11y-root .a11y-theme-picker {
    flex-basis: 14.5rem !important;
    min-width: 14.5rem !important;
  }
  #bc-a11y-root .a11y-btn,
  #bc-a11y-root .a11y-theme-trigger {
    font-size: 0.68rem !important;
  }
}
@media (min-width: 1024px) and (max-width: 1280px) {
  #bc-a11y-root .a11y-more-grid {
    flex-wrap: wrap !important;
    justify-content: center !important;
  }
  #bc-a11y-root .a11y-help-text {
    flex: 1 0 100% !important;
    max-width: none !important;
    text-align: center !important;
    margin: 0 0 0.15rem 0 !important;
  }
}

/* BC_A11Y_ARROW_STATE_FIXES_START
   Setas consistentes: select aponta para cima quando aberto; botao de opcoes usa a mesma seta no lugar do +/-.
*/
#bc-a11y-root .a11y-theme-arrow,
#bc-a11y-root [data-a11y-action="more"]::after {
  width: 0.92rem !important;
  height: 0.92rem !important;
  display: inline-grid !important;
  place-items: center !important;
  border-radius: 999px !important;
  background: rgba(192, 39, 45, 0.08) !important;
  border: 1px solid rgba(192, 39, 45, 0.26) !important;
  color: transparent !important;
  font-size: 0 !important;
  line-height: 1 !important;
  flex: 0 0 auto !important;
  transform: none !important;
  transition: background-color 0.16s ease, border-color 0.16s ease !important;
}
#bc-a11y-root .a11y-theme-arrow::before,
#bc-a11y-root [data-a11y-action="more"]::before {
  content: "" !important;
  display: block !important;
  width: 0.34rem !important;
  height: 0.34rem !important;
  border-right: 2px solid #8f1e23 !important;
  border-bottom: 2px solid #8f1e23 !important;
  transform: rotate(45deg) !important;
  transform-origin: center !important;
  transition: transform 0.18s ease !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-arrow,
#bc-a11y-root [data-a11y-action="more"][aria-expanded="true"]::after {
  background: rgba(192, 39, 45, 0.14) !important;
  border-color: rgba(192, 39, 45, 0.36) !important;
  transform: none !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-arrow::before,
#bc-a11y-root [data-a11y-action="more"][aria-expanded="true"]::before {
  transform: rotate(225deg) !important;
}
#bc-a11y-root [data-a11y-action="more"] {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.32rem !important;
  padding-left: 0.42rem !important;
  padding-right: 0.5rem !important;
}
#bc-a11y-root [data-a11y-action="more"]::after {
  position: static !important;
  inset: auto !important;
  margin: 0 !important;
  order: -1 !important;
}
#bc-a11y-root [data-a11y-action="more"]::before {
  position: absolute !important;
  left: 0.665rem !important;
  right: auto !important;
  top: 50% !important;
  margin: -0.14rem 0 0 0 !important;
  z-index: 1 !important;
}
#bc-a11y-root [data-a11y-action="more"][aria-expanded="true"]::before {
  margin-top: 0.02rem !important;
}
#bc-a11y-root .a11y-theme-arrow::before {
  position: static !important;
  left: auto !important;
  top: auto !important;
  margin: 0 !important;
}

/* BC_A11Y_ARROW_CENTER_DISTANCE_FIXES_START
   Distancia do painel reduzida e chevrons centralizados matematicamente na bolinha.
*/
#bc-a11y-root .a11y-more-panel {
  top: var(--a11y-more-panel-top, calc(var(--a11y-topbar-height) + 0.15rem)) !important;
}
#bc-a11y-root .a11y-theme-arrow {
  position: relative !important;
  display: inline-block !important;
  width: 0.92rem !important;
  height: 0.92rem !important;
  min-width: 0.92rem !important;
  min-height: 0.92rem !important;
  padding: 0 !important;
  overflow: visible !important;
}
#bc-a11y-root .a11y-theme-arrow::before {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 0.34rem !important;
  height: 0.34rem !important;
  margin: 0 !important;
  transform: translate(-50%, -62%) rotate(45deg) !important;
  transform-origin: center center !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-arrow::before {
  transform: translate(-50%, -38%) rotate(225deg) !important;
}
#bc-a11y-root [data-a11y-action="more"] {
  position: relative !important;
  padding-left: 1.62rem !important;
  padding-right: 0.5rem !important;
}
#bc-a11y-root [data-a11y-action="more"]::after {
  position: absolute !important;
  left: 0.42rem !important;
  top: 50% !important;
  width: 0.92rem !important;
  height: 0.92rem !important;
  min-width: 0.92rem !important;
  min-height: 0.92rem !important;
  margin: 0 !important;
  transform: translateY(-50%) !important;
  order: initial !important;
}
#bc-a11y-root [data-a11y-action="more"]::before {
  position: absolute !important;
  left: calc(0.42rem + 0.46rem) !important;
  top: 50% !important;
  width: 0.34rem !important;
  height: 0.34rem !important;
  margin: 0 !important;
  transform: translate(-50%, -62%) rotate(45deg) !important;
  transform-origin: center center !important;
  z-index: 1 !important;
}
#bc-a11y-root [data-a11y-action="more"][aria-expanded="true"]::before {
  margin: 0 !important;
  transform: translate(-50%, -38%) rotate(225deg) !important;
}
/* BC_A11Y_ARROW_CENTER_DISTANCE_FIXES_END */

/* BC_A11Y_ARROW_STATE_FIXES_END */

/* BC_A11Y_BREAKPOINT_FIXES_END */

/* BC_A11Y_FIXES_END */


/* BC_A11Y_MORE_REAL_ARROW_FIX_START
   Botao opcoes usa o mesmo elemento visual do select; pseudo-elementos antigos desativados.
*/
#bc-a11y-root .a11y-more-trigger {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.36rem !important;
  padding-left: 0.42rem !important;
  padding-right: 0.52rem !important;
}
#bc-a11y-root .a11y-more-trigger::before,
#bc-a11y-root .a11y-more-trigger::after {
  content: none !important;
  display: none !important;
}
#bc-a11y-root .a11y-more-trigger .a11y-more-arrow {
  position: relative !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  order: 0 !important;
  margin: 0 !important;
  transform: none !important;
}
#bc-a11y-root .a11y-more-trigger .a11y-more-arrow::before {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 0.34rem !important;
  height: 0.34rem !important;
  margin: 0 !important;
  border-right: 2px solid #8f1e23 !important;
  border-bottom: 2px solid #8f1e23 !important;
  transform: translate(-50%, -62%) rotate(45deg) !important;
  transform-origin: center center !important;
}
#bc-a11y-root .a11y-more-trigger[aria-expanded="true"] .a11y-more-arrow {
  background: rgba(192, 39, 45, 0.14) !important;
  border-color: rgba(192, 39, 45, 0.36) !important;
}
#bc-a11y-root .a11y-more-trigger[aria-expanded="true"] .a11y-more-arrow::before {
  transform: translate(-50%, -38%) rotate(225deg) !important;
}
#bc-a11y-root .a11y-more-label {
  display: inline-block !important;
  line-height: 1 !important;
}
/* BC_A11Y_MORE_REAL_ARROW_FIX_END */


/* BC_A11Y_FONT_SCALE_OVERFLOW_FIX_START
   Evita estouro de texto quando o usuario aumenta a fonte.
*/
#bc-a11y-root .a11y-more-panel {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}
#bc-a11y-root .a11y-more-grid {
  min-width: 0 !important;
  max-width: 100% !important;
}
#bc-a11y-root .a11y-help-text,
#bc-a11y-root .a11y-more-label,
#bc-a11y-root .a11y-theme-current,
#bc-a11y-root .a11y-btn,
#bc-a11y-root .a11y-theme-trigger,
#bc-a11y-root .a11y-theme-options button {
  min-width: 0 !important;
  max-width: 100% !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
  line-height: 1.15 !important;
}
#bc-a11y-root .a11y-help-text {
  hyphens: auto !important;
}
#bc-a11y-root .a11y-theme-trigger,
#bc-a11y-root .a11y-more-trigger,
#bc-a11y-root .a11y-btn {
  height: auto !important;
  min-height: 1.9rem !important;
}
#bc-a11y-root .a11y-theme-trigger {
  align-items: center !important;
}
#bc-a11y-root .a11y-more-trigger {
  align-items: center !important;
}
@media (min-width: 1024px) {
  #bc-a11y-root .a11y-more-grid {
    flex-wrap: wrap !important;
    align-items: stretch !important;
    justify-content: center !important;
  }
  #bc-a11y-root .a11y-help-text {
    flex: 1 1 16rem !important;
    min-width: min(16rem, 100%) !important;
    max-width: 24rem !important;
    align-self: center !important;
  }
  #bc-a11y-root .a11y-theme-picker {
    flex: 1 1 16rem !important;
    min-width: min(16rem, 100%) !important;
    max-width: 32rem !important;
  }
  #bc-a11y-root .a11y-more-grid > .a11y-btn {
    flex: 0 1 auto !important;
    min-width: 0 !important;
  }
  #bc-a11y-root .a11y-theme-trigger,
  #bc-a11y-root .a11y-btn {
    padding-top: 0.42rem !important;
    padding-bottom: 0.42rem !important;
  }
}
@media (min-width: 1024px) and (max-width: 1520px) {
  #bc-a11y-root .a11y-more-grid {
    flex-wrap: wrap !important;
    row-gap: 0.42rem !important;
  }
  #bc-a11y-root .a11y-help-text {
    flex: 1 1 18rem !important;
    min-width: min(18rem, 100%) !important;
    max-width: 26rem !important;
    text-align: left !important;
  }
  #bc-a11y-root .a11y-theme-picker {
    flex: 1 1 18rem !important;
    min-width: min(18rem, 100%) !important;
  }
}
@media (max-width: 1023px) {
  #bc-a11y-root .a11y-more-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #bc-a11y-root .a11y-help-text,
  #bc-a11y-root .a11y-theme-picker {
    grid-column: 1 / -1 !important;
  }
}
@media (max-width: 520px) {
  #bc-a11y-root .a11y-more-grid {
    grid-template-columns: 1fr !important;
  }
}
html.a11y-large-spacing #bc-a11y-root .a11y-more-grid {
  flex-wrap: wrap !important;
  align-items: stretch !important;
}
html.a11y-large-spacing #bc-a11y-root .a11y-help-text,
html.a11y-large-spacing #bc-a11y-root .a11y-theme-picker,
html.a11y-large-spacing #bc-a11y-root .a11y-more-grid > .a11y-btn {
  flex: 1 1 12rem !important;
  min-width: min(12rem, 100%) !important;
}
/* BC_A11Y_FONT_SCALE_OVERFLOW_FIX_END */


/* BC_A11Y_CUSTOM_SELECT_DROPDOWN_FIX_START
   Corrige o dropdown do select personalizado apos ajustes de overflow/fonte.
*/
#bc-a11y-root .a11y-more-panel {
  overflow-x: visible !important;
}
#bc-a11y-root .a11y-theme-picker {
  position: relative !important;
  overflow: visible !important;
  z-index: 100040 !important;
}
#bc-a11y-root .a11y-theme-picker.is-open {
  z-index: 100060 !important;
}
#bc-a11y-root .a11y-theme-options {
  z-index: 100070 !important;
  min-width: 100% !important;
  box-sizing: border-box !important;
}
@media (min-width: 901px) {
  #bc-a11y-root .a11y-more-panel {
    overflow: visible !important;
  }
  #bc-a11y-root .a11y-theme-options {
    position: absolute !important;
    top: calc(100% + 0.28rem) !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-height: min(16rem, calc(100vh - var(--a11y-more-panel-top, var(--a11y-topbar-height)) - 5rem)) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
}
@media (max-width: 900px) {
  #bc-a11y-root .a11y-more-panel {
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  #bc-a11y-root .a11y-theme-options {
    position: static !important;
    width: 100% !important;
    max-height: calc(100vh - var(--a11y-topbar-height) - 7rem) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
}
/* BC_A11Y_CUSTOM_SELECT_DROPDOWN_FIX_END */


/* BC_A11Y_FLOATING_SELECT_MENU_FIX_START
   Select personalizado sempre suspenso: nao ocupa fluxo e nao empurra botoes.
*/
#bc-a11y-root .a11y-more-panel {
  overflow: visible !important;
}
#bc-a11y-root .a11y-theme-picker {
  position: relative !important;
  overflow: visible !important;
  z-index: 100080 !important;
}
#bc-a11y-root .a11y-theme-picker.is-open {
  z-index: 100120 !important;
}
#bc-a11y-root .a11y-theme-options {
  position: absolute !important;
  top: calc(100% + 0.28rem) !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  min-width: 100% !important;
  margin-top: 0 !important;
  z-index: 100140 !important;
  max-height: min(16rem, calc(100vh - var(--a11y-more-panel-top, var(--a11y-topbar-height)) - 6rem)) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}
#bc-a11y-root .a11y-theme-picker.is-open .a11y-theme-options {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 0.18rem !important;
}
@media (max-width: 900px) {
  #bc-a11y-root .a11y-more-panel {
    overflow: visible !important;
  }
  #bc-a11y-root .a11y-theme-picker {
    grid-column: 1 / -1 !important;
  }
  #bc-a11y-root .a11y-theme-options {
    position: absolute !important;
    top: calc(100% + 0.28rem) !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-height: min(16rem, calc(100vh - var(--a11y-more-panel-top, var(--a11y-topbar-height)) - 8rem)) !important;
  }
}
@media (max-width: 520px) {
  #bc-a11y-root .a11y-theme-options {
    max-height: min(14rem, calc(100vh - var(--a11y-more-panel-top, var(--a11y-topbar-height)) - 7rem)) !important;
  }
}
/* BC_A11Y_FLOATING_SELECT_MENU_FIX_END */

/* BC_A11Y_VISUAL_REFINEMENT_END */

`;

  const html = `
<a class="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
<svg class="sr-only" aria-hidden="true" focusable="false" width="0" height="0">
  <filter id="a11y-deuteranopia-filter">
    <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
  </filter>
  <filter id="a11y-protanopia-filter">
    <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0" />
  </filter>
  <filter id="a11y-tritanopia-filter">
    <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0" />
  </filter>
</svg>
<header class="accessibility-topbar" aria-label="Barra institucional e ferramentas de acessibilidade">
  <div class="accessibility-topbar-inner">
    <div class="accessibility-brand" aria-label="Governo de Minas Gerais e SCCG">
      <img class="accessibility-logo-govmg" src="../../../public/images/logo-govmg.png" alt="Governo de Minas Gerais" width="126" height="28" decoding="async" fetchpriority="high" />
      <span class="accessibility-brand-separator" aria-hidden="true"></span>
      <img class="accessibility-logo-sccg" src="../../../public/images/logo-sccg.png" alt="Superintendência Central de Contadoria Geral" width="100" height="22" decoding="async" fetchpriority="high" />
    </div>
    <nav class="accessibility-toolbar" aria-label="Controles rápidos de acessibilidade">
      <button class="a11y-btn" type="button" data-a11y-action="font-decrease" aria-label="Diminuir tamanho da fonte">A−</button>
      <button class="a11y-btn" type="button" data-a11y-action="font-increase" aria-label="Aumentar tamanho da fonte">A+</button>
      <button class="a11y-btn" type="button" data-a11y-toggle="highContrast" aria-pressed="false">Contraste</button>
      <button class="a11y-btn" type="button" data-a11y-action="vlibras" aria-label="Abrir VLibras">VLibras</button>
      <button class="a11y-btn a11y-more-trigger" type="button" data-a11y-action="more" aria-label="Abrir opções de acessibilidade" aria-controls="a11y-more-panel" aria-expanded="false"><span class="a11y-theme-arrow a11y-more-arrow" aria-hidden="true"></span><span class="a11y-more-label">Mais opções</span></button>
    </nav>
    <div class="a11y-more-panel" id="a11y-more-panel">
      <div class="a11y-more-grid" aria-label="Opções avançadas de acessibilidade">
        <span class="a11y-help-text">As preferências serão salvas automaticamente neste navegador.</span>
        <label class="sr-only" id="a11y-theme-label" for="a11y-theme-select">Tema para daltonismo</label>
        <select class="sr-only" id="a11y-theme-select" data-a11y-action="theme" aria-label="Selecionar tema para daltonismo" tabindex="-1">
          <option value="default">Tema padrão</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="protanopia">Protanopia</option>
          <option value="tritanopia">Tritanopia</option>
          <option value="achromatopsia">Monocromático</option>
        </select>
        <div class="a11y-theme-picker" data-a11y-theme-picker>
          <button class="a11y-theme-trigger" type="button" data-a11y-action="theme-menu" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="a11y-theme-label a11y-theme-current">
            <span class="a11y-theme-dot" aria-hidden="true"></span>
            <span id="a11y-theme-current" class="a11y-theme-current">Tema padrão</span>
            <span class="a11y-theme-arrow" aria-hidden="true"></span>
          </button>
          <div class="a11y-theme-options" role="listbox" aria-labelledby="a11y-theme-label">
            <button type="button" role="option" data-a11y-theme-option="default" aria-selected="true">Tema padrão</button>
            <button type="button" role="option" data-a11y-theme-option="deuteranopia" aria-selected="false">Deuteranopia</button>
            <button type="button" role="option" data-a11y-theme-option="protanopia" aria-selected="false">Protanopia</button>
            <button type="button" role="option" data-a11y-theme-option="tritanopia" aria-selected="false">Tritanopia</button>
            <button type="button" role="option" data-a11y-theme-option="achromatopsia" aria-selected="false">Monocromático</button>
          </div>
        </div>
        <button class="a11y-btn" type="button" data-a11y-toggle="readableFont" aria-pressed="false">Fonte legível</button>
        <button class="a11y-btn" type="button" data-a11y-toggle="openDyslexic" aria-pressed="false">OpenDyslexic</button>
        <button class="a11y-btn" type="button" data-a11y-toggle="largeSpacing" aria-pressed="false">Espaçamento</button>
        <button class="a11y-btn" type="button" data-a11y-toggle="underlineLinks" aria-pressed="false">Destacar links</button>
        <button class="a11y-btn" type="button" data-a11y-toggle="reducedMotion" aria-pressed="false">Reduzir movimento</button>
        <button class="a11y-btn" type="button" data-a11y-action="reset">Limpar</button>
      </div>
    </div>
  </div>
</header>
<div vw class="enabled" aria-hidden="false">
  <div vw-access-button class="active"></div>
  <div vw-plugin-wrapper>
    <div class="vw-plugin-top-wrapper"></div>
  </div>
</div>
`;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  };

  const load = () => {
    try {
      state = {
        ...defaults,
        ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
      };
    } catch (e) {
      state = { ...defaults };
    }
  };

  const setClass = (enabled, className) =>
    root.classList.toggle(className, !!enabled);

  const injectStyle = () => {
    if (document.getElementById(A11Y_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = A11Y_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };

  const injectHtml = () => {
    if (document.getElementById(A11Y_ID)) return;
    const container = document.createElement("div");
    container.id = A11Y_ID;
    container.innerHTML = html;
    document.body.prepend(container);
  };

  const ensureMainTarget = () => {
    if (document.getElementById("conteudo-principal")) return;
    const main = document.querySelector("main");
    if (main) {
      main.id = "conteudo-principal";
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    }
  };

  const forceImportant = (element, property, value) => {
    try {
      if (
        element.style.getPropertyValue(property) === value &&
        element.style.getPropertyPriority(property) === "important"
      )
        return;
      element.style.setProperty(property, value, "important");
    } catch (e) {}
  };

  const clearForcedHighContrastInline = () => {
    document.querySelectorAll(`[${INLINE_TAG}="true"]`).forEach((element) => {
      element.removeAttribute(INLINE_TAG);
      [
        "background",
        "background-color",
        "background-image",
        "color",
        "border-color",
        "box-shadow",
        "text-shadow",
      ].forEach((property) => element.style.removeProperty(property));
    });
  };

  const enforcePriorityStyles = () => {
    if (!document.body) return;
    if (!state.highContrast) {
      clearForcedHighContrastInline();
      return;
    }

    document.querySelectorAll("body *").forEach((element) => {
      if (element.matches(PRIORITY_EXCLUDE_SELECTOR)) return;
      if (!(element instanceof HTMLElement) && !(element instanceof SVGElement))
        return;

      element.setAttribute(INLINE_TAG, "true");
      forceImportant(element, "background", "#000");
      forceImportant(element, "background-color", "#000");
      forceImportant(element, "background-image", "none");
      forceImportant(
        element,
        "color",
        element.closest("a") || element.matches("a") ? "#ffff00" : "#fff",
      );
      forceImportant(element, "border-color", "#ffff00");
      forceImportant(element, "box-shadow", "none");
      forceImportant(element, "text-shadow", "none");
    });
  };

  const shouldUsePriorityObserver = () => state.highContrast;
  const schedulePriorityEnforcement = () => {
    if (!shouldUsePriorityObserver() || priorityObserverRaf) return;
    priorityObserverRaf = window.requestAnimationFrame(() => {
      priorityObserverRaf = 0;
      enforcePriorityStyles();
    });
  };
  const startPriorityObserver = () => {
    if (priorityObserver || !shouldUsePriorityObserver()) return;
    priorityObserver = new MutationObserver(schedulePriorityEnforcement);
    priorityObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  };
  const stopPriorityObserver = () => {
    if (priorityObserver) {
      priorityObserver.disconnect();
      priorityObserver = null;
    }
    if (priorityObserverRaf) {
      window.cancelAnimationFrame(priorityObserverRaf);
      priorityObserverRaf = 0;
    }
  };
  const syncPriorityObserver = () => {
    if (shouldUsePriorityObserver()) {
      startPriorityObserver();
      schedulePriorityEnforcement();
      return;
    }
    stopPriorityObserver();
    clearForcedHighContrastInline();
  };

  const apply = () => {
    root.style.setProperty("--a11y-font-scale", String(state.fontScale));
    setClass(state.highContrast, "a11y-high-contrast");
    setClass(state.readableFont, "a11y-readable-font");
    setClass(state.openDyslexic, "a11y-open-dyslexic");
    setClass(state.largeSpacing, "a11y-large-spacing");
    setClass(state.underlineLinks, "a11y-underline-links");
    setClass(state.reducedMotion, "a11y-reduced-motion");

    ["deuteranopia", "protanopia", "tritanopia", "achromatopsia"].forEach(
      (theme) => {
        root.classList.toggle(`a11y-theme-${theme}`, state.theme === theme);
      },
    );

    document.querySelectorAll("[data-a11y-toggle]").forEach((btn) => {
      const key = btn.getAttribute("data-a11y-toggle");
      btn.setAttribute("aria-pressed", String(!!state[key]));
    });

    const themeSelect = document.getElementById("a11y-theme-select");
    if (themeSelect) themeSelect.value = state.theme;

    const themeLabels = {
      default: "Tema padrão",
      deuteranopia: "Deuteranopia",
      protanopia: "Protanopia",
      tritanopia: "Tritanopia",
      achromatopsia: "Monocromático",
    };

    const currentTheme = document.getElementById("a11y-theme-current");
    if (currentTheme)
      currentTheme.textContent = themeLabels[state.theme] || "Tema padrão";

    document.querySelectorAll("[data-a11y-theme-option]").forEach((option) => {
      option.setAttribute(
        "aria-selected",
        String(option.getAttribute("data-a11y-theme-option") === state.theme),
      );
    });

    syncPriorityObserver();
  };

  const announce = (message) => {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.className = "sr-only";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
  };

  const loadVLibras = () => {
    if (!document.getElementById(VLibrAS_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = VLibrAS_SCRIPT_ID;
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.onload = () => {
        try {
          if (window.VLibras && window.VLibras.Widget) {
            window.__BCA11Y_VLIBRAS_WIDGET__ = new window.VLibras.Widget(
              "https://vlibras.gov.br/app",
            );
          }
        } catch (error) {
          console.error("Erro ao inicializar VLibras Widget:", error);
        }
      };
      document.body.appendChild(script);
      return;
    }

    try {
      if (
        window.VLibras &&
        window.VLibras.Widget &&
        !window.__BCA11Y_VLIBRAS_WIDGET__
      ) {
        window.__BCA11Y_VLIBRAS_WIDGET__ = new window.VLibras.Widget(
          "https://vlibras.gov.br/app",
        );
      }
    } catch (error) {
      console.error("Erro ao inicializar VLibras Widget:", error);
    }
  };

  const openVlibras = () => {
    const button = document.querySelector("[vw-access-button]");
    if (button) {
      button.click();
      announce("VLibras aberto.");
    } else {
      announce(
        "VLibras ainda está carregando. Tente novamente em alguns segundos.",
      );
    }
  };

  const closeThemePicker = (picker, focusTrigger = false) => {
    if (!picker) return;
    picker.classList.remove("is-open");
    const trigger = picker.querySelector("[data-a11y-action='theme-menu']");
    trigger?.setAttribute("aria-expanded", "false");
    if (focusTrigger) trigger?.focus();
  };

  const openThemePicker = (picker) => {
    if (!picker) return;
    picker.classList.add("is-open");
    picker
      .querySelector("[data-a11y-action='theme-menu']")
      ?.setAttribute("aria-expanded", "true");
  };

  const getMoreButton = () =>
    document.querySelector('[data-a11y-action="more"]');
  const getMorePanel = () => document.getElementById("a11y-more-panel");
  let morePanelPositionRaf = 0;
  const updateMorePanelPosition = () => {
    const panel = getMorePanel();
    const button = getMoreButton();
    if (!panel || !button) return;
    const rect = button.getBoundingClientRect();
    const topbar = document.querySelector(`#${A11Y_ID} .accessibility-topbar`);
    const topbarRect = topbar?.getBoundingClientRect();
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth || 0;
    const gap = 4;
    const topBase = topbarRect ? topbarRect.bottom : rect.bottom;
    const top = Math.min(
      Math.max(topBase + gap, 0),
      Math.max(window.innerHeight - 64, 0),
    );
    panel.style.setProperty("--a11y-more-panel-top", `${top}px`);
    if (viewportWidth >= 1024) {
      const width = Math.min(1500, Math.max(320, viewportWidth - 32));
      panel.style.setProperty("--a11y-more-panel-left", "50%");
      panel.style.setProperty("--a11y-more-panel-right", "auto");
      panel.style.setProperty("--a11y-more-panel-width", `${width}px`);
      panel.style.setProperty(
        "--a11y-more-panel-transform-closed",
        "translateX(-50%) translateY(-8px) scale(0.985)",
      );
      panel.style.setProperty(
        "--a11y-more-panel-transform-open",
        "translateX(-50%) translateY(0) scale(1)",
      );
      return;
    }
    panel.style.setProperty(
      "--a11y-more-panel-left",
      "max(0.5rem, env(safe-area-inset-left))",
    );
    panel.style.setProperty(
      "--a11y-more-panel-right",
      "max(0.5rem, env(safe-area-inset-right))",
    );
    panel.style.setProperty("--a11y-more-panel-width", "auto");
    panel.style.setProperty(
      "--a11y-more-panel-transform-closed",
      "translateY(-8px) scale(0.985)",
    );
    panel.style.setProperty(
      "--a11y-more-panel-transform-open",
      "translateY(0) scale(1)",
    );
  };
  const scheduleMorePanelPosition = () => {
    if (morePanelPositionRaf) return;
    morePanelPositionRaf = window.requestAnimationFrame(() => {
      morePanelPositionRaf = 0;
      updateMorePanelPosition();
    });
  };
  const setMorePanelOpen = (open, focusButton = false) => {
    const panel = getMorePanel();
    const button = getMoreButton();
    if (!panel || !button) return;
    if (open) updateMorePanelPosition();
    panel.classList.toggle("is-open", !!open);
    if (open) scheduleMorePanelPosition();
    button.setAttribute("aria-expanded", String(!!open));
    const moreLabel = button.querySelector(".a11y-more-label");
    if (moreLabel) moreLabel.textContent = "Mais opções";
    button.setAttribute(
      "aria-label",
      open
        ? "Fechar opções de acessibilidade"
        : "Abrir opções de acessibilidade",
    );
    if (focusButton) button.focus();
  };
  const toggleMorePanel = () => {
    const panel = getMorePanel();
    setMorePanelOpen(!panel?.classList.contains("is-open"));
  };
  const bindEvents = () => {
    document.addEventListener("click", (event) => {
      const control = event.target.closest(
        "[data-a11y-action], [data-a11y-toggle], [data-a11y-theme-option]",
      );
      if (!control) return;

      const toggle = control.getAttribute("data-a11y-toggle");
      const action = control.getAttribute("data-a11y-action");
      const themeOption = control.getAttribute("data-a11y-theme-option");

      if (themeOption) {
        state.theme = themeOption;
        const picker = control.closest("[data-a11y-theme-picker]");
        const trigger = picker?.querySelector(
          "[data-a11y-action='theme-menu']",
        );
        picker?.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
        save();
        apply();
        announce("Tema visual atualizado.");
        trigger?.focus();
        return;
      }

      if (action === "theme-menu") {
        const picker = control.closest("[data-a11y-theme-picker]");
        const isOpen = picker.classList.toggle("is-open");
        control.setAttribute("aria-expanded", String(isOpen));
        return;
      }

      if (toggle) {
        state[toggle] = !state[toggle];
        save();
        apply();
        announce("Preferência de acessibilidade atualizada.");
        return;
      }

      if (action === "font-increase")
        state.fontScale = clamp(
          Number((state.fontScale + 0.1).toFixed(2)),
          0.8,
          1.6,
        );
      if (action === "font-decrease")
        state.fontScale = clamp(
          Number((state.fontScale - 0.1).toFixed(2)),
          0.8,
          1.6,
        );
      if (action === "theme") state.theme = control.value;
      if (action === "vlibras") return openVlibras();
      if (action === "more") {
        event.preventDefault();
        event.stopPropagation();
        toggleMorePanel();
        return;
      }

      if (action === "reset") {
        state = { ...defaults };
        setMorePanelOpen(false);
        document
          .querySelectorAll("[data-a11y-theme-picker].is-open")
          .forEach((openPicker) => closeThemePicker(openPicker, false));
      }
      save();
      apply();
      announce("Ajustes aplicados.");
    });

    document.addEventListener("click", (event) => {
      const rootNode = document.getElementById(A11Y_ID);
      const panel = getMorePanel();
      if (
        panel?.classList.contains("is-open") &&
        rootNode &&
        !rootNode.contains(event.target)
      ) {
        setMorePanelOpen(false);
      }
      document
        .querySelectorAll("[data-a11y-theme-picker].is-open")
        .forEach((picker) => {
          if (!picker.contains(event.target)) closeThemePicker(picker, false);
        });
    });

    document.addEventListener("keydown", (event) => {
      const picker = event.target.closest("[data-a11y-theme-picker]");
      if (!picker) {
        if (event.key === "Escape") {
          setMorePanelOpen(false, true);
          document
            .querySelectorAll("[data-a11y-theme-picker].is-open")
            .forEach((openPicker) => closeThemePicker(openPicker, false));
        }
        return;
      }

      const trigger = picker.querySelector("[data-a11y-action='theme-menu']");
      const options = Array.from(
        picker.querySelectorAll("[data-a11y-theme-option]"),
      );
      const isOpen = picker.classList.contains("is-open");
      const selectedIndex = Math.max(
        0,
        options.findIndex(
          (option) => option.getAttribute("aria-selected") === "true",
        ),
      );
      const focusedIndex = options.indexOf(document.activeElement);

      const focusOption = (index) => {
        openThemePicker(picker);
        options[(index + options.length) % options.length]?.focus();
      };

      if (event.key === "Escape") {
        event.preventDefault();
        closeThemePicker(picker, true);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusOption(focusedIndex >= 0 ? focusedIndex + 1 : selectedIndex);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusOption(focusedIndex >= 0 ? focusedIndex - 1 : selectedIndex);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        focusOption(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        focusOption(options.length - 1);
        return;
      }
      if (
        (event.key === "Enter" || event.key === " ") &&
        event.target === trigger
      ) {
        event.preventDefault();
        isOpen ? closeThemePicker(picker, false) : openThemePicker(picker);
        if (!isOpen) options[selectedIndex]?.focus();
      }
    });

    document.addEventListener("change", (event) => {
      const control = event.target.closest("[data-a11y-action='theme']");
      if (!control) return;
      state.theme = control.value;
      save();
      apply();
      announce("Tema visual atualizado.");
    });
  };

  const installBackToTop = () => {
    if (!document.getElementById("bc-back-to-top-style")) {
      const style = document.createElement("style");
      style.id = "bc-back-to-top-style";
      style.textContent = `
#bc-back-to-top {
  position: fixed !important;
  right: max(18px, env(safe-area-inset-right)) !important;
  bottom: max(18px, env(safe-area-inset-bottom)) !important;
  z-index: 100300 !important;
  width: 52px !important;
  height: 52px !important;
  display: grid !important;
  place-items: center !important;
  border-radius: 18px !important;
  border: 3px solid #f5a800 !important;
  background: linear-gradient(135deg, #c0272d, #8f1e23) !important;
  color: #ffffff !important;
  box-shadow: 0 16px 28px rgba(76, 38, 10, 0.26) !important;
  cursor: pointer !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transform: translateY(12px) scale(0.96) !important;
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease !important;
}
#bc-back-to-top.is-visible {
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: translateY(0) scale(1) !important;
}
#bc-back-to-top:hover,
#bc-back-to-top:focus-visible {
  transform: translateY(-3px) scale(1.03) !important;
  box-shadow: 0 20px 34px rgba(76, 38, 10, 0.32) !important;
  outline: 4px solid #f5a800 !important;
  outline-offset: 4px !important;
}
#bc-back-to-top iconify-icon {
  width: 22px !important;
  height: 22px !important;
  display: block !important;
  fill: currentColor !important;
}
html.a11y-high-contrast #bc-back-to-top {
  background: #000000 !important;
  color: #ffff00 !important;
  border-color: #ffff00 !important;
  box-shadow: 0 0 0 2px #ffffff !important;
}
@media (max-width: 560px) {
  #bc-back-to-top {
    right: max(12px, env(safe-area-inset-right)) !important;
    bottom: max(12px, env(safe-area-inset-bottom)) !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 16px !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  #bc-back-to-top { transition: none !important; }
}
html.a11y-reduced-motion #bc-back-to-top { transition: none !important; }
`;
      document.head.appendChild(style);
    }

    let button = document.getElementById(BACK_TO_TOP_ID);
    if (!button) {
      button = document.createElement("button");
      button.id = BACK_TO_TOP_ID;
      button.type = "button";
      button.setAttribute("aria-label", "Voltar para o início da página");
      button.innerHTML = `<iconify-icon icon="fa6-solid:arrow-up" aria-hidden="true"></iconify-icon>`;
      document.body.appendChild(button);
    }

    let ticking = false;
    const shouldReduceMotion = () =>
      state.reducedMotion ||
      root.classList.contains("a11y-reduced-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      ticking = false;
      button.classList.toggle("is-visible", window.scrollY > 360);
    };
    const scheduleUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion() ? "auto" : "smooth",
      });
      announce("Voltando para o início da página.");
    });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    update();
  };

  const bindResponsivePositioning = () => {
    window.addEventListener("resize", scheduleMorePanelPosition, {
      passive: true,
    });
    window.addEventListener("scroll", scheduleMorePanelPosition, {
      passive: true,
    });
  };
  const init = () => {
    injectStyle();
    injectHtml();
    ensureMainTarget();
    load();
    apply();
    loadVLibras();
    bindEvents();
    bindResponsivePositioning();
    installBackToTop();
    updateMorePanelPosition();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
