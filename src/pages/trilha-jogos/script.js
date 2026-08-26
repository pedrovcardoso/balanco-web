const GAME_FILE_PATHS = {
  "html-caca_palavras": "../jogo/",
  "html-flow": "../jogo/",
  "html-ordem_correta": "../jogo/",
  "html-quiz": "../jogo/",
  "html-swipe": "../jogo/",
  "html-cruzadinha": "../jogo/",
};

/* Geometria dinamica do mapa: quantidade, altura e rota acompanham as fases do banco. */
const MAP_WIDTH = 760;
const MAP_TOP = 105;
const MAP_BOTTOM = 105;
const PHASE_GAP = 126;
let mapHeight = 620;
let levelPositions = [];
const sectionUi = [
  {
    labelPos: { x: 180, y: 135 },
    color: "linear-gradient(135deg,#f59e0b,#c2410c)",
  },
  {
    labelPos: { x: 585, y: 521 },
    color: "linear-gradient(135deg,#38bdf8,#1d4ed8)",
  },
  {
    labelPos: { x: 180, y: 857 },
    color: "linear-gradient(135deg,#ec4899,#7e22ce)",
  },
  {
    labelPos: { x: 570, y: 1234 },
    color: "linear-gradient(135deg,#34d399,#047857)",
  },
];

const engineMeta = {
  "caca-palavras": { icon: "fa-magnifying-glass", file: "html-caca_palavras" },
  flow: { icon: "fa-water", file: "html-flow" },
  "ordem-correta": { icon: "fa-arrow-down-1-9", file: "html-ordem_correta" },
  ordem: { icon: "fa-route", file: "html-ordem_correta" },
  quiz: { icon: "fa-circle-question", file: "html-quiz" },
  swipe: { icon: "fa-hand-pointer", file: "html-swipe" },
  cruzadinha: { icon: "fa-table-cells", file: "html-cruzadinha" },
  "verdadeiro-falso": {
    icon: "fa-check-double",
    file: "html-verdadeiro_falso",
  },
  vf: { icon: "fa-check-double", file: "html-verdadeiro_falso" },
};

let gameMapRows = [];
let mapSections = [];
let selected = null;

function pageUrl(file) {
  const direct = GAME_FILE_PATHS[file];
  if (direct) {
    return direct;
  }

  const normalized = String(file || "")
    .replace(/^html-/, "")
    .replace(/-/g, "_");
  return `jogos/${normalized}.html`;
}

function engineFile(engineSlug) {
  const slug = String(engineSlug || "").trim();
  return engineMeta[slug]?.file || `html-${slug.replace(/-/g, "_")}`;
}

function engineIcon(engineSlug) {
  return engineMeta[String(engineSlug || "").trim()]?.icon || "fa-gamepad";
}

function phaseHref(row) {
  return pageUrl(engineFile(row.engineSlug));
}

function normalizeAssetPath(pathValue) {
  const raw = String(pathValue || "").replace(/\\/g, "/");
  const absolute = raw.startsWith("/") ? raw : `/${raw}`;
  const parts = absolute.split("/");
  const stack = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (stack.length) stack.pop();
      continue;
    }
    stack.push(part);
  }

  return `/${stack.join("/")}`;
}

function resolveRelativeAssetPath(baseAssetPath, relativePath) {
  const base = normalizeAssetPath(baseAssetPath || "/");
  const target = String(relativePath || "").replace(/\\/g, "/");

  if (target.startsWith("/")) {
    return normalizeAssetPath(target);
  }

  const baseDir = base.slice(0, base.lastIndexOf("/") + 1) || "/";
  return normalizeAssetPath(`${baseDir}${target}`);
}

function buildGameUrl(relativePagePath) {
  const currentUrl = new URL(window.location.href);
  const currentAssetPath = currentUrl.searchParams.get("path");

  if (!currentAssetPath) {
    return new URL(relativePagePath, currentUrl.href);
  }

  const target = new URL(currentUrl.href);
  const nextAssetPath = resolveRelativeAssetPath(
    currentAssetPath,
    relativePagePath,
  );

  [
    "file",
    "phase",
    "phaseSlug",
    "section",
    "next",
    "nextPhase",
    "map",
    "back",
  ].forEach((key) => {
    target.searchParams.delete(key);
  });
  target.searchParams.set("path", nextAssetPath);
  return target;
}

