import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

function DeliveryBar({ stats }) {
  const total = stats?.total || 0;
  if (total === 0) return <span style={{ color: '#6b7280', fontSize: 12 }}>No data</span>;
  const delivPct = Math.round((stats.delivered / total) * 100);
  const openPct  = stats.delivered ? Math.round((stats.opened / stats.delivered) * 100) : 0;

  return (
    <div>
      <div className="stats-bar">
        <span className="stats-bar-item"><strong>{stats.sent}</strong> sent</span>
        <span className="stats-bar-item"><strong>{stats.delivered}</strong> delivered</span>
        <span className="stats-bar-item"><strong>{stats.opened}</strong> opened</span>
        <span className="stats-bar-item"><strong>{stats.clicked}</strong> clicked</span>
        {stats.failed > 0 && <span className="stats-bar-item" style={{ color: '#ef4444' }}><strong>{stats.failed}</strong> failed</span>}
      </div>
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${delivPct}%` }} />
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
          {delivPct}% delivery · {openPct}% open rate
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
    refetchInterval: 3000
  });

  const statusBadge = (status) => {
    if (status === 'completed') return <span className="badge badge-green">Completed</span>;
    if (status === 'sending')   return <span className="badge badge-amber">Sending…</span>;
    return <span className="badge badge-gray">Draft</span>;
  };

  const channelBadge = (ch) => {
    const map = { email: 'badge-blue', sms: 'badge-purple', whatsapp: 'badge-green' };
    return <span className={`badge ${map[ch] || 'badge-gray'}`}>{ch}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Campaigns</h2>
        <p>Live delivery stats — auto-refreshes every 3 seconds</p>
      </div>

      {isLoading ? <div className="spinner" /> : (
        <>
          {(!campaigns || campaigns.length === 0) ? (
            <div className="card">
              <div className="empty-state">No campaigns yet. Ask the AI Agent to create one!</div>
            </div>
          ) : campaigns.map(c => (
            <div className="card" key={c._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                    Segment: {c.segmentId?.name || 'Unknown'} · {channelBadge(c.channel)} · {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {statusBadge(c.status)}
              </div>

              <div style={{ fontSize: 13, color: '#374151', background: '#f9fafb', padding: '8px 12px', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid #7c6af7' }}>
                "{c.message}"
              </div>

              <DeliveryBar stats={c.stats} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}