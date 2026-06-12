import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

const FEATS = [
  { ic:'🤖', t:'AI Campaign Agent',   d:'Describe your goal in plain English. XenoAI segments the audience, writes the message, and fires the campaign — automatically.' },
  { ic:'🎯', t:'Smart Segmentation',  d:'Build precise audiences using spend, activity, city and behaviour with multi-rule AND/OR logic.' },
  { ic:'📊', t:'Live Analytics',       d:'Watch delivery stats — delivered, opened, clicked — update in real time on your dashboard.' },
  { ic:'📁', t:'Flexible Import',     d:'Upload customers and orders via CSV drag-and-drop, or add records one at a time through clean forms.' },
  { ic:'🔄', t:'Async Delivery Loop', d:'Two-service microarchitecture: a stubbed channel service simulates the full delivery lifecycle with async callbacks.' },
  { ic:'🌙', t:'Dark & Light Themes', d:'Beautiful, fully responsive UI with smooth theme switching — designed for long marketing sessions.' },
];

const STEPS = [
  { n:'1', t:'Ingest Your Data',   d:'Upload customer and order CSVs or add them manually.' },
  { n:'2', t:'Describe Your Goal', d:'Tell XenoAI what you want in plain English.' },
  { n:'3', t:'AI Executes',        d:'Agent segments, crafts the message, and launches.' },
  { n:'4', t:'Track Live Results', d:'Watch delivery, open, and click stats in real time.' },
];

const v = (d=0) => ({ hidden:{opacity:0,y:26}, visible:{opacity:1,y:0,transition:{duration:.55,delay:d,ease:[.22,1,.36,1]}} });
const vH = (d=0) => ({ hidden:{opacity:0,y:40}, visible:{opacity:1,y:0,transition:{duration:.6,delay:d,ease:'easeOut'}} });
const vS = (d=0) => ({ hidden:{opacity:0,scale:0.9}, visible:{opacity:1,scale:1,transition:{duration:.5,delay:d}} });

