import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export default function Segments() {
  const { data: segments, isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then(r => r.data),
    refetchInterval: 5000
  });

  return (
    <div>
      <div className="page-header">
        <h2>Audience Segments</h2>
        <p>Created by you or by the AI Agent</p>
      </div>

      {isLoading ? <div className="spinner" /> : (
        <div className="card">
          {(!segments || segments.length === 0) ? (
            <div className="empty-state">No segments yet. Ask the AI Agent to create one!</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Audience Size</th>
                    <th>Logic</th>
                    <th>Rules</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: '#6b7280', maxWidth: 200 }}>{s.description || '—'}</td>
                      <td>
                        <span className="badge badge-purple">{s.audienceSize} customers</span>
                      </td>
                      <td>
                        <span className={`badge ${s.logicOperator === 'OR' ? 'badge-amber' : 'badge-blue'}`}>
                          {s.logicOperator}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#6b7280', maxWidth: 220 }}>
                        {(s.rules || []).map((r, i) => (
                          <div key={i}>{r.field} {r.operator} {String(r.value)}</div>
                        ))}
                      </td>
                      <td style={{ color: '#6b7280' }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}