function routePhaseFromQuery() {
  const query = new URLSearchParams(window.location.search);
  const targetFile = query.get("go") || query.get("file");
  if (!targetFile) return false;

  const target = buildGameUrl(pageUrl(targetFile));
  const phaseId = query.get("phase");
  if (phaseId) target.searchParams.set("phase", phaseId);

  window.location.replace(target.toString());
  return true;
}

function normalizeState(row) {
  if (!row) return "locked";
  if (row.status === "completed") return "completed";
  if (row.status === "available") return "available";
  return Number(row.phaseOrder || 0) === 1 ? "available" : "locked";
}

function renderStars(count) {
  const safe = Number(count || 0);
  return [0, 1, 2]
    .map(
      (i) =>
        `<i class="fa-${i < safe ? "solid" : "regular"} fa-star" aria-hidden="true"></i>`,
    )
    .join("");
}

function sortRows(rows) {
  return [...rows].sort(
    (a, b) =>
      Number(a.sectionOrder || 0) - Number(b.sectionOrder || 0) ||
      Number(a.phaseOrder || 0) - Number(b.phaseOrder || 0) ||
      Number(a.gamePhaseId || 0) - Number(b.gamePhaseId || 0),
  );
}

function buildSections(rows) {
  const grouped = new Map();
  sortRows(rows).forEach((row) => {
    const sectionSlug = row.sectionSlug || `secao-${row.gameSectionId}`;
    if (!grouped.has(sectionSlug)) {
      const sectionIndex = grouped.size;
      const ui = sectionUi[sectionIndex % sectionUi.length];
      grouped.set(sectionSlug, {
        id: sectionSlug,
        title: row.sectionTitle || sectionSlug,
        order: Number(row.sectionOrder || sectionIndex + 1),
        color: row.sectionColor || ui.color,
        phases: [],
      });
    }
    grouped.get(sectionSlug).phases.push(row);
  });
  return [...grouped.values()].sort((a, b) => a.order - b.order);
}

function getGlobalIndex(sectionIndex, phaseIndex) {
  let index = 0;
  for (let i = 0; i < sectionIndex; i++) index += mapSections[i].phases.length;
  return index + phaseIndex;
}

