import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '../../../shared/hooks/useAuth.js';
import { MAIN_TRAILS } from '../../../shared/constants/trails.js';
import { getMainTrailProgress } from '../services/homeService.js';

export function useTrailProgress() {
  const { user, isGuest } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');
  const [loadedUserId, setLoadedUserId] = useState(null);
  const requestId = useRef(0);
  const userId = user?.userId || user?.publicUserId || null;

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!user || isGuest) {
      setItems([]);
      setStatus('guest');
      setLoadedUserId(null);
      return;
    }

    setStatus('loading');

    try {
      const redemptions = await getMainTrailProgress();
      const redemptionMap = new Map(
        redemptions.map((r) => [r.itemKey, r])
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
        if (!info || typeof info.redeemed !== 'boolean') {
          throw new Error(`Progresso indisponível para ${trail.itemKey}.`);
        }
        const isRedeemed = info.redeemed;

        return {
          slug: trail.slug,
          itemKey: trail.itemKey,
          status: isRedeemed ? 'completed' : 'available',
          progressPercent: isRedeemed ? 100 : 0,
          redeemedAt: info?.redeemedAt || null,
        };
      });

      if (currentRequest === requestId.current) {
        setItems(mappedItems);
        setStatus('success');
        setLoadedUserId(userId);
      }
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      console.error(
        '[Home] Falha ao carregar progresso da trilha:',
        error,
      );

      setItems([]);
      setStatus('error');
      setLoadedUserId(userId);
    }
  }, [user, isGuest, userId]);

  useEffect(() => {
    refresh();
    return () => { requestId.current += 1; };
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

  const isCurrentUser = Boolean(user && !isGuest && userId && userId === loadedUserId);
  const visibleStatus = !user || isGuest ? 'guest' : isCurrentUser ? status : 'loading';

  return {
    items: isCurrentUser ? items : [],
    progressBySlug: isCurrentUser ? progressBySlug : new Map(),
    status: visibleStatus,
    refresh,
  };
}