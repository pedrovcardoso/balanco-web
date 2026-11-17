import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { getTrailProgress, redeemTrailItem } from '../services/saibaMaisService.js';

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
      const itemData = (rows || []).find((r) => r.itemKey === 'SAIBA_MAIS');

      const isCompleted = Boolean(itemData && itemData.redeemed);

      setClaimed(isCompleted);
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
      await redeemTrailItem('SAIBA_MAIS');
      setClaimed(true);

      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: {
            itemKey: 'SAIBA_MAIS',
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


