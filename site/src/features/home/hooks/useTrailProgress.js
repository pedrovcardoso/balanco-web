import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../../../shared/hooks/useAuth.js';
import { MAIN_TRAILS } from '../../../shared/constants/trails.js';
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
      const redemptions = await getMainTrailProgress();
      const redemptionMap = new Map(
        (Array.isArray(redemptions) ? redemptions : []).map((r) => [r.itemKey, r])
      );

      const mappedItems = MAIN_TRAILS.map((trail) => {
        if (!trail.itemKey) {
          return {
            slug: trail.slug,
            status: 'available',
            progressPercent: 0,
          };
        }

        const info = redemptionMap.get(trail.itemKey);
        const isRedeemed = Boolean(info && info.redeemed);

        return {
          slug: trail.slug,
          itemKey: trail.itemKey,
          status: isRedeemed ? 'completed' : 'available',
          progressPercent: isRedeemed ? 100 : 0,
          redeemedAt: info?.redeemedAt || null,
        };
      });

      setItems(mappedItems);
      setStatus('success');
    } catch (error) {
      console.error(
        '[Home] Falha ao carregar progresso da trilha:',
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
    window.addEventListener(
      'bc:auth-changed',
      handleProgressChanged,
    );

    return () => {
      window.removeEventListener(
        'bc:trail-progress-changed',
        handleProgressChanged,
      );
      window.removeEventListener(
        'bc:auth-changed',
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