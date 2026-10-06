import { useCallback, useEffect, useRef, useState } from 'react';
import { TRAILS_BY_KEY, TRAIL_KEYS } from '../../../shared/constants/trails.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { completeTrail, getTrailProgress } from '../services/saibaMaisService.js';

const CREDITOS_TRAIL = TRAILS_BY_KEY[TRAIL_KEYS.CREDITOS];
const STORAGE_KEY = `bc_trail_completed_${CREDITOS_TRAIL.slug}`;

export function useSaibaMaisProgress() {
  const { user, isGuest } = useAuth();
  const [reachedEnd, setReachedEnd] = useState(true);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!user || isGuest) {
      setClaimed(false);
      setFetchingStatus(false);
      return false;
    }

    setFetchingStatus(true);
    try {
      const rows = await getTrailProgress();
      const trailData = (rows || []).find((r) => r.slug === CREDITOS_TRAIL.slug);

      const isCompleted =
        String(trailData?.status || '').toLowerCase() === 'completed' ||
        Number(trailData?.progressPercent) >= 100;

      setClaimed(isCompleted);
      if (isCompleted) {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return isCompleted;
    } catch (error) {
      console.warn('[Saiba Mais] Falha ao consultar conquista no banco:', error);
      return false;
    } finally {
      setFetchingStatus(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const claimMedal = useCallback(async () => {
    if (claimed || !reachedEnd) return;

    if (!user || isGuest) {
      window.dispatchEvent(new CustomEvent('bc:open-login'));
      return { requiresLogin: true };
    }

    setLoading(true);

    try {
      await completeTrail(CREDITOS_TRAIL.slug);
      setClaimed(true);
      sessionStorage.setItem(STORAGE_KEY, '1');

      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: {
            slug: CREDITOS_TRAIL.slug,
            status: 'completed',
            progressPercent: 100,
          },
        })
      );

      return { success: true };
    } catch (error) {
      console.error('[Saiba Mais] Erro ao resgatar medalha:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [claimed, reachedEnd, user, isGuest]);

  const markReachedEnd = useCallback(() => {
    setReachedEnd(true);
  }, []);

  return {
    reachedEnd,
    claimed,
    loading,
    fetchingStatus,
    checkStatus,
    markReachedEnd,
    claimMedal,
  };
}

