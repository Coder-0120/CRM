import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const I = {
  dash: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  ai:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>,
  up:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>,
  cu:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  seg:  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z"/></svg>,
  camp: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"/></svg>,
  out:  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>,
  moon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>,
  sun:  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>,
};

const NAV = [
  { sec:null, items:[
    { to:'/dashboard', lbl:'Dashboard',     ic:'dash' },
    { to:'/agent',     lbl:'AI Agent',       ic:'ai', badge:'AI' },
  ]},
  { sec:'Data', items:[
    { to:'/ingest',    lbl:'Data Ingestion', ic:'up' },
    { to:'/customers', lbl:'Customers',      ic:'cu' },
  ]},
  { sec:'Campaigns', items:[
    { to:'/segments',  lbl:'Segments',       ic:'seg' },
    { to:'/campaigns', lbl:'Campaigns',      ic:'camp' },
  ]},
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const quit = () => { logout(); nav('/'); };

  return (
    <>
      <motion.div 
        className={`overlay ${open?'open':''}`} 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div 
        className={`sb ${open?'open':''}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div 
          className="sb-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="sb-logo-ic"
            animate={{ 
              boxShadow: [
                '0 8px 24px rgba(108,99,255,.3)',
                '0 8px 32px rgba(108,99,255,.5)',
                '0 8px 24px rgba(108,99,255,.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✦
          </motion.div>
          <div className="sb-logo-txt">
            <h1>Xeno<em style={{fontStyle:'normal',color:'#a89dff'}}>CRM</em></h1>
            <p>AI Campaign Platform</p>
          </div>
        </motion.div>

        <motion.nav 
          className="sb-nav"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {NAV.map((g,gi)=>(
            <motion.div key={gi} variants={itemVariants}>
              {g.sec && <div className="sb-sec">{g.sec}</div>}
              {g.items.map(it=>(
                <NavLink key={it.to} to={it.to} onClick={onClose} className={({isActive})=>`sb-link${isActive?' on':''}`}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {I[it.ic]}
                  </motion.div>
                  {it.lbl}
                  {it.badge && (
                    <motion.span 
                      className="sb-badge"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {it.badge}
                    </motion.span>
                  )}
                </NavLink>
              ))}
            </motion.div>
          ))}
        </motion.nav>

        <motion.div 
          className="sb-foot"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div 
            className="sb-user"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sb-ava">{user?.av||user?.name?.[0]||'U'}</div>
            <div className="sb-uinfo">
              <p>{user?.name||'User'}</p>
              <span>{user?.role||'Marketer'}</span>
            </div>
            <motion.button 
              className="sb-logout" 
              onClick={quit} 
              title="Sign out"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              {I.out}
            </motion.button>
          </motion.div>
          <motion.button 
            className="sb-theme" 
            onClick={toggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: theme === 'dark' ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {theme==='dark'?I.sun:I.moon}
            </motion.div>
            {theme==='dark'?'Switch to light':'Switch to dark'}
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}