function getLevelPosition(index) {
  return levelPositions[index] || { x: MAP_WIDTH / 2, y: MAP_TOP };
}
function routeXAt(y) {
  const center = MAP_WIDTH / 2;
  const broadCurve = Math.sin(y / 205 + 0.65) * 178;
  const secondaryCurve = Math.sin(y / 470 + 2.05) * 52;
  const detailCurve = Math.sin(y / 980 + 0.3) * 22;
  return Math.max(
    155,
    Math.min(
      MAP_WIDTH - 155,
      center + broadCurve + secondaryCurve + detailCurve,
    ),
  );
}
function nextRoutePosition(previous, distance = 180) {
  let lowY = previous.y + 48;
  let highY = previous.y + distance;
  for (let iteration = 0; iteration < 32; iteration++) {
    const testY = (lowY + highY) / 2;
    const testX = routeXAt(testY);
    const measured = Math.hypot(testX - previous.x, testY - previous.y);
    if (measured < distance) lowY = testY;
    else highY = testY;
  }
  const y = (lowY + highY) / 2;
  return { x: routeXAt(y), y };
}
function buildSectionPositions(
  count,
  sectionIndex,
  startY,
  previousPosition = null,
) {
  if (count <= 0) return [];
  const positions = [{ x: routeXAt(startY), y: startY }];
  for (let index = 1; index < count; index++) {
    positions.push(nextRoutePosition(positions[index - 1], 180));
  }
  return positions;
}
function buildSmoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`;

  let path = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index++) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const following = points[Math.min(points.length - 1, index + 2)];
    const segmentLength = Math.hypot(next.x - current.x, next.y - current.y);
    const handleLimit = segmentLength * 0.48;

    let firstX = current.x + (next.x - previous.x) / 6;
    let firstY = current.y + (next.y - previous.y) / 6;
    let secondX = next.x - (following.x - current.x) / 6;
    let secondY = next.y - (following.y - current.y) / 6;

    const firstDistance =
      Math.hypot(firstX - current.x, firstY - current.y) || 1;
    const secondDistance = Math.hypot(secondX - next.x, secondY - next.y) || 1;
    if (firstDistance > handleLimit) {
      firstX = current.x + ((firstX - current.x) / firstDistance) * handleLimit;
      firstY = current.y + ((firstY - current.y) / firstDistance) * handleLimit;
    }
    if (secondDistance > handleLimit) {
      secondX = next.x + ((secondX - next.x) / secondDistance) * handleLimit;
      secondY = next.y + ((secondY - next.y) / secondDistance) * handleLimit;
    }

    path += ` C${firstX.toFixed(1)} ${firstY.toFixed(1)} ${secondX.toFixed(1)} ${secondY.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return path;
}
function updateMapGeometry() {
  const SECTION_BAND = 136;
  const SECTION_GAP = 82;
  let cursorY = 28;
  levelPositions = [];

  mapSections.forEach((section, sectionIndex) => {
    section.labelY = cursorY + 42;
    const phaseStartY = cursorY + SECTION_BAND;
    const previousPosition = levelPositions[levelPositions.length - 1] || null;
    section.levelPositions = buildSectionPositions(
      section.phases.length,
      sectionIndex,
      phaseStartY,
      previousPosition,
    );
    section.levelStartIndex = levelPositions.length;
    levelPositions.push(...section.levelPositions);
    const last = section.levelPositions[section.levelPositions.length - 1];
    cursorY = (last ? last.y : phaseStartY) + SECTION_GAP;
  });

  const lastPhaseY = levelPositions.length
    ? levelPositions[levelPositions.length - 1].y
    : MAP_TOP;
  mapHeight = Math.max(620, Math.ceil(lastPhaseY + MAP_BOTTOM));

  const board = document.querySelector(".map-board");
  if (board) board.style.height = `${mapHeight}px`;
  renderSectionBackgrounds();
  renderIntegratedRoute();
}
function renderSectionBackgrounds() {
  const layer = document.querySelector("#sectionBackgrounds");
  if (!layer) return;
  layer.innerHTML = mapSections
    .map((section, index) => {
      const next = mapSections[index + 1];
      const top = Math.max(0, section.labelY - 56);
      const bottom = next ? Math.max(top + 130, next.labelY - 58) : mapHeight;
      return `<div class="section-background" style="top:${top}px;height:${Math.max(120, bottom - top)}px;background:${section.color}"></div>`;
    })
    .join("");
}
function renderIntegratedRoute() {
  const layer = document.querySelector("#routeLayer");
  if (!layer) return;
  const path = buildSmoothPath(levelPositions);
  layer.innerHTML = `
    <svg class="route-svg integrated-route" viewBox="0 0 ${MAP_WIDTH} ${mapHeight}" preserveAspectRatio="none">
      <path class="route-base" d="${path}"></path>
      <path class="route-stripe" d="${path}"></path>
    </svg>`;
}
function getSectionMedalState(section) {
  const phases = section?.phases || [];
  if (!phases.length) return "locked";
  const allCompleted = phases.every(
    (phase) => normalizeState(phase) === "completed",
  );
  if (!allCompleted) return "locked";
  const allThreeStars = phases.every(
    (phase) => Number(phase.bestStars || 0) >= 3,
  );
  return allThreeStars ? "shiny" : "unlocked";
}
function getSectionMedalLabel(state) {
  if (state === "shiny")
    return "Medalha brilhante: todas as fases concluídas com três estrelas";
  if (state === "unlocked")
    return "Medalha liberada: todas as fases da seção foram concluídas";
  return "Medalha bloqueada: conclua todas as fases da seção";
}
function renderLabels() {
  const layer = document.querySelector("#sectionLabels");
  layer.innerHTML = mapSections
    .map((section, index) => {
      const medalState = getSectionMedalState(section);
      const medalLabel = getSectionMedalLabel(medalState);
      return `
      <div class="section-label" data-section-number="${index + 1}" style="left:50%; top:${(section.labelY / mapHeight) * 100}%; transform:translate(-50%, -50%); background:${section.color}">
        <div class="section-label-copy">
          <small>Início de nova seção</small>
          <strong>${section.title}</strong>
        </div>
        <button class="section-medal ${medalState}" type="button" data-section-index="${index}" aria-label="${medalLabel}. Abrir detalhes" title="${medalLabel}">
          <span class="section-medal-core"><i class="fa-solid ${medalState === "locked" ? "fa-lock" : medalState === "shiny" ? "fa-star" : "fa-medal"}" aria-hidden="true"></i></span>
        </button>
      </div>`;
    })
    .join("");
  layer.querySelectorAll(".section-medal").forEach((button) => {
    button.addEventListener("click", () =>
      openMedalDialog(Number(button.dataset.sectionIndex)),
    );
  });
}
function renderLevels() {
  const layer = document.querySelector("#levelsLayer");
  const items = [];
  mapSections.forEach((section, sectionIndex) => {
    section.phases.forEach((row, phaseIndex) => {
      const globalIndex = getGlobalIndex(sectionIndex, phaseIndex);
      const rawPos = getLevelPosition(globalIndex);
      const pos = {
        x: Math.max(72, Math.min(MAP_WIDTH - 72, rawPos.x)),
        y: rawPos.y,
      };
      const state = normalizeState(row);
      const visualState = state === "completed" ? "done" : state;
      const stars = Number(row.bestStars || 0);
      const label =
        state === "locked"
          ? "bloqueada"
          : state === "available"
            ? "disponível"
            : "concluída";
      const icon = engineIcon(row.engineSlug);
      items.push(`
              <button
                class="level ${visualState}"
                type="button"
                data-section-index="${sectionIndex}"
                data-phase-index="${phaseIndex}"
                style="left:${(pos.x / MAP_WIDTH) * 100}%; top:${(pos.y / mapHeight) * 100}%;"
                aria-label="Fase ${globalIndex + 1}, ${row.phaseTitle || row.engineTitle || "Jogo"}, ${label}"
              >
                <div class="level-orb" style="background:${section.color}">
                  <span class="level-number" aria-hidden="true">${globalIndex + 1}</span>
                  <i class="fa-solid ${icon}" aria-hidden="true"></i>
                </div>
                <div class="level-stars" aria-label="${stars} estrelas">${renderStars(stars)}</div>
              </button>`);
    });
  });
  layer.innerHTML = items.join("");
  layer.querySelectorAll(".level").forEach((button) => {
    button.addEventListener("click", () =>
      openDialog(
        Number(button.dataset.sectionIndex),
        Number(button.dataset.phaseIndex),
      ),
    );
  });
}

