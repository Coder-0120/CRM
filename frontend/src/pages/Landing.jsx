import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  Database,
  Menu,
  MailCheck,
  MessageSquareText,
  Moon,
  Route,
  Sparkles,
  Sun,
  Target,
  UploadCloud,
  X,
  Zap
} from 'lucide-react';

const FEATS = [
  { ic: Bot, t: 'AI Campaign Agent', d: 'Describe a goal in plain English and let XenoAI build the segment, message, and campaign path.' },
  { ic: Target, t: 'Smart Segmentation', d: 'Target by spend, activity, city, visits, and custom rules with clean AND/OR logic.' },
  { ic: BarChart3, t: 'Live Analytics', d: 'Track delivery, opens, clicks, and audience behavior as campaigns move.' },
  { ic: UploadCloud, t: 'Flexible Import', d: 'Bring customers and orders through CSV uploads or fast manual forms.' },
  { ic: Route, t: 'Delivery Loop', d: 'A two-service flow simulates async campaign delivery from send to callback.' },
  { ic: Sparkles, t: 'Polished Workspace', d: 'Responsive layouts, light-first design, and subtle motion for daily marketing work.' },
];

const STEPS = [
  { n: '01', t: 'Import customer data', d: 'Upload CSV files or add customer and order records manually.', icon: Database },
  { n: '02', t: 'Ask the AI agent', d: 'Tell XenoAI who you want to reach and what outcome matters.', icon: MessageSquareText },
  { n: '03', t: 'Launch the campaign', d: 'The agent creates the audience, writes the message, and sends.', icon: Zap },
  { n: '04', t: 'Measure every result', d: 'Watch delivery, open, and click performance update live.', icon: MailCheck },
];

const PROOF = [
  { value: 100, suffix: '+', label: 'seed customers' },
  { value: 30, suffix: 's', label: 'campaign setup' },
  { value: 4, suffix: 'x', label: 'faster targeting' },
  { value: 2, suffix: '', label: 'service flow' },
];

const FEEDBACK = [
  'XenoAI made campaign setup feel effortless.',
  'The dashboard is clean enough for daily tracking.',
  'Segmentation finally feels fast and visual.',
  'Our team can move from idea to send in minutes.',
  'The AI suggestions are genuinely useful.',
  'Live delivery stats make every campaign easier to trust.',
];

function CountUp({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1200;
    const tick = now => {
      const pct = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(value * eased));
      if (pct < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display}{suffix}</span>;
}

const rise = (delay = 0) => ({
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] } }
});

export default function Landing() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="land" data-theme={theme}>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />

      <nav className={`lnav ${scrolled ? 'scrolled' : ''}`}>
      <Link
  to="/"
  className="llogo"
  aria-label="XenoCRM home"
  onClick={() => {
    closeNav();

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 100);
  }}
>
  <span className="llogo-mark">X</span>
  <span>Xeno<em>CRM</em></span>
