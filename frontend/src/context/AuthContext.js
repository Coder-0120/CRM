import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext();

// REACT_APP_API_URL is "https://xeno-crm-backend-lo8a.onrender.com/api"
// We need base without /api for auth routes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)   // remove last 4 chars "/api"
  : API_URL;

console.log('[Auth] BASE URL:', BASE); // remove after confirming it works

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('xeno_token');
    if (!token) { setLoading(false); return; }

    fetch(`${BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('xeno_token'))
      .finally(() => setLoading(false));
  }, []);

  const _persist = (token, userData) => {
    localStorage.setItem('xeno_token', token);
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const res  = await fetch(`${BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, err: data.error || 'Login failed.' };
      _persist(data.token, data.user);
      return { ok: true };
    } catch {
      return { ok: false, err: 'Cannot reach server. Is the backend running?' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res  = await fetch(`${BASE}/api/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, err: data.error || 'Signup failed.' };
      _persist(data.token, data.user);
      return { ok: true };
    } catch {
      return { ok: false, err: 'Cannot reach server. Is the backend running?' };
    }
  };

  const logout = () => {
    localStorage.removeItem('xeno_token');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);