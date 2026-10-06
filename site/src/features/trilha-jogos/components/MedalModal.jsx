import { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap.js';
import { getSectionMedalState } from '../hooks/useGameMap.js';

export default function MedalModal({ section, onClose }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, !!section);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && section) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, onClose]);

  if (!section) return null;

  const state = getSectionMedalState(section);
  const stateText =
    state === 'shiny'
      ? 'Medalha brilhante conquistada'
      : state === 'unlocked'
        ? 'Medalha liberada'
        : 'Medalha ainda bloqueada';

  return (
    <div
      id="medalModal"
      ref={modalRef}
      className="modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medalModalTitle"
      onClick={(e) => {
        if (e.target.id === 'medalModal') onClose();
      }}
    >
      <div className="modal-card medal-modal-card">
        <div className="p-5 text-center">
          <div className="medal-modal-hero">
            <div className="medal-modal-icon">
              <Icon icon="fa6-solid:medal" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-mgWine">
                Conquista da seção
              </p>
              <h2 id="medalModalTitle" className="font-display text-2xl font-black text-mgGreen">
                Medalhas da jornada
              </h2>
              <p id="medalModalSection" className="mt-1 text-sm font-extrabold text-[#6b3a1f]">
                {section.title} · {stateText}
              </p>
            </div>
          </div>

          <div className="medal-state-list">
            <div className={`medal-state-item ${state === 'locked' ? 'active' : ''}`}>
              <Icon icon="fa6-solid:lock" aria-hidden="true" />
              <div>
                <strong>Bloqueada</strong>
                <small>Conclua todas as fases da seção para liberar a medalha.</small>
              </div>
            </div>
            <div className={`medal-state-item normal ${state === 'unlocked' ? 'active' : ''}`}>
              <Icon icon="fa6-solid:medal" aria-hidden="true" />
              <div>
                <strong>Liberada</strong>
                <small>Recebida quando todas as fases da seção forem concluídas.</small>
              </div>
            </div>
            <div className={`medal-state-item shiny ${state === 'shiny' ? 'active' : ''}`}>
              <Icon icon="fa6-solid:star" aria-hidden="true" />
              <div>
                <strong>Brilhante</strong>
                <small>Conquistada quando todas as fases da seção alcançarem três estrelas.</small>
              </div>
            </div>
          </div>

          <button
            id="closeMedalModal"
            className="close-btn mt-4"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
