import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api.js';
import { clearAccountProgress, clearSession, getStoredUser, getToken, setStoredUser, setToken, TOKEN_KEY } from '../../lib/auth.js';

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const login = useCallback(async (cpf, name) => {
    const { data } = await api.post('/auth/login', { cpf, name });
    setToken(data.token); setStoredUser(data.user); setUser(data.user);
    window.dispatchEvent(new CustomEvent('bc:auth-changed', { detail: data.user }));
    return data.user;
  }, []);
  const loginAsGuest = useCallback(async () => {
    const { data } = await api.post('/auth/guest', { display_name: 'Visitante' });
    setToken(data.token); setStoredUser(data.user); setUser(data.user);
    window.dispatchEvent(new CustomEvent('bc:auth-changed', { detail: data.user }));
    return data.user;
  }, []);
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally {
      clearSession();
      setUser(null);
      window.dispatchEvent(new CustomEvent('bc:auth-changed', { detail: null }));
    }
  }, []);
  const deleteAccount = useCallback(async () => {
    const { data } = await api.delete('/auth/account');
    if (!data?.ok) throw new Error('A exclusão da conta não foi confirmada.');
    try { clearAccountProgress(); } finally {
      clearSession();
      setUser(null);
      window.dispatchEvent(new CustomEvent('bc:auth-changed', { detail: null }));
    }
  }, []);
  useEffect(() => {
    const expire = () => {
      setUser(null);
      window.dispatchEvent(new CustomEvent('bc:auth-changed', { detail: null }));
    };
    const syncSession = (event) => {
      if (event.key === TOKEN_KEY && !event.newValue && !getToken()) {
        clearSession();
        expire();
      }
    };
    window.addEventListener('bc:session-expired', expire);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener('bc:session-expired', expire);
      window.removeEventListener('storage', syncSession);
    };
  }, []);
  const value = useMemo(() => ({ user, isGuest: !user || Boolean(user.isGuest), login, loginAsGuest, logout, deleteAccount }), [user, login, loginAsGuest, logout, deleteAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
