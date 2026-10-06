import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap.js';
import { getEngineIcon } from '../hooks/useGameMap.js';

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

export default function LevelModal({ selected, onClose }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  useFocusTrap(modalRef, !!selected);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selected) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, onClose]);

  if (!selected) return null;

  const { section, row, state } = selected;
  const stars = Number(row.bestStars || 0);
  const isLocked = state === 'locked';

  const handleStart = () => {
    if (isLocked) return;
    const phaseId = row.publicPhaseId || row.gamePhaseId;
    navigate(`/jogos/${phaseId}`);
  };

  return (
    <div
      id="levelModal"
      ref={modalRef}
      className="modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target.id === 'levelModal') onClose();
      }}
    >
      <div className="modal-card">
        <div className="p-5 text-center">
          <div
            id="modalIcon"
            className="modal-icon"
            style={{ background: section.color }}
          >
            <Icon
              icon={`fa6-solid:${isLocked ? 'lock' : getEngineIcon(row.engineSlug)}`}
              aria-hidden="true"
            />
          </div>

          <p
            id="modalSession"
            className="mt-4 text-xs font-black uppercase tracking-[.18em] text-mgWine"
          >
            {section.title}
          </p>

          <h2
            id="modalTitle"
            className="mt-1 font-display text-3xl font-black text-mgGreen"
          >
            {row.phaseTitle || row.engineTitle || 'Jogo'}
          </h2>

          <div
            id="modalStars"
            className="mt-4 flex justify-center gap-2 text-3xl text-mgGold"
          >
            {renderStars(stars)}
          </div>

          <p id="modalState" className="mt-3 text-sm font-black uppercase text-[#7a4b13]">
            {isLocked
              ? 'Fase bloqueada · conclua a fase anterior com 60 pontos ou mais'
              : state === 'available'
                ? `Fase disponível · ${row.engineTitle || row.engineSlug || 'Jogo'}`
                : `${stars} estrela${stars > 1 ? 's' : ''} · melhor pontuação ${row.bestScore || 0}`}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              id="startLevel"
              className="start-btn"
              type="button"
              disabled={isLocked}
              onClick={handleStart}
            >
              Iniciar
            </button>
            <button
              id="closeModal"
              className="close-btn"
              type="button"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
