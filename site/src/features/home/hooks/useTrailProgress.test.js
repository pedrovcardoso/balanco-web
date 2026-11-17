import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { MAIN_TRAILS } from '../../../shared/constants/trails.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { getMainTrailProgress } from '../services/homeService.js';
import { useTrailProgress } from './useTrailProgress.js';

vi.mock('../../../shared/hooks/useAuth.js', () => ({ useAuth: vi.fn() }));
vi.mock('../services/homeService.js', () => ({ getMainTrailProgress: vi.fn() }));

function progress(redeemed) {
  return MAIN_TRAILS.map((trail) => ({
    itemKey: trail.itemKey,
    redeemed: trail.itemKey === 'BALANCO_DADOS' && redeemed,
  }));
}

beforeEach(() => {
  vi.resetAllMocks();
  useAuth.mockReturnValue({ user: { userId: '1' }, isGuest: false });
});

test('ignores a stale response after a newer progress refresh', async () => {
  let resolveOld;
  const oldRequest = new Promise((resolve) => { resolveOld = resolve; });
  getMainTrailProgress.mockReturnValueOnce(oldRequest).mockResolvedValueOnce(progress(true));
  const { result } = renderHook(() => useTrailProgress());

  await act(async () => { window.dispatchEvent(new Event('bc:trail-progress-changed')); });
  await waitFor(() => expect(result.current.status).toBe('success'));
  await act(async () => { resolveOld(progress(false)); await oldRequest; });
  expect(result.current.progressBySlug.get('balanco-na-pratica').status).toBe('completed');
});

test('reports an incomplete API response as an error instead of pending', async () => {
  getMainTrailProgress.mockResolvedValue([]);
  const { result } = renderHook(() => useTrailProgress());
  await waitFor(() => expect(result.current.status).toBe('error'));
});

test('does not show the previous account progress while loading another account', async () => {
  let resolveSecond;
  getMainTrailProgress
    .mockResolvedValueOnce(progress(true))
    .mockReturnValueOnce(new Promise((resolve) => { resolveSecond = resolve; }));
  const { result, rerender } = renderHook(() => useTrailProgress());
  await waitFor(() => expect(result.current.status).toBe('success'));

  useAuth.mockReturnValue({ user: { userId: '2' }, isGuest: false });
  rerender();
  await waitFor(() => expect(getMainTrailProgress).toHaveBeenCalledTimes(2));
  expect(result.current.status).toBe('loading');
  expect(result.current.progressBySlug.size).toBe(0);
  await act(async () => { resolveSecond(progress(false)); });
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.progressBySlug.get('balanco-na-pratica').status).toBe('available');
});
