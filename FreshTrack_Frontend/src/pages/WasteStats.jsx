import { useEffect, useState } from 'react'
import { getWasteStats } from '../api'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WasteStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('30')

  const load = (p) => {
    setLoading(true)
    setError(null)
    getWasteStats({ period: p })
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(period) }, [])

  const handlePeriod = (e) => {
    setPeriod(e.target.value)
    load(e.target.value)
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Waste Statistics</h1>
          {!loading && !error && data && (
            <p className="subtitle" style={{ marginBottom: 0 }}>
              {fmt(data.period.start)} — {fmt(data.period.end)} ({data.period.days} days)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Period:</label>
          <select value={period} onChange={handlePeriod} style={{ width: 'auto', border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading" style={{ height: '40vh' }}>Loading statistics…</div>}
      {error && <div className="error-msg" style={{ padding: '16px', background: '#fee2e2', color: 'var(--danger)', borderRadius: '8px', border: '1px solid #fca5a5' }}>{error}</div>}

      {!loading && !error && data && (
        <>
          {/* Totals */}
          <div className="card-row">
            <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div className="stat-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{data.totals?.totalItems ?? 0}</div>
              <div className="stat-label">Total Items Wasted</div>
            </div>
            <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              </div>
              <div className="stat-value" style={{ color: '#92400e' }}>{data.totals?.totalQuantity ?? 0}</div>
              <div className="stat-label">Total Quantity Wasted</div>
            </div>
            <div className="card" style={{ background: '#f8fafc' }}>
              <div className="stat-icon" style={{ background: '#e2e8f0', color: '#475569' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div className="stat-value" style={{ color: '#334155' }}>{data.dailyAverage}</div>
              <div className="stat-label" style={{ textTransform: 'none' }}>items/day</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
            {/* By Reason */}
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--info)' }}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                By Reason
              </h2>
              {data.byReason?.length > 0 ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Reason</th>
                        <th>Occurrences</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byReason.map(r => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: 500 }}>{r._id}</td>
                          <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>{r.count}</span></td>
                          <td>{r.totalQuantity.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="empty-msg" style={{ background: 'white', padding: '32px', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>No waste data for this period.</p>}
            </div>

            {/* Most Wasted Items */}
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warning)' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Most Wasted Items (Top 5)
              </h2>
              {data.mostWastedItems?.length > 0 ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Occurrences</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.mostWastedItems.map((item, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{item._id?.name ?? item._id ?? '—'}</td>
                          <td><span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>{item.count}</span></td>
                          <td>{item.totalQuantity?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="empty-msg" style={{ background: 'white', padding: '32px', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>No waste items found.</p>}
            </div>
          </div>

          {/* Recent Logs */}
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             Recent Waste Logs
          </h2>
          {data.recentLogs?.length > 0 ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Reason</th>
                      <th>Quantity</th>
                      <th>Date Logged</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLogs.map(log => (
                      <tr key={log._id}>
                        <td style={{ fontWeight: 500 }}>{log.item?.name ?? '—'}</td>
                        <td><span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', background: '#f3f4f6', fontSize: '13px', color: '#4b5563' }}>{log.reason}</span></td>
                        <td>{log.quantity}</td>
                        <td style={{ color: '#6b7280' }}>{fmt(log.dateLogged)}</td>
                        <td style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>{log.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <p className="empty-msg" style={{ background: 'white', padding: '32px', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>No recent logs.</p>}
        </>
      )}
    </div>
  )
}
