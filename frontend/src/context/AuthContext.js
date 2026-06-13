import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const Ctx = createContext();

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while verifying stored token

  // On mount: restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem('xeno_token');
    if (!token) { setLoading(false); return; }

    axios.get(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('xeno_token'))
      .finally(() => setLoading(false));
  }, []);

  const _persist = (token, userData) => {
    localStorage.setItem('xeno_token', token);
    setUser(userData);
  };

  // login(email, password) → { ok, err? }
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password });
      _persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.response?.data?.error || 'Login failed. Check your credentials.' };
    }
  };

  // signup(name, email, password) → { ok, err? }
  const signup = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${BASE}/api/auth/signup`, { name, email, password });
      _persist(data.token, data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.response?.data?.error || 'Signup failed. Please try again.' };
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