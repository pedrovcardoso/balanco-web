import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../../../shared/hooks/useAuth.js';
import { getMainTrailProgress } from '../services/homeService.js';

export function useTrailProgress() {
  const { user, isGuest } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');

  const refresh = useCallback(async () => {
    if (!user || isGuest) {
      setItems([]);
      setStatus('guest');
      return;
    }

    setStatus('loading');

    try {
      const progress = await getMainTrailProgress();

      setItems(progress);
      setStatus('success');
    } catch (error) {
      console.error(
        '[Home] Falha ao carregar progresso:',
        error,
      );

      setItems([]);
      setStatus('error');
    }
  }, [user, isGuest]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleProgressChanged = () => {
      refresh();
    };

    window.addEventListener(
      'bc:trail-progress-changed',
      handleProgressChanged,
    );

    return () => {
      window.removeEventListener(
        'bc:trail-progress-changed',
        handleProgressChanged,
      );
    };
  }, [refresh]);

  const progressBySlug = useMemo(
    () =>
      new Map(
        items.map((item) => [
          item.slug,
          item,
        ]),
      ),
    [items],
  );

  return {
    items,
    progressBySlug,
    status,
    refresh,
  };
}