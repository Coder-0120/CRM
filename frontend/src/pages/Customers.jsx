import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date)) / 86400000);
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => api.get('/customers', { params: { search, page, limit: 20 } }).then(r => r.data),
    keepPreviousData: true
  });

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <p>{data?.total ?? 0} total customers</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <input
            className="search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {isLoading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Total Spend</th>
                  <th>Visits</th>
                  <th>Last Active</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {(data?.customers || []).map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: '#6b7280' }}>{c.email}</td>
                    <td>{c.city}</td>
                    <td>₹{c.totalSpend.toLocaleString()}</td>
                    <td>{c.visitCount}</td>
                    <td>
                      <span className={`badge ${daysSince(c.lastActiveDate) > 90 ? 'badge-red' : daysSince(c.lastActiveDate) > 30 ? 'badge-amber' : 'badge-green'}`}>
                        {daysSince(c.lastActiveDate)}d ago
                      </span>
                    </td>
                    <td>
                      {(c.tags || []).map(t => (
                        <span key={t} className="badge badge-purple" style={{ marginRight: 4 }}>{t}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <span style={{ fontSize: 13, color: '#6b7280', lineHeight: '28px' }}>Page {page}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={(data?.customers || []).length < 20}>Next</button>
        </div>
      </div>
    </div>
  );
}