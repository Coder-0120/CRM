import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  LogOut,
  User,
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
  { text: 'XenoAI made campaign setup feel effortless.', name: 'Rahul Verma', role: 'Marketing Manager' },
  { text: 'The dashboard is clean enough for daily tracking.', name: 'Priya Singh', role: 'Growth Lead' },
  { text: 'Segmentation finally feels fast and visual.', name: 'Aman Gupta', role: 'CRM Specialist' },
  { text: 'Our team can move from idea to send in minutes.', name: 'Sneha Sharma', role: 'Campaign Manager' },
  { text: 'The AI suggestions are genuinely useful.', name: 'Rohit Kumar', role: 'Digital Marketer' },
  { text: 'Live delivery stats make every campaign easier to trust.', name: 'Anjali Jain', role: 'Growth Operator' },
];

/* ── CountUp: triggers only when scrolled into view, resets when scrolled out ── */
function CountUp({ value, suffix = '', delay = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const frameRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function startCount() {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const startTime = performance.now();
        const duration = 1600;
        const tick = now => {
          const pct = Math.min(1, (now - startTime) / duration);
          const eased = 1 - Math.pow(1 - pct, 3);
          setDisplay(Math.round(value * eased));
          if (pct < 1) frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
      }, delay);
    }

    function resetCount() {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timerRef.current);
      setDisplay(0);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startCount();
        else resetCount();
      },
      { threshold: 0.6, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frameRef.current); clearTimeout(timerRef.current); };
  }, [value, delay]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const rise = (delay = 0) => ({
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] } }
});

