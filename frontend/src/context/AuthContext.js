import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext();

// REACT_APP_API_URL = "https://xeno-crm-backend-lo8a.onrender.com/api"
// Use it directly — no stripping needed
const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  .replace(/\/$/, ''); // only remove trailing slash if any

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('xeno_token');
    if (!token) { setLoading(false); return; }

    fetch(`${API}/auth/me`, {
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
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, err: data.error || 'Login failed.' };
      _persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      console.error('Login error:', e);
      return { ok: false, err: 'Cannot reach server. Is the backend running?' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res  = await fetch(`${API}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, err: data.error || 'Signup failed.' };
      _persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      console.error('Signup error:', e);
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