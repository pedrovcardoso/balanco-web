import { useCallback, useEffect, useState } from 'react';
import api from '../../../lib/api.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';

export function useTrailProgress() {
  const { user, isGuest } = useAuth();
  const isLoggedIn = user && !isGuest;

  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreProgress() {
      if (!isLoggedIn) {
        setClaimed(false);
        setRestoring(false);
        return;
      }

      setRestoring(true);
      try {
        const { data } = await api.get('/trails/progress');
        const items = Array.isArray(data) ? data : [];
        const dadosItem = items.find((i) => i.itemKey === 'BALANCO_DADOS');
        if (active) {
          setClaimed(Boolean(dadosItem && dadosItem.redeemed));
        }
      } catch (err) {
        console.warn('[BalancoNaPratica] Falha ao restaurar progresso:', err);
      } finally {
        if (active) setRestoring(false);
      }
    }

    restoreProgress();
    return () => { active = false; };
  }, [isLoggedIn]);

  const claimMedal = useCallback(async () => {
    if (claimed) return { success: true };

    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('bc:open-login'));
      return { requiresLogin: true };
    }

    setClaiming(true);
    try {
      await api.post('/trails/redeem', { itemKey: 'BALANCO_DADOS' });
      setClaimed(true);

      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: { itemKey: 'BALANCO_DADOS', status: 'completed', progressPercent: 100 },
        }),
      );

      return { success: true };
    } catch (err) {
      console.error('[BalancoNaPratica] Erro ao resgatar medalha:', err);
      throw err;
    } finally {
      setClaiming(false);
    }
  }, [claimed, isLoggedIn]);

  return { claimed, claiming, restoring, claimMedal };
}