export default function Landing() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 30);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
<div className="land" data-theme={theme}>
        {/* Nav */}
      <nav className={`lnav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="llogo">
          <motion.div 
            className="llogo-dot"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Xeno<span style={{color:'#60a5fa'}}>CRM</span>
        </Link>
        <div className="lnav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <button className="lnav-theme" onClick={toggle}>
            {theme === 'dark'
              ? <><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>Light</>
              : <><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>Dark</>
            }
          </button>
          <Link to="/login"><button className="lbtn-g" style={{padding:'8px 20px',fontSize:13}}>Sign in</button></Link>
          <Link to="/login"><button className="lbtn-p" style={{padding:'8px 20px',fontSize:13}}>Get started →</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hbg">
          <motion.div 
            className="horb" 
            style={{width:700,height:700,top:-200,left:'50%',transform:'translateX(-50%)',background:'radial-gradient(circle,rgba(30,64,175,.14),transparent 70%)'}}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="horb" 
            style={{width:400,height:400,bottom:-100,left:'5%',background:'radial-gradient(circle,rgba(59,130,246,.1),transparent 70%)'}}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
          <motion.div 
            className="horb" 
            style={{width:300,height:300,top:80,right:'5%',background:'radial-gradient(circle,rgba(8,145,178,.08),transparent 70%)'}}
            animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          />
        </div>

        <motion.div 
          className="hbadge" 
          initial={{opacity:0,y:-12}} 
          animate={{opacity:1,y:0}} 
          transition={{duration:.5}}
          whileHover={{ scale: 1.05, y: -14 }}
        >
          <span className="hbadge-dot" />
          ✨ AI-Native CRM · Powered by Gemini · Built for D2C Brands
        </motion.div>

        <motion.h1 
          className="htitle" 
          initial={{opacity:0,y:24}} 
          animate={{opacity:1,y:0}} 
          transition={{duration:.6,delay:.1}}
          style={{ y: scrollY * 0.3 }}
        >
          Reach your shoppers<br/>with <span className="gr">intelligent</span><br/>campaigns
        </motion.h1>

        <motion.p 
          className="hsub" 
          initial={{opacity:0,y:20}} 
          animate={{opacity:1,y:0}} 
          transition={{duration:.6,delay:.2}}
          style={{ y: scrollY * 0.2 }}
        >
          XenoCRM helps D2C brands decide who to talk to, what to say, and when — powered by an AI agent that executes campaigns end-to-end in seconds.
        </motion.p>

        <motion.div 
          className="hbtns" 
          initial={{opacity:0,y:16}} 
          animate={{opacity:1,y:0}} 
          transition={{duration:.6,delay:.3}}
        >
          <Link to="/login">
            <motion.button 
              className="lbtn-p"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch your first campaign <ArrowRight size={16} />
            </motion.button>
          </Link>
          <motion.a 
            href="#how"
            className="lbtn-g"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ▶ See how it works
          </motion.a>
        </motion.div>

        <motion.div 
          className="hproof" 
          initial={{opacity:0}} 
          animate={{opacity:1}} 
          transition={{duration:.6,delay:.55}}
        >
          {[{v:'100+',l:'Pre-seeded customers'},{v:'AI✦',l:'Powered by Gemini'},{v:'2',l:'Microservices'},{v:'<30s',l:'Campaign to delivery'}].map((p,i)=>(
            <motion.div 
              key={i} 
              className="hpitem"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="hpval" 
                style={{color:i===0?'#60a5fa':'#fff'}}
                whileHover={{ scale: 1.1, y: -5 }}
              >
                {p.v}
              </motion.div>
              <div className="hplbl">{p.l}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="lsec" id="features">
        <motion.span 
          className="slbl" 
          variants={v()} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{once:true}}
        >
          ✨ Features
        </motion.span>
        <motion.h2 
          className="stitle" 
          variants={v(.05)} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{once:true}}
        >
          Everything to run<br/>great campaigns
        </motion.h2>
        <motion.p 
          className="sdesc" 
          variants={v(.1)} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{once:true}}
        >
          Built for D2C brands who want to move fast and reach their shoppers intelligently.
        </motion.p>
        <div className="fgrid">
          {FEATS.map((f,i)=>(
            <motion.div 
              key={i} 
              className="fc" 
              variants={vS(i*.08)} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{once:true}}
              whileHover={{ y: -8 }}
            >
              <div className="fc-ic">{f.ic}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How */}
      <section className="lsec lsec-dk" id="how">
        <div style={{textAlign:'center'}}>
          <motion.span 
            className="slbl" 
            variants={v()} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once:true}}
          >
            🚀 How it works
          </motion.span>
          <motion.h2 
            className="stitle" 
            variants={v(.05)} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{once:true}}
          >
            From data to delivered<br/>in minutes, not days
          </motion.h2>
        </div>
        <div className="steps" style={{margin:'56px auto 0'}}>
          {STEPS.map((s,i)=>(
            <motion.div 
              key={i} 
              className="step" 
              variants={vH(i*.12)} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{once:true}}
            >
              <motion.div 
                className="step-c"
                whileHover={{ scale: 1.1, boxShadow: '0 0 0 20px rgba(30,64,175,.15)' }}
              >
                {s.n}
              </motion.div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lcta">
        <motion.h2 
          variants={v()} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{once:true}}
        >
          Ready to launch your<br/>first AI campaign?
        </motion.h2>
        <motion.p 
          variants={v(.07)} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{once:true}}
        >
          Sign up free or use demo credentials to explore the full platform.
        </motion.p>
        <motion.div 
          variants={v(.14)} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{once:true}}
        >
          <Link to="/login">
            <motion.button 
              className="lbtn-p" 
              style={{fontSize:16,padding:'15px 44px'}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get started free <ChevronRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer className="lfoot">
        <span><strong style={{color:'rgba(255,255,255,.6)'}}>XenoCRM</strong> — Xeno Engineering Assignment 2026</span>
        <span>Made with ♥ by Anshul</span>
      </footer>
    </div>
  );
}