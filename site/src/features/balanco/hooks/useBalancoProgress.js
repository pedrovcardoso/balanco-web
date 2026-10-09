import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { ALLOWED_ITEM_KEYS, getReadingProgress, redeemTrailItem, TRAIL_ITEM_KEYS } from '../services/balancoService.js';

export function useBalancoProgress(totalSections) {
  const { user, isGuest } = useAuth();
  const [restoring, setRestoring] = useState(false);
  const [initialSection] = useState(1);
  const [savedSection, setSavedSection] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [redeemedBooks, setRedeemedBooks] = useState({
    LIVRO_1: false,
    LIVRO_2: false,
    LIVRO_3: false,
  });

  const lastSavedRef = useRef(0);

  useEffect(() => {
    let active = true;
    if (!user || isGuest || !totalSections) {
      setClaimed(false);
      setReadCompleted(false);
      setSavedSection(1);
      setRedeemedBooks({ LIVRO_1: false, LIVRO_2: false, LIVRO_3: false });
      return undefined;
    }
    setRestoring(true);
    getReadingProgress(TRAIL_ITEM_KEYS.LIVRO_1)
      .then((result) => {
        if (!active) return;
        const map = result?.redeemedMap || {};
        const isL1 = Boolean(map.LIVRO_1);
        const isL2 = Boolean(map.LIVRO_2);
        const isL3 = Boolean(map.LIVRO_3);

        setRedeemedBooks({
          LIVRO_1: isL1,
          LIVRO_2: isL2,
          LIVRO_3: isL3,
        });

        let restoredSection = 1;
        if (isL3) restoredSection = 21;
        else if (isL2) restoredSection = 18;
        else if (isL1) restoredSection = 5;

        setSavedSection((prev) => Math.max(prev, restoredSection));

        if (isL1 && isL2 && isL3) {
          setReadCompleted(true);
          setClaimed(true);
        }
      })
      .catch((error) => console.error('[Balanço] Falha ao restaurar progresso:', error))
      .finally(() => active && setRestoring(false));
    return () => {
      active = false;
    };
  }, [user, isGuest, totalSections]);

  const saveSection = useCallback(
    (sectionNumber) => {
      if (!totalSections) return;
      const value = Math.max(1, Math.min(totalSections, Number(sectionNumber) || 1));

      if (value >= totalSections) {
        setReadCompleted(true);
      }

      setSavedSection((prev) => Math.max(prev, value));
      lastSavedRef.current = value;
    },
    [totalSections]
  );

  const concludeBook = useCallback(
    async (itemKey) => {
      if (!ALLOWED_ITEM_KEYS.includes(itemKey)) return;
      setRedeemedBooks((prev) => ({ ...prev, [itemKey]: true }));

      if (user && !isGuest) {
        try {
          await redeemTrailItem(itemKey);
          window.dispatchEvent(
            new CustomEvent('bc:trail-progress-changed', {
              detail: { itemKey, status: 'completed', progressPercent: 100 },
            })
          );
        } catch (error) {
          if (error?.status === 401) {
            window.dispatchEvent(new CustomEvent('bc:open-login'));
          } else {
            console.error(`[Balanço] Falha ao salvar ${itemKey} no banco:`, error);
          }
        }
      }
    },
    [user, isGuest]
  );

  const claimMedal = useCallback(async () => {
    if (claimed) return { success: true };

    const allThreeRead = Boolean(redeemedBooks?.LIVRO_1 && redeemedBooks?.LIVRO_2 && redeemedBooks?.LIVRO_3);
    if (!allThreeRead) {
      return { success: false, reason: 'Conclua a leitura dos 3 cadernos para resgatar a medalha.' };
    }

    if (!user || isGuest) {
      window.dispatchEvent(new CustomEvent('bc:open-login'));
      return { requiresLogin: true };
    }

    setClaiming(true);
    try {
      setClaimed(true);
      setReadCompleted(true);
      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: { itemKey: TRAIL_ITEM_KEYS.LIVRO_3, status: 'completed', progressPercent: 100 },
        })
      );
      return { success: true };
    } catch (error) {
      if (error?.status === 401) {
        window.dispatchEvent(new CustomEvent('bc:open-login'));
        return { requiresLogin: true };
      }
      console.error('[Balanço] Erro ao resgatar medalha:', error);
      throw error;
    } finally {
      setClaiming(false);
    }
  }, [claimed, user, isGuest, redeemedBooks]);

  const finishReading = useCallback(async () => {
    setReadCompleted(true);
    if (!user || isGuest) {
      return false;
    }
    if (!claimed) {
      await claimMedal();
    }
    return true;
  }, [user, isGuest, claimed, claimMedal]);

  return {
    restoring,
    initialSection,
    savedSection,
    saveSection,
    concludeBook,
    redeemedBooks,
    finishReading,
    claimed,
    readCompleted,
    claiming,
    claimMedal,
  };
}



