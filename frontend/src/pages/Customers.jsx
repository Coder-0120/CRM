import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Search, Users, TrendingUp, AlertCircle } from 'lucide-react';

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date)) / 86400000);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => api.get('/api/customers', { params: { search, page, limit: 20 } }).then(r => r.data),
    keepPreviousData: true
  });

  const getActivityColor = (days) => {
    if (days > 90) return { badge: 'danger', label: 'At Risk', icon: AlertCircle };
    if (days > 30) return { badge: 'warning', label: 'Inactive', icon: TrendingUp };
    return { badge: 'success', label: 'Active', icon: Users };
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
          <h2>Customers</h2>
          <p style={{ marginTop: 8 }}>
            <strong style={{ color: 'var(--p)' }}>{data?.total ?? 0}</strong> total customers in your database
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, color: 'var(--t3)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by name, email, or city…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding: '12px 14px 12px 40px',
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid var(--bd)',
                borderRadius: 12,
                fontSize: 14,
                color: 'var(--t1)',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1e40af'}
              onBlur={(e) => e.target.style.borderColor = 'var(--bd)'}
            />
          </div>
        </div>

        {isLoading ? (
          <motion.div 
            style={{ textAlign: 'center', padding: '40px 24px' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⟳</div>
            <p style={{ color: 'var(--t2)' }}>Loading customers...</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {(data?.customers || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>No customers found</h3>
                <p style={{ color: 'var(--t2)' }}>Add your first customer through Data Ingestion</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Total Spend</th>
                        <th>Visits</th>
                        <th>Activity</th>
                        <th>Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.customers || []).map((c, idx) => {
                        const activity = getActivityColor(daysSince(c.lastActiveDate));
                        const ActivityIcon = activity.icon;
                        return (
                          <motion.tr 
                            key={c._id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: 'var(--bg2)' }}
                          >
                            <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.name}</td>
                            <td style={{ fontSize: 13, color: 'var(--t2)' }}>{c.email}</td>
                            <td style={{ color: 'var(--t2)' }}>{c.city || '—'}</td>
                            <td style={{ fontWeight: 600, color: 'var(--p)' }}>₹{c.totalSpend.toLocaleString()}</td>
                            <td style={{ color: 'var(--t2)' }}>{c.visitCount}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`badge ${activity.badge}`}>
                                  {daysSince(c.lastActiveDate)}d
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {(c.tags || []).slice(0, 2).map(t => (
                                  <span key={t} className="badge" style={{ background: 'rgba(30,64,175,.15)', color: '#1e40af' }}>
                                    {t}
                                  </span>
                                ))}
                                {(c.tags || []).length > 2 && (
                                  <span className="badge" style={{ background: 'var(--bg2)', color: 'var(--t2)' }}>
                                    +{(c.tags || []).length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <motion.div
                  className="pager"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--bd)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p style={{ fontSize: 13, color: 'var(--t2)' }}>
                    Page <strong style={{ color: 'var(--t1)' }}>{page}</strong> of <strong style={{ color: 'var(--t1)' }}>{Math.ceil((data?.total || 0) / 20)}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button 
                      className="btn btn-secondary"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← Previous
                    </motion.button>
                    <motion.button 
                      className="btn btn-secondary"
                      onClick={() => setPage(p => p + 1)}
                      disabled={(data?.customers || []).length < 20}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next →
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
