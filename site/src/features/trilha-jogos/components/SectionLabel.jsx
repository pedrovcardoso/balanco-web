import { Icon } from '@iconify/react';
import { getSectionMedalState } from '../hooks/useGameMap.js';

function getSectionMedalLabel(state) {
  if (state === 'shiny') return 'Medalha brilhante: todas as fases concluídas com três estrelas';
  if (state === 'unlocked') return 'Medalha liberada: todas as fases da seção foram concluídas';
  return 'Medalha bloqueada: conclua todas as fases da seção';
}

export default function SectionLabel({ section, sectionIndex, mapHeight, onOpenMedal }) {
  const medalState = getSectionMedalState(section);
  const medalLabel = getSectionMedalLabel(medalState);
  const topPercent = (section.labelY / mapHeight) * 100;

  return (
    <div
      className="section-label"
      data-section-number={sectionIndex + 1}
      style={{
        left: '50%',
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%)',
        background: section.color,
      }}
    >
      <div className="section-label-copy">
        <small>Início de nova seção</small>
        <strong>{section.title}</strong>
      </div>
      <button
        className={`section-medal ${medalState}`}
        type="button"
        aria-label={`${medalLabel}. Abrir detalhes`}
        title={medalLabel}
        onClick={() => onOpenMedal(sectionIndex)}
      >
        <span className="section-medal-core">
          <Icon
            icon={`fa6-solid:${
              medalState === 'locked' ? 'lock' : medalState === 'shiny' ? 'star' : 'medal'
            }`}
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
  );
}
