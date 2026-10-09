import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api.js';
import { clearSession, getStoredUser, setStoredUser, setToken } from '../../lib/auth.js';

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
    try { await api.delete('/auth/account'); } finally {
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
    window.addEventListener('bc:session-expired', expire);
    return () => window.removeEventListener('bc:session-expired', expire);
  }, []);
  const value = useMemo(() => ({ user, isGuest: !user || Boolean(user.isGuest), login, loginAsGuest, logout, deleteAccount }), [user, login, loginAsGuest, logout, deleteAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
