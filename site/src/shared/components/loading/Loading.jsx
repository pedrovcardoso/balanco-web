import { useMemo, useState } from 'react';
import {
  LOADING_ANIMATIONS,
  getRandomAnimationKey,
} from './animations/index.js';
import { getStatusFromPercent } from '../../hooks/useLoadingProgress.js';
import './loading.css';

/**
 * Converte cor hexadecimal para rgba com opacidade customizada.
 */
function hexToRgba(hex, alpha) {
  const cleanHex = hex.replace('#', '');
  const value = parseInt(cleanHex, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

/**
 * Componente Reutilizável de Loading — Balanço Cidadão MG
 *
 * Suporta modo tela cheia (overlay) ou embutido (card), recebendo status e porcentagem (%) real.
 */
export default function Loading({
  animation = 'random',
  progress = 0,
  message,
  status,
  eta,
  fullScreen = true,
  className = '',
}) {
  // Sorteia uma única vez ao montar o componente para manter a mesma animação durante todo o carregamento (0 a 100%)
  const [randomKey] = useState(() => getRandomAnimationKey());

  const resolvedKey = useMemo(() => {
    if (!animation || animation === 'random') {
      return randomKey;
    }
    return LOADING_ANIMATIONS[animation] ? animation : randomKey;
  }, [animation, randomKey]);

  const config = LOADING_ANIMATIONS[resolvedKey];
  const AnimationComponent = config.Component;

  const roundedPercent = Math.max(0, Math.min(100, Math.round(progress)));
  const displayStatus = status || getStatusFromPercent(roundedPercent);
  const displayMessage = message || 'Carregando informações do balanço...';
  const remainingEta =
    typeof eta === 'number'
      ? eta
      : Math.max(1, Math.ceil(config.defaultEta * (1 - roundedPercent / 100)));

  const cardElement = (
    <article
      className={`loading-card ${className}`}
      style={{
        '--accent': config.accent,
        '--accent-soft': hexToRgba(config.accent, 0.18),
      }}
      role="status"
      aria-live="polite"
      aria-label={`${config.title} - Carregamento`}
    >
      {/* Palco da animação gráfica temática */}
      <div className="loading-stage" aria-hidden="true">
        <AnimationComponent />
      </div>

      {/* Rodapé com mensagem, tempo estimado e barra de progresso */}
      <footer className="loading-footer">
        <div className="loading-message">{displayMessage}</div>

        {remainingEta > 0 && (
          <div className="loading-eta">
            Tempo previsto: {remainingEta} segundo{remainingEta === 1 ? '' : 's'}
          </div>
        )}

        <div
          className="loading-progress"
          role="progressbar"
          aria-label="Progresso do carregamento"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={roundedPercent}
        >
          <div
            className="loading-progress-bar"
            style={{ width: `${roundedPercent}%` }}
          />
        </div>

        <div className="loading-progress-meta">
          <span>{roundedPercent}%</span>
          <span>{displayStatus}</span>
        </div>
      </footer>
    </article>
  );

  if (!fullScreen) {
    return cardElement;
  }

  return (
    <div className="loading-container" role="status" aria-live="polite">
      {cardElement}
    </div>
  );
}

export { Loading };


