import { useState, useEffect, useCallback } from 'react';
import { getGameMap, getUserProgress } from '../services/trilhaService.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';

export const MAP_WIDTH = 760;
export const MAP_TOP = 105;
export const MAP_BOTTOM = 105;

const sectionUiDefaults = [
  { color: 'linear-gradient(135deg, #f59e0b, #c2410c)' },
  { color: 'linear-gradient(135deg, #38bdf8, #1d4ed8)' },
  { color: 'linear-gradient(135deg, #ec4899, #7e22ce)' },
  { color: 'linear-gradient(135deg, #34d399, #047857)' },
];

export const engineMeta = {
  'caca-palavras': { icon: 'magnifying-glass', slug: 'caca-palavras' },
  flow: { icon: 'water', slug: 'flow' },
  'ordem-correta': { icon: 'arrow-down-1-9', slug: 'ordem-correta' },
  ordem: { icon: 'route', slug: 'ordem-correta' },
  quiz: { icon: 'circle-question', slug: 'quiz' },
  swipe: { icon: 'hand-pointer', slug: 'swipe' },
  cruzadinha: { icon: 'table-cells', slug: 'cruzadinha' },
  'verdadeiro-falso': { icon: 'check-double', slug: 'swipe' },
  vf: { icon: 'check-double', slug: 'swipe' },
};

export function getEngineIcon(engineSlug) {
  const slug = String(engineSlug || '').trim();
  return engineMeta[slug]?.icon || 'gamepad';
}

export function getStoredGameProgress() {
  try {
    return JSON.parse(localStorage.getItem('bc_game_progress') || '{}');
  } catch {
    return {};
  }
}

