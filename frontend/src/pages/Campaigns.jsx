import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Mail, MessageSquare, MessageCircle } from 'lucide-react';

function DeliveryBar({ stats }) {
  const total = stats?.total || 0;
  if (total === 0) return <span style={{ color: 'var(--t3)', fontSize: 12 }}>No data</span>;
  const delivPct = Math.round((stats.delivered / total) * 100);
  const openPct = stats.delivered ? Math.round((stats.opened / stats.delivered) * 100) : 0;
  const clickPct = stats.opened ? Math.round((stats.clicked / stats.opened) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <motion.div
          style={{ flex: 1, minWidth: 100 }}
          whileHover={{ scale: 1.05 }}
        >
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sent</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>{stats.sent}</div>
        </motion.div>
        <motion.div
          style={{ flex: 1, minWidth: 100 }}
          whileHover={{ scale: 1.05 }}
        >
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivered</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{stats.delivered}</div>
        </motion.div>
        <motion.div
          style={{ flex: 1, minWidth: 100 }}
          whileHover={{ scale: 1.05 }}
        >
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opened</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{stats.opened} <span style={{ fontSize: 13, color: 'var(--t3)' }}>({openPct}%)</span></div>
        </motion.div>
        <motion.div
          style={{ flex: 1, minWidth: 100 }}
          whileHover={{ scale: 1.05 }}
        >
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clicked</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{stats.clicked} <span style={{ fontSize: 13, color: 'var(--t3)' }}>({clickPct}%)</span></div>
        </motion.div>
        {stats.failed > 0 && (
          <motion.div
            style={{ flex: 1, minWidth: 100 }}
            whileHover={{ scale: 1.05 }}
          >
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{stats.failed}</div>
          </motion.div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Progress</div>
        <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,.1)' }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6c63ff, #8b85ff)',
              borderRadius: 99,
              width: `${delivPct}%`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${delivPct}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t3)' }}>
        <span>{delivPct}% delivery rate</span>
        <span>{openPct}% open rate</span>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Campaigns() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
    refetchInterval: 3000
  });

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={18} color="#059669" />;
    if (status === 'sending') return <Send size={18} color="#d97706" />;
    return <AlertCircle size={18} color="#6b7280" />;
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'sending') return 'warning';
    return 'secondary';
  };

  const getChannelIcon = (ch) => {
    if (ch === 'email') return <Mail size={18} />;
    if (ch === 'sms') return <MessageSquare size={18} />;
    if (ch === 'whatsapp') return <MessageCircle size={18} />;
    return <Send size={18} />;
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header-left">
          <h2>Campaigns</h2>
          <p>Live delivery stats — auto-refreshes every 3 seconds</p>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          style={{ textAlign: 'center', padding: '60px 24px' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⟳</div>
          <p style={{ color: 'var(--t2)' }}>Loading campaigns...</p>
        </motion.div>
      ) : (
        <>
          {(!campaigns || campaigns.length === 0) ? (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', padding: '60px 24px' }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>No campaigns yet</h3>
              <p style={{ color: 'var(--t2)' }}>Ask the AI Agent to create your first campaign — describe your goal in natural language</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {campaigns.map((c, idx) => (
                <motion.div
                  key={c._id}
                  className="card"
                  variants={cardVariants}
                  whileHover={{ boxShadow: 'var(--sh2)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--bd)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ color: 'var(--p)' }}>
                          {getChannelIcon(c.channel)}
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{c.name}</h3>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--t2)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>Segment: <strong>{c.segmentId?.name || 'Unknown'}</strong></span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getStatusIcon(c.status)}
                      <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status === 'completed' ? 'Completed' : c.status === 'sending' ? 'Sending…' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(108,99,255,.08), rgba(139,133,255,.04))',
                    border: '1px solid rgba(108,99,255,.2)',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 20,
                    borderLeft: '4px solid #6c63ff'
                  }}>
                    <p style={{ fontSize: 14, color: 'var(--t1)', fontStyle: 'italic', margin: 0 }}>
                      "{c.message}"
                    </p>
                  </div>

                  <DeliveryBar stats={c.stats} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}