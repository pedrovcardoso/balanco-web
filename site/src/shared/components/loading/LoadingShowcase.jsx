import { useEffect, useState } from 'react';
import { LOADING_ANIMATIONS, ANIMATION_KEYS } from './animations/index.js';
import Loading from './Loading.jsx';
import { DEFAULT_MESSAGES } from '../../hooks/useLoadingProgress.js';

export default function LoadingShowcase() {
  // Estado de progresso independente para cada um dos 7 cards na vitrine
  const [cardsProgress, setCardsProgress] = useState(() =>
    ANIMATION_KEYS.map((key, idx) => ({
      key,
      progress: Math.min(idx * 12, 35),
      messageIndex: idx % DEFAULT_MESSAGES.length,
    }))
  );

  useEffect(() => {
    const intervals = cardsProgress.map((item, idx) => {
      return setInterval(() => {
        setCardsProgress((prev) => {
          const next = [...prev];
          const current = next[idx];
          let updated =
            current.progress + (1.6 + Math.random() * 3.2) * (current.progress > 78 ? 0.58 : 1);
          let nextMsgIdx = current.messageIndex;

          if (updated >= 100) {
            updated = 0;
            nextMsgIdx = (nextMsgIdx + 1) % DEFAULT_MESSAGES.length;
          }

          next[idx] = {
            ...current,
            progress: updated,
            messageIndex: nextMsgIdx,
          };
          return next;
        });
      }, 620 + idx * 90);
    });

    return () => {
      intervals.forEach((id) => clearInterval(id));
    };
  }, []);

  return (
    <section
      className="loading-showcase-container"
      aria-label="Opções de carregamento temáticas de Minas Gerais"
    >
      <header className="loading-showcase-header">
        <h2>Opções de Animação de Carregamento</h2>
        <p>Temas culturais e históricos de Minas Gerais para o Balanço Cidadão</p>
      </header>

      <div className="loading-showcase-grid">
        {cardsProgress.map(({ key, progress, messageIndex }) => {
          return (
            <Loading
              key={key}
              animation={key}
              progress={progress}
              message={DEFAULT_MESSAGES[messageIndex]}
              fullScreen={false}
            />
          );
        })}
      </div>
    </section>
  );
}