export function saveStoredGamePhaseProgress(phaseId, { score, stars, attempts }) {
  if (!phaseId) return;
  try {
    const progress = getStoredGameProgress();
    const pId = String(phaseId);
    const existing = progress[pId] || {};
    const safeScore = Number(score || 0);
    const safeStars = Number(stars || 0);
    const isCompleted = safeStars >= 1 || safeScore >= 60 || existing.completed;

    progress[pId] = {
      completed: isCompleted,
      bestScore: Math.max(Number(existing.bestScore || 0), safeScore),
      bestStars: Math.max(Number(existing.bestStars || 0), safeStars),
      attempts: Number(existing.attempts || 0) + Number(attempts || 1),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('bc_game_progress', JSON.stringify(progress));
  } catch (e) {
    console.warn('[saveStoredGamePhaseProgress] Erro ao salvar progresso local:', e);
  }
}

export function normalizeState(row) {
  if (!row) return 'locked';
  if (row.status === 'completed') return 'completed';
  if (row.status === 'available') return 'available';
  return Number(row.phaseOrder || 0) === 1 ? 'available' : 'locked';
}

function routeXAt(y) {
  const center = MAP_WIDTH / 2;
  const broadCurve = Math.sin(y / 205 + 0.65) * 178;
  const secondaryCurve = Math.sin(y / 470 + 2.05) * 52;
  const detailCurve = Math.sin(y / 980 + 0.3) * 22;
  return Math.max(155, Math.min(MAP_WIDTH - 155, center + broadCurve + secondaryCurve + detailCurve));
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

function buildSectionPositions(count, startY) {
  if (count <= 0) return [];
  const positions = [{ x: routeXAt(startY), y: startY }];
  for (let index = 1; index < count; index++) {
    positions.push(nextRoutePosition(positions[index - 1], 180));
  }
  return positions;
}

export function buildSmoothPath(points) {
  if (!points.length) return '';
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

    const firstDistance = Math.hypot(firstX - current.x, firstY - current.y) || 1;
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

export function getSectionMedalState(section) {
  const phases = section?.phases || [];
  if (!phases.length) return 'locked';
  const allCompleted = phases.every((phase) => normalizeState(phase) === 'completed');
  if (!allCompleted) return 'locked';
  const allThreeStars = phases.every((phase) => Number(phase.bestStars || 0) >= 3);
  return allThreeStars ? 'shiny' : 'unlocked';
}

function sortRows(rows) {
  return [...rows].sort(
    (a, b) =>
      Number(a.sectionOrder || 0) - Number(b.sectionOrder || 0) ||
      Number(a.phaseOrder || 0) - Number(b.phaseOrder || 0) ||
      Number(a.gamePhaseId || a.publicPhaseId || a.id || 0) - Number(b.gamePhaseId || b.publicPhaseId || b.id || 0),
  );
}

function groupSections(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const sectionSlug = row.sectionSlug || `secao-${row.gameSectionId}`;
    if (!grouped.has(sectionSlug)) {
      const sectionIndex = grouped.size;
      const ui = sectionUiDefaults[sectionIndex % sectionUiDefaults.length];
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

export function useGameMap() {
  const { user, isGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapSections, setMapSections] = useState([]);
  const [levelPositions, setLevelPositions] = useState([]);
  const [mapHeight, setMapHeight] = useState(620);

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedMedalSection, setSelectedMedalSection] = useState(null);

  const loadMap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawRows = await getGameMap();
      const localProgress = getStoredGameProgress();
      let remoteProgressMap = {};

      if (user && !isGuest) {
        try {
          const remoteList = await getUserProgress();
          (remoteList || []).forEach((item) => {
            const key = String(item.publicPhaseId || item.phaseId || item.phase_id || item.id || '');
            if (key) {
              remoteProgressMap[key] = item;
            }
          });
        } catch (e) {
          console.warn('[useGameMap] Falha ao carregar progresso remoto:', e);
        }
      }

      // Incorpora progresso salvo remotamente no banco e localmente no localStorage
      const rows = (rawRows || []).map((row) => {
        const pId = String(row.publicPhaseId || row.gamePhaseId || row.id || '');
        const local = localProgress[pId];
        const remote = remoteProgressMap[pId];

        let status = row.status;
        let bestScore = Number(row.bestScore || 0);
        let bestStars = Number(row.bestStars || 0);

        if (remote) {
          bestScore = Math.max(bestScore, Number(remote.bestScore || remote.best_score || 0));
          bestStars = Math.max(bestStars, Number(remote.bestStars || remote.best_stars || 0));
          if (bestStars >= 1 || bestScore >= 60 || remote.completedAt) {
            status = 'completed';
          }
        }

        if (local) {
          bestScore = Math.max(bestScore, Number(local.bestScore || 0));
          bestStars = Math.max(bestStars, Number(local.bestStars || 0));
          if (local.completed || bestStars >= 1 || bestScore >= 60) {
            status = 'completed';
          }
        }

        return {
          ...row,
          status,
          bestScore,
          bestStars,
        };
      });

      // 2. Ordena sequencialmente e habilita o desbloqueio encadeado de fases
      const sorted = sortRows(rows);
      for (let i = 0; i < sorted.length; i++) {
        if (i === 0) {
          if (sorted[i].status !== 'completed') {
            sorted[i].status = 'available';
          }
        } else {
          const prev = sorted[i - 1];
          const prevCompleted =
            prev.status === 'completed' ||
            Number(prev.bestStars || 0) >= 1 ||
            Number(prev.bestScore || 0) >= 60;

          if (prevCompleted && sorted[i].status !== 'completed') {
            sorted[i].status = 'available';
          }
        }
      }

      const sections = groupSections(sorted);

      const SECTION_BAND = 136;
      const SECTION_GAP = 82;
      let cursorY = 28;
      const allLevelPositions = [];

      sections.forEach((section) => {
        section.labelY = cursorY + 42;
        const phaseStartY = cursorY + SECTION_BAND;
        section.levelPositions = buildSectionPositions(section.phases.length, phaseStartY);
        section.levelStartIndex = allLevelPositions.length;
        allLevelPositions.push(...section.levelPositions);
        const last = section.levelPositions[section.levelPositions.length - 1];
        cursorY = (last ? last.y : phaseStartY) + SECTION_GAP;
      });

      const lastPhaseY = allLevelPositions.length ? allLevelPositions[allLevelPositions.length - 1].y : MAP_TOP;
      const calculatedHeight = Math.max(620, Math.ceil(lastPhaseY + MAP_BOTTOM));

      setMapSections(sections);
      setLevelPositions(allLevelPositions);
      setMapHeight(calculatedHeight);
    } catch (err) {
      console.warn('[useGameMap] Falha ao carregar mapa:', err);
      setError('Não foi possível carregar a trilha de jogos.');
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  // Calcula se TODAS as fases de TODAS as seções foram concluídas
  const allGamesCompleted = Boolean(
    mapSections.length > 0 &&
      mapSections.every((section) =>
        (section.phases || []).every((phase) => normalizeState(phase) === 'completed')
      )
  );

  return {
    loading,
    error,
    mapSections,
    levelPositions,
    mapHeight,
    selectedLevel,
    setSelectedLevel,
    selectedMedalSection,
    setSelectedMedalSection,
    user,
    isGuest,
    allGamesCompleted,
    reloadMap: loadMap,
  };
}

