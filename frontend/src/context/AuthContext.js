import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext();

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  .replace(/\/$/, '');

// fetch with timeout — mobile needs longer (Render free tier cold start = 30s)
async function fetchWithTimeout(url, options = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Request timed out. The server may be waking up — please try again.');
    throw e;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('xeno_token');
    if (!token) { setLoading(false); return; }

    fetchWithTimeout(`${API}/auth/me`, {
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
      const res  = await fetchWithTimeout(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, err: data.error || 'Login failed.' };
      _persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.message || 'Cannot reach server. Please try again.' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res  = await fetchWithTimeout(`${API}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, err: data.error || 'Signup failed.' };
      _persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.message || 'Cannot reach server. Please try again.' };
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