function openMedalDialog(sectionIndex) {
  const section = mapSections[sectionIndex];
  if (!section) return;
  const state = getSectionMedalState(section);
  const stateText =
    state === "shiny"
      ? "Medalha brilhante conquistada"
      : state === "unlocked"
        ? "Medalha liberada"
        : "Medalha ainda bloqueada";
  document.querySelector("#medalModalSection").textContent =
    `${section.title} · ${stateText}`;
  const modal = document.querySelector("#medalModal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.querySelector("#closeMedalModal").focus();
}
function closeMedalDialog() {
  const modal = document.querySelector("#medalModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}
function openDialog(sectionIndex, phaseIndex) {
  const section = mapSections[sectionIndex];
  const row = section?.phases?.[phaseIndex];
  if (!section || !row) return;
  const state = normalizeState(row);
  const stars = Number(row.bestStars || 0);
  selected = { section, row, state };
  document.querySelector("#modalIcon").style.background = section.color;
  document.querySelector("#modalIcon").innerHTML =
    `<i class="fa-solid ${state === "locked" ? "fa-lock" : engineIcon(row.engineSlug)}" aria-hidden="true"></i>`;
  document.querySelector("#modalSession").textContent = section.title;
  document.querySelector("#modalTitle").textContent =
    row.phaseTitle || row.engineTitle || "Jogo";
  document.querySelector("#modalStars").innerHTML = renderStars(stars);
  document.querySelector("#modalState").textContent =
    state === "locked"
      ? "Fase bloqueada · conclua a fase anterior com 60 pontos ou mais"
      : state === "available"
        ? `Fase disponível · ${row.engineTitle || row.engineSlug || "Jogo"}`
        : `${stars} estrela${stars > 1 ? "s" : ""} · melhor pontuação ${row.bestScore || 0}`;
  document.querySelector("#startLevel").disabled = state === "locked";
  document.querySelector("#levelModal").classList.add("is-open");
}

function closeDialog() {
  document.querySelector("#levelModal").classList.remove("is-open");
}

function startSelectedLevel() {
  if (!selected || selected.state === "locked") return;
  const row = selected.row;
  const target = buildGameUrl(phaseHref(row));
  target.searchParams.set("phase", row.publicPhaseId || "");
  window.location.href = target.toString();
}

function setLoadingMessage(message) {
  const text = document.querySelector("#mapLoadingText");
  if (text) text.textContent = message;
}
function finishLoading() {
  const loading = document.querySelector("#mapLoading");
  const board = document.querySelector(".map-board");
  if (board) board.classList.remove("is-loading");
  if (!loading) return;
  loading.classList.add("is-leaving");
  window.setTimeout(() => loading.remove(), 300);
}
async function loadGameMap() {
  const loading = document.querySelector("#mapLoading");
  try {
    setLoadingMessage("Identificando seu progresso...");
    const user = await BC_API.requireUser();
    const chip = document.querySelector("#bcGameUserChip");
    const name = document.querySelector("#bcGameUserName");
    if (chip && name) {
      name.textContent =
        "Olá, " + (user.displayName || "Participante").split(" ")[0];
      chip.hidden = false;
    }
    setLoadingMessage("Montando a trilha fase por fase...");
    gameMapRows = await BC_API.getGameMap(user.publicUserId);
    mapSections = buildSections(gameMapRows);
    updateMapGeometry();
    renderLabels();
    renderLevels();
    setLoadingMessage("Aventura pronta!");
  } catch (error) {
    console.warn("[Jogos] Falha ao carregar mapa do banco:", error);
    mapSections = [];
    document.querySelector("#sectionLabels").innerHTML = "";
    document.querySelector("#sectionBackgrounds").innerHTML = "";
    document.querySelector("#levelsLayer").innerHTML = "";
    if (loading) {
      loading.querySelector(".loading-title").textContent =
        "Não foi possível abrir a trilha";
      setLoadingMessage("Tente atualizar a página em alguns instantes.");
      loading.querySelector(".loading-player").innerHTML =
        '<i class="fa-solid fa-triangle-exclamation"></i>';
    }
    return;
  } finally {
    if (mapSections.length) window.setTimeout(finishLoading, 220);
  }
}

document
  .querySelector("#closeMedalModal")
  .addEventListener("click", closeMedalDialog);
document.querySelector("#medalModal").addEventListener("click", (event) => {
  if (event.target.id === "medalModal") closeMedalDialog();
});
document.querySelector("#closeModal").addEventListener("click", closeDialog);
document.querySelector("#levelModal").addEventListener("click", (event) => {
  if (event.target.id === "levelModal") closeDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (document.querySelector("#medalModal").classList.contains("is-open"))
      closeMedalDialog();
    else closeDialog();
  }
});
document
  .querySelector("#startLevel")
  .addEventListener("click", startSelectedLevel);
if (!routePhaseFromQuery()) loadGameMap();
