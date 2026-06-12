import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Mail } from 'lucide-react';

export default function Dashboard() {
  const { theme } = useTheme();

  const { data: custStats } = useQuery({
    queryKey: ['custStats'],
    queryFn: () => api.get('/customers/stats').then(r => r.data),
    refetchInterval: 10000
  });

  const { data: orderStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => api.get('/orders/stats').then(r => r.data),
    refetchInterval: 10000
  });

  const { data: overview } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data),
    refetchInterval: 5000
  });

  const { data: campaignData } = useQuery({
    queryKey: ['campaignAnalytics'],
    queryFn: () => api.get('/analytics/campaigns').then(r => r.data),
    refetchInterval: 5000
  });

  const chartData = (campaignData || []).slice(0, 6).map(c => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    Delivered: c.stats?.delivered || 0,
    Opened: c.stats?.opened || 0,
    Clicked: c.stats?.clicked || 0,
  })).reverse();

  const statCards = [
    { 
      label: 'Total Customers', 
      value: custStats?.total ?? '—',
      sub: `${custStats?.newThisMonth ?? 0} new this month`,
      color: '#1e40af',
      icon: Users,
      bgGradient: 'linear-gradient(135deg, rgba(30,64,175,.08), rgba(59,130,246,.04))'
    },
    { 
      label: 'High-Value Customers', 
      value: custStats?.highValue ?? '—',
      sub: 'Spent over ₹10,000',
      color: '#059669',
      icon: Target,
      bgGradient: 'linear-gradient(135deg, rgba(5,150,105,.08), rgba(52,211,153,.04))'
    },
    { 
      label: 'At-Risk Customers', 
      value: custStats?.atRisk ?? '—',
      sub: 'Inactive 90+ days',
      color: '#d97706',
      icon: TrendingUp,
      bgGradient: 'linear-gradient(135deg, rgba(217,119,6,.08), rgba(251,146,60,.04))'
    },
    { 
      label: 'Messages Delivered', 
      value: overview?.delivered ?? '—',
      sub: `${overview?.opened ?? 0} opened · ${overview?.clicked ?? 0} clicked`,
      color: '#0891b2',
      icon: Mail,
      bgGradient: 'linear-gradient(135deg, rgba(8,145,178,.08), rgba(34,211,238,.04))'
    },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const StatCard = ({ label, value, sub, color, icon: Icon, bgGradient, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className="stat-card"
      style={{ background: bgGradient, borderColor: `${color}30` }}
      whileHover={{ y: -8, boxShadow: `0 12px 32px ${color}25` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
          <div className="stat-change up" style={{ fontSize: 12, color: 'var(--t3)' }}>{sub}</div>
        </div>
        <div style={{ 
          width: 50, 
          height: 50, 
          background: `${color}15`, 
          borderRadius: 12, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color
        }}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header-left">
          <h2>Dashboard</h2>
          <p>Real-time campaign & customer analytics</p>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} index={idx} />
        ))}
      </motion.div>

      {chartData.length > 0 && (
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 32 }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Campaign Performance</h3>
            <p style={{ fontSize: 13, color: 'var(--t2)' }}>Last 6 campaigns · Delivery metrics</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barGap={8}>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="name" stroke="var(--t3)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--t3)" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--card)', 
                  border: `1px solid var(--bd)`,
                  borderRadius: 8,
                  color: 'var(--t1)'
                }}
                cursor={{ fill: 'rgba(108,99,255,.05)' }}
              />
              <Legend wrapperStyle={{ paddingTop: 20, color: 'var(--t2)' }} />
              <Bar dataKey="Delivered" fill="url(#grad1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Opened" fill="url(#grad2)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Clicked" fill="url(#grad3)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {chartData.length === 0 && (
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 32, textAlign: 'center', padding: '60px 24px' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>No campaign data yet</h3>
          <p style={{ color: 'var(--t2)', marginBottom: 24 }}>Use the <strong>AI Agent</strong> to launch your first campaign and start tracking results in real-time</p>
        </motion.div>
      )}
    </div>
  );
}