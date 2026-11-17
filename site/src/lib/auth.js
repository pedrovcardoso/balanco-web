export const TOKEN_KEY = 'bc_token';
const USER_KEY = 'bc_user';
const LEGACY_CREDITS_PROGRESS_KEY = 'bc_trail_completed_creditos-saiba-mais';
const GAME_PROGRESS_KEY = 'bc_game_progress';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = () => Boolean(getToken());
export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
};
export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const clearStoredUser = () => localStorage.removeItem(USER_KEY);
export const clearSession = () => {
  clearToken();
  clearStoredUser();
  sessionStorage.removeItem(LEGACY_CREDITS_PROGRESS_KEY);
};

export const clearAccountProgress = () => {
  localStorage.removeItem(GAME_PROGRESS_KEY);
  sessionStorage.removeItem(LEGACY_CREDITS_PROGRESS_KEY);
};
