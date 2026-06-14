import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Lock, Mail, Moon, Sparkles, Sun, User } from 'lucide-react';

// const GIC = (
//   <svg width="18" height="18" viewBox="0 0 48 48">
//     <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.5 33.1 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6-6C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.1-4z"/>
//     <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l6-6C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
//     <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.3 26.9 36 24 36c-5.2 0-9.5-2.9-11.3-7l-6.5 5C9.7 39.8 16.3 44 24 44z"/>
//     <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.7-4.8 6.2l6.2 5.2C40.4 35.8 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/>
//   </svg>
// );

export default function Login() {
  const [tab, setTab] = useState('login');
  const [f, setF]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const { login, signup } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  const set = key => e => setF(prev => ({ ...prev, [key]: e.target.value }));
  const switchTab = next => { setTab(next); setErr(''); };

  // ── Main form submit ───────────────────────────────────────────────────────
  const submit = async e => {
    e.preventDefault();
    setErr('');

    if (tab === 'signup' && f.password !== f.confirm) {
      return setErr('Passwords do not match');
    }
    if (tab === 'signup' && f.password.length < 6) {
      return setErr('Password must be at least 6 characters');
    }

    setBusy(true);
    // login / signup are real async API calls in the updated AuthContext
    const res = tab === 'login'
      ? await login(f.email, f.password)
      : await signup(f.name, f.email, f.password);

    if (res.ok) {
      nav('/dashboard');
    } else {
      setErr(res.err);
      setBusy(false);
    }
  };

  // // ── Pre-fill demo credentials ──────────────────────────────────────────────
  // const fillDemo = () => {
  //   setTab('login');
  //   setF(prev => ({ ...prev, email: 'admin@trendvault.com', password: 'admin123' }));
  // };

  // // ── Google demo — tries login, auto-registers if first time ───────────────
  // const googleLogin = async () => {
  //   setBusy(true);
  //   setErr('');
  //   let res = await login('demo@xeno.com', 'demo123');
  //   if (!res.ok) {
  //     // First-time demo use — create the account automatically
  //     res = await signup('Demo User', 'demo@xeno.com', 'demo123');
  //   }
  //   if (res.ok) {
  //     nav('/dashboard');
  //   } else {
  //     setErr(res.err);
  //     setBusy(false);
  //   }
  // };

  return (
    <div className="auth-page" data-theme={theme}>
      <nav className="lnav auth-nav">
        <Link to="/" className="llogo" aria-label="XenoCRM home">
          <span className="llogo-mark">X</span>
          <span>Xeno<em>CRM</em></span>
        </Link>
        <div className="auth-nav-actions">
          <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back home</Link>
          <button className="lnav-theme" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      <div className="auth-bg" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>

      <main className="auth-shell">
        <motion.section
          className="auth-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="hbadge auth-badge"><Sparkles size={15} /> Welcome to XenoCRM</div>
          <h1>Run smarter campaigns from one calm workspace.</h1>
          <p>Sign in to manage customer data, launch AI-assisted campaigns, and track delivery analytics in real time.</p>
          <div className="auth-proof-row">
            <div><strong>AI</strong><span>Campaign agent</span></div>
            <div><strong>Live</strong><span>Delivery stats</span></div>
            <div><strong>CSV</strong><span>Data import</span></div>
          </div>
        </motion.section>

        <motion.section
          className="auth-card"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div className="auth-card-head">
            <div>
              <h2>{tab === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p>{tab === 'login' ? 'Continue to your dashboard.' : 'Start building campaigns today.'}</p>
            </div>
          </div>

          <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
            <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>Login</button>
            <button type="button" className={tab === 'signup' ? 'active' : ''} onClick={() => switchTab('signup')}>Sign up</button>
          </div>

          {/* {tab === 'login' && (
            <motion.button type="button" className="demo-callout" onClick={fillDemo} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <strong>Use demo account</strong>
              <span>admin@trendvault.com / admin123</span>
            </motion.button>
          )}

          <button type="button" className="google-btn" onClick={googleLogin} disabled={busy}>
            {GIC}
            Continue with Google demo
          </button> */}

          <div className="auth-divider"><span>or use email</span></div>

          <form onSubmit={submit} className="auth-form">
            {tab === 'signup' && (
              <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                Full name
                <span><User size={17} /><input value={f.name} onChange={set('name')} placeholder="Priya Sharma" required /></span>
              </motion.label>
            )}

            <label>
              Email address
              <span><Mail size={17} /><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" required /></span>
            </label>

            <label>
              Password
              <span><Lock size={17} /><input type="password" value={f.password} onChange={set('password')} placeholder="Enter password" required /></span>
            </label>

            {tab === 'signup' && (
              <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                Confirm password
                <span><Lock size={17} /><input type="password" value={f.confirm} onChange={set('confirm')} placeholder="Confirm password" required /></span>
              </motion.label>
            )}

            {err && (
              <motion.div className="err-box" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                {err}
              </motion.div>
            )}

            <button className="auth-submit" type="submit" disabled={busy}>
              {busy && <span className="mini-spinner" />}
              {busy
                ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                : (tab === 'login' ? 'Login' : 'Create account')
              }
            </button>
          </form>

          <p className="auth-switch-line">
            {tab === 'login' ? 'New here?' : 'Already have an account?'}
            <button type="button" onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}>
              {tab === 'login' ? 'Create account' : 'Login'}
            </button>
          </p>
        </motion.section>
      </main>
    </div>
  );
}