import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, User, Check } from 'lucide-react';

const GIC = <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.5 33.1 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6-6C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l6-6C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.3 26.9 36 24 36c-5.2 0-9.5-2.9-11.3-7l-6.5 5C9.7 39.8 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.7-4.8 6.2l6.2 5.2C40.4 35.8 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/></svg>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Login() {
  const [tab, setTab]   = useState('login');
  const [f, setF]       = useState({ name:'', email:'', password:'', confirm:'' });
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  const set = k => e => setF(p => ({...p,[k]:e.target.value}));

  const submit = async e => {
    e.preventDefault(); 
    setErr(''); 
    setBusy(true);
    if (tab==='signup' && f.password !== f.confirm) { 
      setErr('Passwords do not match'); 
      setBusy(false); 
      return; 
    }
    if (tab==='signup' && f.password.length < 6) { 
      setErr('Password must be at least 6 characters'); 
      setBusy(false); 
      return; 
    }
    await new Promise(r=>setTimeout(r,700));
    const r = tab==='login' ? login(f.email,f.password) : signup(f.name,f.email,f.password);
    if (r.ok) nav('/dashboard');
    else { setErr(r.err); setBusy(false); }
  };

  const fillDemo = () => { setTab('login'); setF(p=>({...p,email:'admin@trendvault.com',password:'admin123'})); };
  const googleLogin = () => { const r = login('demo@xeno.com','demo123'); if (r.ok) nav('/dashboard'); };

  return (
    <div className="auth" data-theme={theme}>
      {/* Left panel */}
      <div className="auth-l">
        <motion.div 
          style={{position: 'absolute', width: 560, height: 560, top: -150, left: -150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,64,175,.12), transparent 70%)', pointerEvents: 'none' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          style={{position: 'absolute', width: 360, height: 360, bottom: -60, right: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,.1), transparent 70%)', pointerEvents: 'none' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />

        <motion.div 
          initial={{opacity:0,x:-30}} 
          animate={{opacity:1,x:0}} 
          transition={{duration:.6}}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Link to="/" style={{textDecoration:'none'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <motion.div
                style={{
                  width: 50,
                  height: 50,
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 700
                }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                ✦
              </motion.div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: 0 }}>
                  Xeno<span style={{color:'#60a5fa'}}>CRM</span>
                </h1>
              </div>
            </div>
          </Link>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, maxWidth: 340, marginBottom: 36 }}>
            AI-Native Campaign Platform for D2C brands — segment smarter, message better, grow faster.
          </p>
        </motion.div>

        <motion.div 
          className="auth-feats" 
          initial={{opacity:0,x:-20}} 
          animate={{opacity:1,x:0}} 
          transition={{duration:.6,delay:.2}}
          variants={containerVariants}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {[
            {ic:'🤖',t:'AI Campaign Agent',  d:'Launch campaigns in plain English'},
            {ic:'🎯',t:'Smart Segmentation', d:'Precise audience targeting'},
            {ic:'📊',t:'Live Analytics',      d:'Real-time delivery tracking'},
            {ic:'📁',t:'CSV Data Import',     d:'Ingest your own customer data'},
          ].map((x,i)=>(
            <motion.div 
              key={i} 
              variants={itemVariants}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: 12,
                borderRadius: 8,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.2)' }}
            >
              <div style={{fontSize: 20}}>{x.ic}</div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 2px 0' }}>{x.t}</h4>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', margin: 0 }}>{x.d}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="auth-r">
        <motion.div 
          style={{
            background: 'var(--card)',
            border: '1px solid var(--bd)',
            borderRadius: 16,
            padding: 40,
            boxShadow: 'var(--sh2)',
            maxWidth: 420,
            width: '100%'
          }}
          initial={{opacity:0,y:20}} 
          animate={{opacity:1,y:0}} 
          transition={{duration:.5,delay:.15}}
        >
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32}}>
            <div>
              <h2 style={{fontSize: 24, fontWeight: 700, color: 'var(--t1)', margin: '0 0 8px 0'}}>
                {tab==='login'?'Welcome back':'Create account'}
              </h2>
              <p style={{fontSize: 13, color: 'var(--t2)', margin: 0}}>
                {tab==='login'?'Sign in to your dashboard':'Start your free account today'}
              </p>
            </div>
            <motion.button 
              onClick={toggle} 
              title="Toggle theme"
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--bd)',
                width: 40,
                height: 40,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                transition: 'all 0.3s ease'
              }}
              whileHover={{ background: 'var(--bg3)' }}
              whileTap={{ scale: 0.9 }}
            >
              {theme==='dark'?'☀️':'🌙'}
            </motion.button>
          </div>

          {/* Tabs */}
          <div style={{display: 'flex', gap: 8, marginBottom: 24}}>
            {['login', 'signup'].map(t => (
              <motion.button
                key={t}
                onClick={()=>{setTab(t);setErr('')}}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: tab === t ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'var(--bg2)',
                  color: tab === t ? 'white' : 'var(--t1)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t==='login' ? 'Sign in' : 'Sign up'}
              </motion.button>
            ))}
          </div>

          {tab==='login' && (
            <motion.div 
              onClick={fillDemo}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(30,64,175,.1), rgba(59,130,246,.05))',
                border: '1px solid rgba(30,64,175,.3)',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ background: 'linear-gradient(135deg, rgba(30,64,175,.15), rgba(59,130,246,.1))', borderColor: 'rgba(30,64,175,.5)' }}
            >
              <strong style={{ color: 'var(--t1)', fontSize: 13, display: 'block', marginBottom: 2 }}>🚀 Demo account</strong>
              <span style={{fontSize: 12, color: 'var(--t2)'}}>admin@trendvault.com · admin123</span>
            </motion.div>
          )}

          <motion.button 
            onClick={googleLogin} 
            type="button"
            style={{
              width: '100%',
              padding: 12,
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              borderRadius: 8,
              color: 'var(--t1)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
              transition: 'all 0.3s ease'
            }}
            whileHover={{ background: 'var(--bg3)' }}
            whileTap={{ scale: 0.98 }}
          >
            {GIC}Continue with Google
          </motion.button>

          <div style={{textAlign: 'center', marginBottom: 16, fontSize: 13, color: 'var(--t3)'}}>
            ─ or {tab==='login'?'sign in':'sign up'} with email ─
          </div>

          <form onSubmit={submit}>
            {tab==='signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 16 }}
              >
                <label style={{fontSize: 12, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6}}>Full name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{position: 'absolute', left: 12, top: 12, color: 'var(--t3)', pointerEvents: 'none'}} />
                  <input 
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--bd)',
                      borderRadius: 8,
                      fontSize: 14,
                      color: 'var(--t1)',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Priya Sharma" 
                    value={f.name} 
                    onChange={set('name')} 
                    required 
                  />
                </div>
              </motion.div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{fontSize: 12, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6}}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{position: 'absolute', left: 12, top: 12, color: 'var(--t3)', pointerEvents: 'none'}} />
                <input 
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--bd)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: 'var(--t1)',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  type="email" 
                  placeholder="you@example.com" 
                  value={f.email} 
                  onChange={set('email')} 
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{fontSize: 12, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6}}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{position: 'absolute', left: 12, top: 12, color: 'var(--t3)', pointerEvents: 'none'}} />
                <input 
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--bd)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: 'var(--t1)',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  type="password" 
                  placeholder="••••••••" 
                  value={f.password} 
                  onChange={set('password')} 
                  required 
                />
              </div>
            </div>

            {tab==='signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 16 }}
              >
                <label style={{fontSize: 12, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6}}>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{position: 'absolute', left: 12, top: 12, color: 'var(--t3)', pointerEvents: 'none'}} />
                  <input 
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--bd)',
                      borderRadius: 8,
                      fontSize: 14,
                      color: 'var(--t1)',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    type="password" 
                    placeholder="••••••••" 
                    value={f.confirm} 
                    onChange={set('confirm')} 
                    required 
                  />
                </div>
              </motion.div>
            )}

            {err && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,.1)',
                  border: '1px solid rgba(239,68,68,.3)',
                  color: '#ef4444',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                ⚠ {err}
              </motion.div>
            )}

            <motion.button 
              type="submit" 
              disabled={busy}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16
              }}
              whileHover={!busy ? { scale: 1.02 } : {}}
              whileTap={!busy ? { scale: 0.98 } : {}}
            >
              {busy ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%'}}
                  />
                  {tab==='login'?'Signing in…':'Creating account…'}
                </>
              ) : (
                <>
                  {tab==='login'?'Sign in →':'Create account →'}
                </>
              )}
            </motion.button>
          </form>

          <div style={{textAlign: 'center', fontSize: 13, color: 'var(--t2)'}}>
            {tab==='login'
              ? <>Don't have an account? <motion.a onClick={()=>{setTab('signup');setErr('')}} style={{cursor: 'pointer', color: '#1e40af', fontWeight: 600, textDecoration: 'none'}} whileHover={{textDecoration: 'underline'}}>Sign up free</motion.a></>
              : <>Already have an account? <motion.a onClick={()=>{setTab('login');setErr('')}} style={{cursor: 'pointer', color: '#1e40af', fontWeight: 600, textDecoration: 'none'}} whileHover={{textDecoration: 'underline'}}>Sign in</motion.a></>
            }
          </div>

          {tab==='login' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{marginTop:20,padding:'12px 14px',background:'var(--bg2)',borderRadius:8,fontSize:11,color:'var(--t2)',lineHeight:1.7,border:'1px solid var(--bd)'}}>
              <strong style={{color:'var(--t1)',display:'block',marginBottom:6, fontSize: 12}}>Demo accounts</strong>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                <span>👤 admin@trendvault.com / admin123</span>
                <span>👤 demo@xeno.com / demo123</span>
                <span>👤 judge@xeno.com / judge123</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}