import { useState,useEffect } from 'react';
import { useQuery,useQueryClient  } from '@tanstack/react-query';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Search, Users, TrendingUp, AlertCircle,Trash2 } from 'lucide-react';

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date)) / 86400000);
}

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05, delayChildren: 0.1 },
//   },
// };

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Customers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);
  const handleDelete = async (id, name) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${name}?`
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/customers/${id}`);

    queryClient.invalidateQueries({
      queryKey: ['customers']
    });

  } catch (err) {
    console.error(err);
    alert('Failed to delete customer');
  }
};

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => api.get('/customers', { params: { search, page, limit: 20 } }).then(r => r.data),
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

        {isMobile ? (
  <div className="customer-cards">
    {(data?.customers || []).map((c) => {
      const activity = getActivityColor(daysSince(c.lastActiveDate));

      return (
        <motion.div
          key={c._id}
          className="customer-mobile-card"
          variants={rowVariants}
        >
          <div className="customer-card-header">
            <h3>{c.name}</h3>

            <button
              onClick={() => handleDelete(c._id, c.name)}
              className="delete-btn"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <p><strong>Email:</strong> {c.email}</p>
          <p><strong>City:</strong> {c.city || '—'}</p>
          <p><strong>Total Spend:</strong> ₹{c.totalSpend.toLocaleString()}</p>
          <p><strong>Visits:</strong> {c.visitCount}</p>

          <div style={{ marginTop: 10 }}>
            <span className={`badge ${activity.badge}`}>
              {daysSince(c.lastActiveDate)}d
            </span>
          </div>
        </motion.div>
      );
    })}
  </div>
) : (
  <div className="customer-table-wrapper">
     <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Total Spend</th>
                        <th>Visits</th>
                        <th>Activity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.customers || []).map((c, idx) => {
                        const activity = getActivityColor(daysSince(c.lastActiveDate));

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
  <motion.button
    onClick={() => handleDelete(c._id, c.name)}
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    style={{
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: '#ef4444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Trash2 size={18} />
  </motion.button>
</td>
                           
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
  </div>
)}

       
      </motion.div>
    </div>
  );
}