</Link>
        <button className="nav-toggle" onClick={() => setNavOpen(v => !v)} aria-label="Toggle navigation" aria-expanded={navOpen}>
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`lnav-links ${navOpen ? 'open' : ''}`}>
          <div className="lnav-tabs">
            <a href="#features" onClick={closeNav}>Features</a>
            <a href="#how" onClick={closeNav}>How it works</a>
            <a href="#feedback" onClick={closeNav}>Feedback</a>
          </div>
          <div className="lnav-actions">
            <button className="lnav-theme" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <Link to="/login" className="lmini" onClick={closeNav}>Sign in</Link>
            <Link to="/login" className="lmini primary" onClick={closeNav}>Get started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <motion.span className="beam beam-a" animate={{ x: [0, 30, 0], y: [0, -18, 0] }} transition={{ duration: 12, repeat: Infinity }} />
          <motion.span className="beam beam-b" animate={{ x: [0, -24, 0], y: [0, 22, 0] }} transition={{ duration: 14, repeat: Infinity }} />
          <motion.span className="grid-glow" animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 8, repeat: Infinity }} />
          <div className="sprinkle-field">
            {Array.from({ length: 16 }).map((_, i) => <span key={i} />)}
          </div>
        </div>

        <motion.div className="hbadge" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Sparkles size={15} />
          AI-native CRM for D2C growth teams
        </motion.div>

        <motion.h1 className="htitle" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
          Turn scattered customer signals into campaigns people actually notice.
        </motion.h1>

        <motion.p className="hsub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}>
          Segment smarter, write faster, and monitor every send from one responsive, light-first workspace.
        </motion.p>

        <motion.div className="hbtns" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }}>
          <Link to="/login" className="lbtn-p">Launch a campaign <ArrowRight size={17} /></Link>
          <a href="#how" className="lbtn-g">See how it works</a>
        </motion.div>

        <motion.div className="hero-panel" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38 }}>
          <div className="mini-window">
            <div className="mini-top"><span /><span /><span /></div>
            <div className="mini-query">
              <Sparkles size={18} />
              Win back high-value customers who have not bought recently
            </div>
            <div className="mini-flow">
              {['Find audience', 'Write offer', 'Send campaign', 'Track results'].map((item, i) => (
                <motion.div key={item} className="mini-step" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + i * 0.12 }}>
                  <span>{i + 1}</span>
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="hproof">
          {PROOF.map((p, i) => (
            <motion.div key={p.label} className="hpitem" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(i * 0.06)}>
              <div className="hpval"><CountUp value={p.value} suffix={p.suffix} /></div>
              <div className="hplbl">{p.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="lsec" id="features">
        <motion.span className="slbl" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise()}>Features</motion.span>
        <motion.h2 className="stitle" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(0.05)}>Built like a real marketing control room.</motion.h2>
        <motion.p className="sdesc" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(0.1)}>
          The interface stays calm, fast, and readable while still feeling alive.
        </motion.p>
        <div className="fgrid">
          {FEATS.map((f, i) => {
            const Icon = f.ic;
            return (
              <motion.div key={f.t} className="fc" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(i * 0.06)} whileHover={{ y: -8 }}>
                <div className="fc-ic"><Icon size={24} /></div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="lsec lsec-dk" id="how">
        <div className="section-center">
          <motion.span className="slbl" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise()}>How it works</motion.span>
          <motion.h2 className="stitle" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(0.05)}>Scroll through the campaign path.</motion.h2>
        </div>

        <div className="work-timeline">
          <div className="work-line" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.article key={s.n} className="work-step" initial={{ opacity: 0, x: i % 2 ? 34 : -34 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.55, delay: i * 0.08 }}>
                <div className="work-dot"><Icon size={20} /></div>
                <span>{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="lsec feedback-sec" id="feedback">
        <motion.span className="slbl" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise()}>Customer feedback</motion.span>
        <motion.h2 className="stitle" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(0.05)}>Designed to feel human in daily use.</motion.h2>
        <div className="feedback-marquee">
          <div className="feedback-track">
            {[...FEEDBACK, ...FEEDBACK].map((text, i) => (
              <div className="quote-card" key={`${text}-${i}`}>
                <p>{text}</p>
                <span>Growth operator</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lcta">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise()}>Ready to launch your first AI campaign?</motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(0.08)}>Use the demo login or create an account and explore the full CRM flow.</motion.p>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(0.14)}>
          <Link to="/login" className="lbtn-p big">Get started free <ChevronRight size={18} /></Link>
        </motion.div>
      </section>

      <footer className="lfoot">
        <div className="footer-grid">
          <div>
            <Link to="/" className="llogo footer-logo">
              <span className="llogo-mark">X</span>
              <span>Xeno<em>CRM</em></span>
            </Link>
            <p>AI campaign workspace for segmentation, messaging, delivery, and live analytics.</p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#feedback">Feedback</a>
          </div>
          <div>
            <h4>Workspace</h4>
            <Link to="/login">Dashboard</Link>
            <Link to="/login">AI Agent</Link>
            <Link to="/login">Campaigns</Link>
          </div>
          <div>
            <h4>Project</h4>
            <span>Xeno Engineering Assignment 2026</span>
            <span>Built by Anshul</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Light-first, responsive, and ready for demo.</span>
          <span>XenoCRM</span>
        </div>
      </footer>
    </div>
  );
}
