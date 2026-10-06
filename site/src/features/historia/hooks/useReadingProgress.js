import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  TRAILS_BY_KEY,
  TRAIL_KEYS,
} from '../../../shared/constants/trails.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';

import {
  completeTrail,
  getReadingProgress,
  saveReadingProgress,
} from '../services/historiaService.js';

const HISTORY_TRAIL =
  TRAILS_BY_KEY[TRAIL_KEYS.HISTORIA];

export function useReadingProgress(totalPages) {
  const { user, isGuest } = useAuth();

  const [initialPage, setInitialPage] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const lastSavedPageRef = useRef(0);
  const pendingSaveRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function restoreProgress() {
      if (!user || isGuest || !totalPages) {
        setClaimed(false);
        setReadCompleted(false);
        return;
      }

      setRestoring(true);

      try {
        const result = await getReadingProgress(
          HISTORY_TRAIL.slug,
          totalPages,
        );

        const lastPage = Math.max(
          1,
          Math.min(
            totalPages,
            Number(result?.lastPageNumber) || 1,
          ),
        );

        lastSavedPageRef.current = lastPage;

        if (active) {
          setClaimed(Boolean(result?.isCompleted));
          setReadCompleted(Boolean(result?.isCompleted) || lastPage >= totalPages);

          if (!result?.isCompleted) {
            setInitialPage(lastPage - 1);
          }
        }
      } catch (error) {
        console.error(
          '[História] Falha ao restaurar progresso:',
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
  }, [user, isGuest, totalPages]);

  const savePage = useCallback(
    async (pageNumber) => {
      if (!totalPages) return;

      const normalizedPage = Math.max(
        1,
        Math.min(
          totalPages,
          Number(pageNumber) || 1,
        ),
      );

      if (normalizedPage >= totalPages) {
        setReadCompleted(true);
      }

      if (!user || isGuest) return;

      if (
        lastSavedPageRef.current === normalizedPage
      ) {
        return;
      }

      const payload = {
        trailSlug: HISTORY_TRAIL.slug,
        readerSlug: HISTORY_TRAIL.readerSlug,
        title: 'História do Balanço',
        pageNumber: normalizedPage,
        totalPages,
        readSeconds: 0,
        completed: false,
      };

      try {
        pendingSaveRef.current =
          saveReadingProgress(payload);

        await pendingSaveRef.current;

        lastSavedPageRef.current = normalizedPage;
      } catch (error) {
        console.error(
          '[História] Falha ao salvar progresso:',
          error,
        );
      } finally {
        pendingSaveRef.current = null;
      }
    },
    [user, isGuest, totalPages],
  );

  const claimMedal = useCallback(async () => {
    if (claimed || !readCompleted) return;

    if (!user || isGuest) {
      window.dispatchEvent(
        new CustomEvent('bc:open-login'),
      );
      return { requiresLogin: true };
    }

    setClaiming(true);

    const payload = {
      trailSlug: HISTORY_TRAIL.slug,
      readerSlug: HISTORY_TRAIL.readerSlug,
      title: 'História do Balanço',
      pageNumber: totalPages,
      totalPages,
      readSeconds: 0,
      completed: true,
    };

    try {
      await saveReadingProgress(payload);
      await completeTrail(HISTORY_TRAIL.slug);

      setClaimed(true);
      lastSavedPageRef.current = totalPages;

      window.dispatchEvent(
        new CustomEvent(
          'bc:trail-progress-changed',
          {
            detail: {
              slug: HISTORY_TRAIL.slug,
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
  }, [claimed, readCompleted, user, isGuest, totalPages]);

  const finishReading = useCallback(async () => {
    if (!user || isGuest) {
      window.dispatchEvent(
        new CustomEvent('bc:open-login'),
      );

      return {
        requiresLogin: true,
      };
    }

    if (pendingSaveRef.current) {
      try {
        await pendingSaveRef.current;
      } catch {
        // A conclusão fará uma nova gravação completa.
      }
    }

    const payload = {
      trailSlug: HISTORY_TRAIL.slug,
      readerSlug: HISTORY_TRAIL.readerSlug,
      title: 'História do Balanço',
      pageNumber: totalPages,
      totalPages,
      readSeconds: 0,
      completed: true,
    };

    try {
      await saveReadingProgress(payload);
      await completeTrail(HISTORY_TRAIL.slug);

      setClaimed(true);
      lastSavedPageRef.current = totalPages;

      window.dispatchEvent(
        new CustomEvent(
          'bc:trail-progress-changed',
          {
            detail: {
              slug: HISTORY_TRAIL.slug,
              status: 'completed',
              progressPercent: 100,
            },
          },
        ),
      );

      return {
        saved: true,
      };
    } catch (error) {
      console.error(
        '[História] Falha ao concluir leitura:',
        error,
      );

      throw error;
    }
  }, [user, isGuest, totalPages]);

  return {
    initialPage,
    restoring,
    claimed,
    readCompleted,
    savePage,
    finishReading,
  };
}