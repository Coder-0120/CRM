import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
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

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>TrendVault CRM — live overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="label">Total Customers</div>
          <div className="value">{custStats?.total ?? '—'}</div>
          <div className="sub">{custStats?.newThisMonth ?? 0} new this month</div>
        </div>
        <div className="stat-card green">
          <div className="label">High-Value</div>
          <div className="value">{custStats?.highValue ?? '—'}</div>
          <div className="sub">Spent over ₹10,000</div>
        </div>
        <div className="stat-card amber">
          <div className="label">At-Risk</div>
          <div className="value">{custStats?.atRisk ?? '—'}</div>
          <div className="sub">Inactive 90+ days</div>
        </div>
        <div className="stat-card purple">
          <div className="label">Total Campaigns</div>
          <div className="value">{overview?.totalCampaigns ?? '—'}</div>
          <div className="sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="label">Total Revenue</div>
          <div className="value">₹{orderStats?.totalRevenue ? (orderStats.totalRevenue / 1000).toFixed(0) + 'K' : '—'}</div>
          <div className="sub">Avg ₹{orderStats?.avgOrderValue ?? 0}/order</div>
        </div>
        <div className="stat-card amber">
          <div className="label">Messages Delivered</div>
          <div className="value">{overview?.delivered ?? 0}</div>
          <div className="sub">{overview?.opened ?? 0} opened · {overview?.clicked ?? 0} clicked</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <div className="card-title">Campaign performance</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="Delivered" fill="#7c6af7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Opened"    fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Clicked"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="card">
          <div className="empty-state">
            No campaign data yet. Use the <strong>AI Agent</strong> to launch your first campaign!
          </div>
        </div>
      )}
    </div>
  );
}