import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, LogOut, Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Real-time campaign & customer analytics' },
  '/agent':     { title: 'AI Agent',   sub: 'Describe your goals in plain English' },
  '/ingest':    { title: 'Data Ingestion', sub: 'Import customers and orders' },
  '/customers': { title: 'Customers', sub: 'Manage your customer database' },
  '/segments':  { title: 'Segments',  sub: 'Audience segments created by you or AI' },
  '/campaigns': { title: 'Campaigns', sub: 'Live delivery stats — auto-refreshes' },
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const meta = PAGE_TITLES[pathname] || { title: 'XenoCRM', sub: '' };
  const quit = () => { logout(); nav('/'); };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-ham" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="topbar-title">
          <h2>{meta.title}</h2>
          {meta.sub && <p>{meta.sub}</p>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Theme toggle */}
        <button className="topbar-btn" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell (decorative) */}
        <button className="topbar-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {/* User avatar + logout */}
        <div className="topbar-user">
          <div className="topbar-ava">{user?.av || user?.name?.[0] || 'U'}</div>
          <span className="topbar-name">{user?.name || 'User'}</span>
          <button className="topbar-btn topbar-logout" onClick={quit} aria-label="Sign out" title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
