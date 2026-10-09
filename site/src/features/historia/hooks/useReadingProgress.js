import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAuth } from '../../../shared/hooks/useAuth.js';

import {
  getReadingProgress,
  redeemTrailItem,
} from '../services/historiaService.js';

export function useReadingProgress(totalPages) {
  const { user, isGuest } = useAuth();

  const [initialPage, setInitialPage] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const lastSavedPageRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function restoreProgress() {
      if (!user || isGuest) {
        setClaimed(false);
        setReadCompleted(false);
        return;
      }

      setRestoring(true);

      try {
        const result = await getReadingProgress();
        if (active) {
          setClaimed(Boolean(result?.isCompleted));
          if (result?.isCompleted) {
            setReadCompleted(true);
          }
        }
      } catch (error) {
        console.error(
          '[História] Falha ao carregar progresso:',
          error,
        );
      } finally {
        if (active) {
          setRestoring(false);
        }
      }
    }

    restoreProgress();

    return () => {
      active = false;
    };
  }, [user, isGuest]);

  const savePage = useCallback(
    (pageNumber) => {
      if (!totalPages) return;

      const normalizedPage = Math.max(
        1,
        Math.min(
          totalPages,
          Number(pageNumber) || 1,
        ),
      );

      lastSavedPageRef.current = normalizedPage;

      if (normalizedPage >= totalPages) {
        setReadCompleted(true);
      }
    },
    [totalPages],
  );

  const claimMedal = useCallback(async () => {
    if (claimed) return { success: true };

    if (!user || isGuest) {
      window.dispatchEvent(
        new CustomEvent('bc:open-login'),
      );
      return { requiresLogin: true };
    }

    setClaiming(true);

    try {
      await redeemTrailItem('HISTORIA_HQ');

      setClaimed(true);
      setReadCompleted(true);

      window.dispatchEvent(
        new CustomEvent(
          'bc:trail-progress-changed',
          {
            detail: {
              itemKey: 'HISTORIA_HQ',
              status: 'completed',
              progressPercent: 100,
            },
          },
        ),
      );

      return { success: true };
    } catch (error) {
      console.error('[História] Erro ao resgatar medalha:', error);
      throw error;
    } finally {
      setClaiming(false);
    }
  }, [claimed, user, isGuest]);

  const finishReading = useCallback(async () => {
    setReadCompleted(true);

    if (!user || isGuest) {
      return { requiresLogin: false };
    }

    if (!claimed) {
      return claimMedal();
    }

    return { saved: true };
  }, [user, isGuest, claimed, claimMedal]);

  return {
    initialPage,
    restoring,
    claimed,
    readCompleted,
    claiming,
    savePage,
    finishReading,
    claimMedal,
  };
}