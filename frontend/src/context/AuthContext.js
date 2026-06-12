import { createContext, useContext, useState } from 'react';

const Ctx = createContext();

const DB = [
  { id:1, email:'admin@trendvault.com', password:'admin123', name:'Anshul Kumar',  role:'Admin',    av:'A' },
  { id:2, email:'demo@xeno.com',        password:'demo123',  name:'Demo Marketer', role:'Marketer', av:'D' },
  { id:3, email:'judge@xeno.com',       password:'judge123', name:'Xeno Judge',    role:'Viewer',   av:'J' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('xcrm-user')); } catch { return null; }
  });

  const save = (u) => { setUser(u); localStorage.setItem('xcrm-user', JSON.stringify(u)); };

  const login = (email, password) => {
    const f = DB.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (f) { const { password:_, ...safe } = f; save(safe); return { ok: true }; }
    return { ok: false, err: 'Invalid email or password' };
  };

  const signup = (name, email, password) => {
    if (DB.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, err: 'Email already registered. Please sign in.' };
    save({ id: Date.now(), name, email, role: 'Marketer', av: name[0].toUpperCase() });
    return { ok: true };
  };

  const logout = () => { setUser(null); localStorage.removeItem('xcrm-user'); };

  return <Ctx.Provider value={{ user, login, signup, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);