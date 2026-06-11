import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

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
    <div className="message ai">
      <div className="msg-avatar ai">X</div>
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function Message({ msg }) {
  return (
    <div className={`message ${msg.role}`}>
      <div className={`msg-avatar ${msg.role}`}>
        {msg.role === 'ai' ? 'X' : 'M'}
      </div>
      <div>
        <div className="msg-bubble">
          {msg.content.split('\n').map((line, i) => (
            <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
          ))}
        </div>
        {msg.toolsUsed?.length > 0 && (
          <div className="msg-tools">
            {msg.toolsUsed.map(t => (
              <span key={t} className="tool-tag">{t.replace(/_/g, ' ')}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Agent() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hi! I'm XenoAI, your campaign agent for TrendVault.\n\nI can help you:\n• Analyze your customer base\n• Create smart audience segments\n• Write and send personalized campaigns\n• Track campaign performance\n\nJust tell me what you want to do in plain English!",
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
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, something went wrong. Please check that the backend is running.',
        toolsUsed: []
      }]);
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
    <div>
      <div className="page-header">
        <h2>AI Agent</h2>
        <p>Describe what you want in plain English — XenoAI handles the rest</p>
      </div>

      <div className="agent-layout">
        <div className="chat-panel">
          <div className="chat-header">
            <div className="agent-avatar">X</div>
            <div className="chat-header-info">
              <h3>XenoAI</h3>
              <p>● Online — powered by Claude</p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              ref={textareaRef}
              className="chat-input"
              rows={1}
              placeholder="e.g. Send a win-back campaign to customers inactive for 90 days…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="suggestions-panel">
          <div className="suggestions-card">
            <h4>Try asking</h4>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="suggestion-btn" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="suggestions-card">
            <h4>How it works</h4>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              XenoAI uses Claude with tool use. When you describe your goal, it automatically calls the right CRM functions — segmenting customers, writing messages, and launching campaigns — all in one step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}