import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Send, Sparkles, Zap } from 'lucide-react';

const SUGGESTIONS = [
  "Show me an overview of our customer base",
  "Target high-value customers who haven't bought in 60 days with a win-back offer",
  "Create a campaign for customers in Mumbai with a special city offer",
  "Find customers who spent over ₹5000 and send them a loyalty reward",
  "Re-engage customers who visited more than 5 times but haven't bought recently",
  "Show me stats for all my campaigns"
];

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 6, marginBottom: 16 }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>X</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 8, height: 8, background: '#1e40af', borderRadius: '50%' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Message({ msg }) {
  return (
    <motion.div 
      style={{ display: 'flex', gap: 12, marginBottom: 20 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ 
        width: 40, height: 40, borderRadius: 20, 
        background: msg.role === 'ai' ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'linear-gradient(135deg, #059669, #10b981)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: 'white', fontWeight: 700, flexShrink: 0, fontSize: 14
      }}>
        {msg.role === 'ai' ? 'X' : 'You'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          background: msg.role === 'ai' ? 'var(--bg2)' : 'linear-gradient(135deg, rgba(108,99,255,.2), rgba(139,133,255,.1))',
          padding: '12px 16px', borderRadius: 12, color: 'var(--t1)',
          fontSize: 14, lineHeight: 1.6, maxWidth: '100%', wordBreak: 'break-word',
          border: msg.role === 'ai' ? '1px solid var(--bd)' : '1px solid rgba(108,99,255,.3)'
        }}>
          {msg.content.split('\n').map((line, i) => (
            <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
          ))}
        </div>
        {msg.toolsUsed?.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {msg.toolsUsed.map(t => (
              <span key={t} style={{ fontSize: 11, background: 'rgba(108,99,255,.15)', color: '#1e40af', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                🔧 {t.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Agent() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hey there! 👋 I'm XenoAI, your intelligent campaign agent.\n\nI can help you:\n• 📊 Analyze your customer base with smart insights\n• 🎯 Create precise audience segments automatically\n• ✍️ Write personalized campaigns that convert\n• 📈 Track performance with live analytics\n\nJust describe what you'd like to do in plain English!",
      toolsUsed: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const userMsg = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await api.post('/agent/chat', { messages: history });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data.reply,
        toolsUsed: res.data.toolsUsed || []
      }]);
    } catch (e) {
      const errMsg = e.response?.data?.error || 'Sorry, something went wrong. Please check that the backend is running and try again.';
      setMessages(prev => [...prev, { role: 'ai', content: errMsg, toolsUsed: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="agent-page" style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="page-header-left">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={28} style={{ color: '#1e40af' }} />
            AI Agent
          </h2>
          <p>Describe your goals in plain English — XenoAI handles everything</p>
        </div>
      </motion.div>

      <div className="agent-grid" style={{ display: 'grid', gap: 20, flex: 1, minHeight: 0 }}>
        <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--bd)' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>X</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', margin: 0 }}>XenoAI</h3>
              <p style={{ fontSize: 12, color: 'var(--t2)', margin: '4px 0 0 0' }}>🟢 Online — powered by Gemini / Groq</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20, paddingRight: 8 }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder="Describe what you'd like to do... (Shift+Enter for new line)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, padding: 12, background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 8, color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', resize: 'none', transition: 'all 0.3s ease' }}
            />
            <motion.button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ width: 44, height: 44, background: input.trim() && !loading ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'var(--bg2)', border: 'none', borderRadius: 8, color: input.trim() && !loading ? 'white' : 'var(--t3)', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', flexShrink: 0 }}
              whileHover={input.trim() && !loading ? { scale: 1.05 } : {}}
              whileTap={input.trim() && !loading ? { scale: 0.95 } : {}}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <div className="card" style={{ flex: 1, overflowY: 'auto' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={16} style={{ color: '#f59e0b' }} />
              Try asking
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <motion.button 
                  key={i} 
                  onClick={() => sendMessage(s)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                  style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', padding: '10px 12px', borderRadius: 8, color: 'var(--t1)', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s ease', lineHeight: 1.4 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          {/* FIXED: background and border are now separate style properties */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,.1), rgba(139,133,255,.05))',
            border: '1px solid rgba(108,99,255,.2)'
          }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>💡 How it works</h4>
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>
              XenoAI uses advanced AI with tool use. When you describe your goal, it automatically calls the right functions — segmenting, writing, and launching campaigns.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
