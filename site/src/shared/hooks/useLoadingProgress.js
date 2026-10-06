import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_MESSAGES = [
  'Consultando dados públicos...',
  'Organizando indicadores do Estado...',
  'Preparando a visão cidadã...',
  'Montando gráficos e resumos...',
  'Carregando informações do balanço...',
];

export function getStatusFromPercent(percent) {
  if (percent >= 92) return 'Finalizando';
  if (percent >= 66) return 'Processando';
  if (percent >= 34) return 'Coletando dados';
  return 'Carregando';
}

/**
 * Hook para gerenciar e receber status de porcentagem (%) real de carregamento.
 *
 * @param {Object} options
 * @param {number} [options.initialProgress=0] - Porcentagem inicial (0-100)
 * @param {number} [options.baseEta=8] - Tempo estimado inicial em segundos
 * @param {string[]} [options.messages] - Lista de mensagens contextuais
 */
export function useLoadingProgress(options = {}) {
  const {
    initialProgress = 0,
    baseEta = 8,
    messages = DEFAULT_MESSAGES,
  } = options;

  const [progress, setProgressState] = useState(initialProgress);
  const [message, setMessage] = useState(messages[0]);
  const [eta, setEta] = useState(baseEta);
  const startTimeRef = useRef(Date.now());
  const activeRef = useRef(true);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const setProgress = useCallback(
    (value, customMessage) => {
      if (!activeRef.current) return;
      const clamped = Math.max(0, Math.min(100, Math.round(value)));
      setProgressState(clamped);

      const currentMessages = messagesRef.current || DEFAULT_MESSAGES;

      // Atualiza mensagem se fornecida ou cicla pelas padrão com base na %
      if (customMessage) {
        setMessage(customMessage);
      } else {
        const msgIndex = Math.min(
          currentMessages.length - 1,
          Math.floor((clamped / 100) * currentMessages.length)
        );
        setMessage(currentMessages[msgIndex]);
      }

      // Calcula tempo restante estimado com base no ritmo real
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      if (clamped > 0 && clamped < 100) {
        const totalEstimated = (elapsedSec / clamped) * 100;
        const remaining = Math.max(1, Math.ceil(totalEstimated - elapsedSec));
        setEta(remaining);
      } else if (clamped >= 100) {
        setEta(0);
      }
    },
    []
  );

  /**
   * Monitora o carregamento real de uma lista de imagens através de `new Image()`.
   * Atualiza a porcentagem de 0% a 100% proporcionalmente a cada recurso concluído.
   *
   * @param {string[]} urls - Lista de URLs de imagens a carregar
   * @returns {Promise<void>}
   */
  const preloadImages = useCallback(
    async (urls) => {
      if (!Array.isArray(urls) || urls.length === 0) {
        setProgress(100);
        return;
      }

      const total = urls.length;
      let loadedCount = 0;

      const promises = urls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          const onFinish = () => {
            loadedCount += 1;
            const currentPercent = Math.round((loadedCount / total) * 100);
            setProgress(currentPercent);
            resolve();
          };
          img.onload = onFinish;
          img.onerror = onFinish;
          img.src = url;
        });
      });

      await Promise.all(promises);
    },
    [setProgress]
  );

  const finishLoading = useCallback(() => {
    setProgress(100);
  }, [setProgress]);

  return {
    progress,
    message,
    status: getStatusFromPercent(progress),
    eta,
    isComplete: progress >= 100,
    setProgress,
    setMessage,
    preloadImages,
    finishLoading,
  };
}