/* ── Aurora Canvas behind the hero ── */
function AuroraCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const waves = [
      { y: 0.28, amp: 60, freq: 0.0022, speed: 0.38, hue: 220, alpha: 0.13 },
      { y: 0.48, amp: 44, freq: 0.003,  speed: 0.55, hue: 190, alpha: 0.10 },
      { y: 0.68, amp: 36, freq: 0.0018, speed: 0.28, hue: 160, alpha: 0.08 },
      { y: 0.18, amp: 70, freq: 0.0015, speed: 0.45, hue: 250, alpha: 0.08 },
    ];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      waves.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(0, H * w.y);
        for (let x = 0; x <= W; x += 3) {
          const y = H * w.y
            + Math.sin(x * w.freq + t * w.speed) * w.amp
            + Math.sin(x * w.freq * 1.6 + t * w.speed * 0.7 + 1.4) * w.amp * 0.45;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        const g = ctx.createLinearGradient(0, H * w.y - w.amp, 0, H * w.y + w.amp * 2.2);
        g.addColorStop(0, `hsla(${w.hue},88%,62%,${w.alpha})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fill();
      });
      t += 0.016;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
}

/* ── Animated Campaign Mini-Window ── */
function CampaignPanel() {
  const stepRefs = useRef([]);
  const connRefs = useRef([]);
  const fillRef  = useRef(null);
  const textRef  = useRef(null);
  const timers   = useRef([]);

  const STEPS_DATA = [
    { n: '1', label: 'Find audience', icon: '🔍' },
    { n: '2', label: 'Write offer',   icon: '✍️'  },
    { n: '3', label: 'Send campaign', icon: '🚀' },
    { n: '4', label: 'Track results', icon: '📊' },
  ];

  const ACTIVE_TEXT = [
    'Scanning 2,847 customers…',
    'Crafting personalized offer…',
    'Launching to 1,204 users…',
    'Tracking live results…',
  ];
  const DONE_TEXT = ['1,204 qualified', 'Offer ready', 'Campaign sent', '62 conversions ✓'];

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function setStep(activeIdx) {
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      el.classList.remove('ms-active', 'ms-done');
      if (i < activeIdx) el.classList.add('ms-done');
      else if (i === activeIdx) el.classList.add('ms-active');
    });
    connRefs.current.forEach((el, i) => {
      if (!el) return;
      el.classList.remove('mc-run', 'mc-done');
      if (i < activeIdx - 1) el.classList.add('mc-done');
      else if (i === activeIdx - 1) el.classList.add('mc-run');
    });
    if (fillRef.current)
      fillRef.current.style.width = ((activeIdx + 1) / 4 * 100) + '%';
    if (textRef.current && activeIdx < 4)
      textRef.current.textContent = ACTIVE_TEXT[activeIdx];
  }

  function markDone(idx) {
    const el = stepRefs.current[idx];
    if (el) { el.classList.remove('ms-active'); el.classList.add('ms-done'); }
  }

  function runSequence() {
    clearTimers();
    stepRefs.current.forEach(el => el && el.classList.remove('ms-active','ms-done'));
    connRefs.current.forEach(el => el && el.classList.remove('mc-run','mc-done'));
    if (fillRef.current) fillRef.current.style.width = '0%';
    if (textRef.current) textRef.current.textContent = 'AI agent starting…';

    const schedule = [
      [0,    () => setStep(0)],
      [900,  () => markDone(0)],
      [1100, () => setStep(1)],
      [2000, () => markDone(1)],
      [2200, () => setStep(2)],
      [3100, () => markDone(2)],
      [3300, () => setStep(3)],
      [4400, () => markDone(3)],
      [4600, () => {
        if (textRef.current)
          textRef.current.textContent = DONE_TEXT.join('  ·  ');
      }],
      [6800, runSequence],
    ];

    schedule.forEach(([delay, fn]) => {
      timers.current.push(setTimeout(fn, delay));
    });
  }

  useEffect(() => {
    const init = setTimeout(runSequence, 700);
    return () => { clearTimeout(init); clearTimers(); };
  }, []);

  return (
    <div className="mini-window">
      <div className="mini-top"><span /><span /><span /></div>

      <div className="mini-query">
        <Sparkles size={18} />
        Win back high-value customers who have not bought recently
      </div>

      {/* connector rail */}
      <div className="mc-rail">
        <div />
        {[0,1,2].map(i => (
          <div key={i} className="mc-seg" ref={el => connRefs.current[i] = el}>
            <div className="mc-fill" />
          </div>
        ))}
      </div>

      {/* step cards */}
      <div className="mini-flow">
        {STEPS_DATA.map((s, i) => (
          <div key={i} className="mini-step" ref={el => stepRefs.current[i] = el}>
            <div className="ms-glow" />
            <div className="ms-num">{s.n}</div>
            <div className="ms-icon">{s.icon}</div>
            <div className="ms-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* progress bar */}
      <div className="mp-track">
        <div className="mp-fill" ref={fillRef} />
      </div>

      {/* status */}
      <div className="mp-status">
        <span className="mp-dot" />
        <span ref={textRef}>AI agent starting…</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user, logout } = useAuth();
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
          onClick={() => { closeNav(); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
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
            {!user ? (
              <>
                <Link to="/login" className="lmini" onClick={closeNav}>Sign in</Link>
                <Link to="/login" className="lmini primary" onClick={closeNav}>Get started</Link>
              </>
            ) : (
              <>
                <div className="landing-user"><User size={16} /><span>{user.name}</span></div>
                <button className="landing-logout" onClick={() => { logout(); closeNav(); }}>
                  <LogOut size={16} />Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        {/* Aurora waves behind everything */}
        <AuroraCanvas />

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
          Your customers are talking.<br />
          <span className="htitle-accent">XenoAI listens, segments, and strikes.</span>
        </motion.h1>

        <motion.p className="hsub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}>
          Segment smarter, write faster, and monitor every send from one responsive, light-first workspace.
        </motion.p>

        <motion.div className="hbtns" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }}>
          <Link to="/login" className="lbtn-p">Launch a campaign <ArrowRight size={17} /></Link>
          <a href="#how" className="lbtn-g">See how it works</a>
        </motion.div>

        {/* ── Animated campaign panel ── */}
        <motion.div
          className="hero-panel"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
        >
          <CampaignPanel />
        </motion.div>

        <div className="hproof">
          {PROOF.map((p, i) => (
            <motion.div key={p.label} className="hpitem" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise(i * 0.06)}>
              <div className="hpval"><CountUp value={p.value} suffix={p.suffix} delay={i * 120} /></div>
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
            {[...FEEDBACK, ...FEEDBACK].map((item, i) => (
              <div className="quote-card" key={`${item.name}-${i}`}>
                <p>"{item.text}"</p>
                <div className="quote-user">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
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