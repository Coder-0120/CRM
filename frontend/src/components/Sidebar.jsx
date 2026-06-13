import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bot, UploadCloud, Users, Tag, Megaphone,
  LogOut, Sun, Moon, X, ChevronRight, Menu
} from 'lucide-react';

const NAV = [
  { sec: null, items: [
    { to: '/dashboard', lbl: 'Dashboard',     Icon: LayoutDashboard },
    { to: '/agent',     lbl: 'AI Agent',       Icon: Bot,            badge: 'AI' },
  ]},
  { sec: 'Data', items: [
    { to: '/ingest',    lbl: 'Data Ingestion', Icon: UploadCloud },
    { to: '/customers', lbl: 'Customers',      Icon: Users },
  ]},
  { sec: 'Campaigns', items: [
    { to: '/segments',  lbl: 'Segments',       Icon: Tag },
    { to: '/campaigns', lbl: 'Campaigns',      Icon: Megaphone },
  ]},
];

export default function Sidebar({ open, onClose, onOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  const quit = () => { logout(); nav('/'); };

  return (
    <>
      {/* ── Hamburger button (visible only on mobile) ── */}
      {!open && (

      <button
        className="ham"
        onClick={onOpen}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu size={20} />
      </button>
      )}

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="sb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
    <motion.aside
  className={`sb ${open ? "open" : ""}`}
  initial={false}
>
        {/* Logo row */}
        <div className="sb-logo">
          <div className="sb-logo-ic">✦</div>
          <div className="sb-logo-txt">
            <h1>Xeno<em>CRM</em></h1>
            <p>AI Campaign Platform</p>
          </div>
          {/* Close button — mobile only */}
          <button className="sb-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav" aria-label="Main navigation">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.sec && <div className="sb-sec" aria-hidden="true">{group.sec}</div>}
              {group.items.map(({ to, lbl, Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) => `sb-link${isActive ? ' on' : ''}`}
                >
                  <Icon size={17} className="sb-link-icon" aria-hidden="true" />
                  <span className="sb-link-lbl">{lbl}</span>
                  {badge && <span className="sb-badge" aria-label={`${lbl} - ${badge}`}>{badge}</span>}
                  <ChevronRight size={13} className="sb-link-arrow" aria-hidden="true" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-ava" aria-hidden="true">{user?.av || user?.name?.[0] || 'U'}</div>
            <div className="sb-uinfo">
              <p>{user?.name || 'User'}</p>
              <span>{user?.role || 'Marketer'}</span>
            </div>
            <button className="sb-logout" onClick={quit} title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>

          <button className="sb-theme" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark'
              ? <><Sun size={15} /><span>Switch to light</span></>
              : <><Moon size={15} /><span>Switch to dark</span></>
            }
          </button>
        </div>
      </motion.aside>
    </>
  );
}