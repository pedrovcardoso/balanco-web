import { useCallback, useEffect, useState } from 'react';
import { TRAILS_BY_KEY, TRAIL_KEYS } from '../../../shared/constants/trails.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { completeTrail, getReadingProgress } from '../../historia/services/historiaService.js';

const DADOS_TRAIL = TRAILS_BY_KEY[TRAIL_KEYS.DADOS];

/**
 * Gerencia o progresso e o resgate da medalha da trilha "Balanço na Prática".
 * Consulta o banco ao montar para restaurar o estado e salva via API ao resgatar.
 */
export function useTrailProgress() {
  const { user, isGuest } = useAuth();
  const isLoggedIn = user && !isGuest;

  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [restoring, setRestoring] = useState(true);

  // Restaura estado do banco ao montar / ao autenticar
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
        const result = await getReadingProgress(DADOS_TRAIL.slug, 1);
        if (active) {
          setClaimed(Boolean(result?.isCompleted));
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
      await completeTrail(DADOS_TRAIL.slug);
      setClaimed(true);

      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: { slug: DADOS_TRAIL.slug, status: 'completed', progressPercent: 100 },
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
