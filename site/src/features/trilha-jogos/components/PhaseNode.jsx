import { Icon } from '@iconify/react';
import { MAP_WIDTH, getEngineIcon, normalizeState } from '../hooks/useGameMap.js';

function renderStars(count) {
  const safe = Number(count || 0);
  return [0, 1, 2].map((i) => (
    <Icon
      key={i}
      icon={i < safe ? 'fa6-solid:star' : 'fa6-regular:star'}
      aria-hidden="true"
    />
  ));
}

export default function PhaseNode({
  row,
  sectionColor,
  sectionIndex,
  phaseIndex,
  globalIndex,
  position,
  mapHeight,
  onSelect,
}) {
  const pos = {
    x: Math.max(72, Math.min(MAP_WIDTH - 72, position.x)),
    y: position.y,
  };
  const state = normalizeState(row);
  const visualState = state === 'completed' ? 'done' : state;
  const stars = Number(row.bestStars || 0);
  const label = state === 'locked' ? 'bloqueada' : state === 'available' ? 'disponível' : 'concluída';
  const icon = getEngineIcon(row.engineSlug);

  const leftPercent = (pos.x / MAP_WIDTH) * 100;
  const topPercent = (pos.y / mapHeight) * 100;

  return (
    <button
      className={`level ${visualState}`}
      type="button"
      style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
      aria-label={`Fase ${globalIndex + 1}, ${row.phaseTitle || row.engineTitle || 'Jogo'}, ${label}`}
      onClick={() => onSelect(sectionIndex, phaseIndex)}
    >
      <div className="level-orb" style={{ background: sectionColor }}>
        <span className="level-number" aria-hidden="true">
          {globalIndex + 1}
        </span>
        <Icon icon={`fa6-solid:${icon}`} aria-hidden="true" />
        {state === 'locked' && (
          <span className="level-lock-overlay" aria-hidden="true">
            <Icon icon="fa6-solid:lock" />
          </span>
        )}
        {visualState === 'done' && (
          <span className="level-done-badge" aria-hidden="true">
            <Icon icon="fa6-solid:check" />
          </span>
        )}
      </div>
      <div className="level-stars" aria-label={`${stars} estrelas`}>
        {renderStars(stars)}
      </div>
    </button>
  );
}
