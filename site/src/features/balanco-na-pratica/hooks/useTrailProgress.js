import { useCallback, useEffect, useState } from 'react';
import api from '../../../lib/api.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';

export function useTrailProgress() {
  const { user, isGuest } = useAuth();
  const isLoggedIn = user && !isGuest;

  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState('');
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const userId = user?.userId || user?.publicUserId;

  useEffect(() => {
    let active = true;

    async function restoreProgress() {
      if (!isLoggedIn) {
        setClaimed(false);
        setRestoreError('');
        setLoadedUserId(null);
        setRestoring(false);
        return;
      }

      setRestoring(true);
      setRestoreError('');
      try {
        const { data } = await api.get('/trails/progress');
        if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar o progresso.');
        const dadosItem = data.find((i) => i.itemKey === 'BALANCO_DADOS');
        if (!dadosItem || typeof dadosItem.redeemed !== 'boolean') {
          throw new Error('Progresso do Balanço na Prática indisponível.');
        }
        if (active) {
          setClaimed(dadosItem.redeemed);
          setLoadedUserId(userId);
        }
      } catch (err) {
        console.warn('[BalancoNaPratica] Falha ao restaurar progresso:', err);
        if (active) {
          setRestoreError('Não foi possível consultar o progresso da trilha.');
          setLoadedUserId(userId);
        }
      } finally {
        if (active) setRestoring(false);
      }
    }

    restoreProgress();
    return () => { active = false; };
  }, [isLoggedIn, userId, restoreAttempt]);

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

  return {
    claimed: Boolean(isLoggedIn && loadedUserId === userId && claimed),
    claiming,
    restoring: restoring || Boolean(isLoggedIn && loadedUserId !== userId),
    restoreError,
    claimMedal,
    retryRestore: () => setRestoreAttempt((attempt) => attempt + 1),
  };
}

