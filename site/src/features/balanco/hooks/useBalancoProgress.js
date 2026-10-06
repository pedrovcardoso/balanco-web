import { useCallback, useEffect, useRef, useState } from 'react';
import { TRAILS_BY_KEY, TRAIL_KEYS } from '../../../shared/constants/trails.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { completeTrail, getReadingProgress, saveReadingProgress } from '../services/balancoService.js';

const TRAIL = TRAILS_BY_KEY[TRAIL_KEYS.BALANCO];
const READER_SLUG = TRAIL.readerSlug || 'balanco-2025';

export function useBalancoProgress(totalSections) {
  const { user, isGuest } = useAuth();
  const [restoring, setRestoring] = useState(false);
  const [initialSection, setInitialSection] = useState(1);
  const [savedSection, setSavedSection] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const lastSavedRef = useRef(0);
  const pendingRef = useRef(null);
  const startedRef = useRef(Date.now());

  useEffect(() => {
    let active = true;
    if (!user || isGuest || !totalSections) {
      setClaimed(false);
      setReadCompleted(false);
      setSavedSection(1);
      return undefined;
    }
    setRestoring(true);
    getReadingProgress(TRAIL.slug, totalSections)
      .then((result) => {
        if (!active) return;
        const value = Math.max(1, Math.min(totalSections, Number(result?.lastPageNumber) || 1));
        lastSavedRef.current = value;
        setSavedSection(value);
        setClaimed(Boolean(result?.isCompleted));
        setReadCompleted(Boolean(result?.isCompleted) || value >= totalSections);
        if (!result?.isCompleted) {
          setInitialSection(value);
        }
      })
      .catch((error) => console.error('[Balanço] Falha ao restaurar progresso:', error))
      .finally(() => active && setRestoring(false));
    return () => {
      active = false;
    };
  }, [user, isGuest, totalSections]);

  const saveSection = useCallback(
    async (sectionNumber) => {
      if (!totalSections) return;
      const value = Math.max(1, Math.min(totalSections, Number(sectionNumber) || 1));

      if (value >= totalSections) {
        setReadCompleted(true);
      }

      setSavedSection((prev) => Math.max(prev, value));

      if (!user || isGuest) return;
      if (lastSavedRef.current >= value) return;

      const payload = {
        trailSlug: TRAIL.slug,
        readerSlug: READER_SLUG,
        title: TRAIL.title,
        pageNumber: value,
        totalPages: totalSections,
        readSeconds: Math.round((Date.now() - startedRef.current) / 1000),
        completed: value >= totalSections,
      };
      try {
        pendingRef.current = saveReadingProgress(payload);
        await pendingRef.current;
        lastSavedRef.current = value;
        setSavedSection(value);
      } catch (error) {
        console.error('[Balanço] Falha ao salvar progresso:', error);
      } finally {
        pendingRef.current = null;
      }
    },
    [user, isGuest, totalSections]
  );

  const claimMedal = useCallback(async () => {
    if (claimed) return { success: true };
    if (!user || isGuest) {
      window.dispatchEvent(new CustomEvent('bc:open-login'));
      return { requiresLogin: true };
    }
    setClaiming(true);
    try {
      if (pendingRef.current) await pendingRef.current.catch(() => undefined);
      await saveReadingProgress({
        trailSlug: TRAIL.slug,
        readerSlug: READER_SLUG,
        title: TRAIL.title,
        pageNumber: totalSections,
        totalPages: totalSections,
        readSeconds: Math.round((Date.now() - startedRef.current) / 1000),
        completed: true,
      });
      await completeTrail(TRAIL.slug);
      setClaimed(true);
      setReadCompleted(true);
      lastSavedRef.current = totalSections;
      setSavedSection(totalSections);
      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: { slug: TRAIL.slug, status: 'completed', progressPercent: 100 },
        })
      );
      return { success: true };
    } catch (error) {
      console.error('[Balanço] Erro ao resgatar medalha:', error);
      throw error;
    } finally {
      setClaiming(false);
    }
  }, [claimed, user, isGuest, totalSections]);

  const finishReading = useCallback(async () => {
    if (!user || isGuest) {
      window.dispatchEvent(new CustomEvent('bc:open-login'));
      return false;
    }
    try {
      if (pendingRef.current) await pendingRef.current.catch(() => undefined);
      await saveReadingProgress({
        trailSlug: TRAIL.slug,
        readerSlug: READER_SLUG,
        title: TRAIL.title,
        pageNumber: totalSections,
        totalPages: totalSections,
        readSeconds: Math.round((Date.now() - startedRef.current) / 1000),
        completed: true,
      });
      await completeTrail(TRAIL.slug);
      setClaimed(true);
      setReadCompleted(true);
      lastSavedRef.current = totalSections;
      setSavedSection(totalSections);
      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: { slug: TRAIL.slug, status: 'completed', progressPercent: 100 },
        })
      );
      return true;
    } catch (error) {
      console.error('[Balanço] Falha ao concluir leitura:', error);
      throw error;
    }
  }, [user, isGuest, totalSections]);

  return {
    restoring,
    initialSection,
    savedSection,
    saveSection,
    finishReading,
    claimed,
    readCompleted,
    claiming,
    claimMedal,
  };
}
