import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import api from '../../../lib/api.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { useTrailProgress } from './useTrailProgress.js';

vi.mock('../../../lib/api.js', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../../shared/hooks/useAuth.js', () => ({ useAuth: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  useAuth.mockReturnValue({ user: { userId: '1' }, isGuest: false });
});

test('restores the redemption and reloads it when the identified user changes', async () => {
  let resolveSecond;
  api.get
    .mockResolvedValueOnce({ data: [{ itemKey: 'BALANCO_DADOS', redeemed: true }] })
    .mockReturnValueOnce(new Promise((resolve) => { resolveSecond = resolve; }));
  const { result, rerender } = renderHook(() => useTrailProgress());
  await waitFor(() => expect(result.current.claimed).toBe(true));

  useAuth.mockReturnValue({ user: { userId: '2' }, isGuest: false });
  rerender();
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  expect(result.current.restoring).toBe(true);
  expect(result.current.claimed).toBe(false);
  await act(async () => { resolveSecond({ data: [{ itemKey: 'BALANCO_DADOS', redeemed: false }] }); });
  await waitFor(() => expect(result.current.claimed).toBe(false));
});

test('reports restoration failures instead of treating them as pending and allows retry', async () => {
  api.get
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: [{ itemKey: 'BALANCO_DADOS', redeemed: true }] });
  const { result } = renderHook(() => useTrailProgress());
  await waitFor(() => expect(result.current.restoreError).not.toBe(''));
  act(() => result.current.retryRestore());
  await waitFor(() => expect(result.current.claimed).toBe(true));
  expect(result.current.restoreError).toBe('');
});
