import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { clearAccountProgress, clearSession } from '../src/lib/auth.js';

function storage(initial) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
  };
}

beforeEach(() => {
  globalThis.localStorage = storage({
    bc_token: 'token',
    bc_user: 'user',
    bc_game_progress: 'progress',
    other: 'keep',
  });
  globalThis.sessionStorage = storage({
    'bc_trail_completed_creditos-saiba-mais': '1',
    other: 'keep',
  });
});

test('account deletion removes only account progress', () => {
  clearAccountProgress();
  assert.equal(localStorage.getItem('bc_game_progress'), null);
  assert.equal(sessionStorage.getItem('bc_trail_completed_creditos-saiba-mais'), null);
  assert.equal(localStorage.getItem('other'), 'keep');
  assert.equal(sessionStorage.getItem('other'), 'keep');
  assert.equal(localStorage.getItem('bc_token'), 'token');
});

test('session cleanup removes identity and legacy session progress', () => {
  clearSession();
  assert.equal(localStorage.getItem('bc_token'), null);
  assert.equal(localStorage.getItem('bc_user'), null);
  assert.equal(sessionStorage.getItem('bc_trail_completed_creditos-saiba-mais'), null);
  assert.equal(localStorage.getItem('bc_game_progress'), 'progress');
});
