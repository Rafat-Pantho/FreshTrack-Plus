import { useEffect, useState } from 'react'
import { getWasteRisk } from '../api'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function ItemTable({ items, emptyMsg }) {
  if (!items || items.length === 0)
    return <p className="empty-msg" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>{emptyMsg}</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Storage</th>
            <th>Expiry</th>
            <th>Days</th>
            <th>Status</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isRed = item.daysUntilExpiry < 0;
            const isYellow = item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 3;
            
            return (
            <tr key={item._id}>
              <td style={{ fontWeight: 500 }}>{item.name}</td>
              <td style={{ color: '#6b7280' }}>{item.category}</td>
              <td>{item.quantity} {item.unit}</td>
              <td><span style={{ display: 'inline-flex', alignItems: 'center', background: '#f3f4f6', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>{item.storageLocation}</span></td>
              <td style={{ color: '#6b7280' }}>{fmt(item.expiryDate)}</td>
              <td>
                <span style={{ 
                  color: isRed ? 'var(--danger)' : isYellow ? 'var(--warning)' : 'var(--success)',
                  fontWeight: 700 
                }}>
                  {item.daysUntilExpiry} 
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>days</span>
              </td>
              <td>
                <span className={`badge badge-${item.alertLevel}`}>{item.status}</span>
              </td>
              <td style={{ fontSize: '13px', color: '#4b5563', maxWidth: '250px', lineHeight: 1.4 }}>{item.recommendation}</td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function WasteRisk() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getWasteRisk()
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading" style={{ height: '50vh' }}>Analyzing waste risk…</div>
  if (error) return <div className="error-msg" style={{ padding: '16px', background: '#fee2e2', border: '1px solid #fca5a5', color: 'var(--danger)', borderRadius: '8px' }}>{error}</div>

  const { summary, categorizedItems, insights } = data

  return (
    <div className="page">
      <h1>Waste Risk Analysis</h1>
      <p className="subtitle">Last analyzed: {new Date(data.analyzedAt).toLocaleString()}</p>

      {/* Summary */}
      <div className="card-row">
        <div className="card" style={{ background: '#f8fafc' }}>
          <div className="stat-label">Total Items tracked</div>
          <div className="stat-value">{summary.totalItems}</div>
        </div>
        <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div className="stat-label" style={{ color: '#991b1b' }}>Expired</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{summary.expiredCount}</div>
        </div>
        <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="stat-label" style={{ color: '#92400e' }}>Expiring ≤ 3 days</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{summary.highRiskCount}</div>
        </div>
        <div className="card" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div className="stat-label" style={{ color: '#065f46' }}>Safe</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{summary.safeCount}</div>
        </div>
      </div>

      {/* Insights */}
      {insights?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2>Key Insights</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {insights.map((ins, i) => {
              const border = ins.type === 'critical' ? 'var(--danger)' : ins.type === 'warning' ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={i} className={`card insight ${ins.type}`} style={{ marginBottom: 0, borderLeft: `4px solid ${border}` }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827', marginBottom: '8px' }}>{ins.title}</div>
                  <div style={{ color: '#4b5563', fontSize: '14px', marginBottom: ins.action ? '12px' : 0 }}>{ins.message}</div>
                  {ins.action && <div style={{ display: 'inline-block', fontSize: '13px', fontWeight: 500, padding: '4px 10px', background: '#f3f4f6', borderRadius: '4px', color: '#374151' }}>💡 {ins.action}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Expired */}
      <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        Expired <span style={{ background: '#fee2e2', padding: '2px 8px', borderRadius: '20px', fontSize: '14px' }}>{categorizedItems.expired.length}</span>
      </h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <ItemTable items={categorizedItems.expired} emptyMsg="Awesome! You have no expired items." />
      </div>

      {/* High Risk */}
      <h2 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        High Risk — Expiring Soon <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '20px', fontSize: '14px' }}>{categorizedItems.highRisk.length}</span>
      </h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <ItemTable items={categorizedItems.highRisk} emptyMsg="No high-risk items right now. Looking good!" />
      </div>

      {/* Safe */}
      <h2 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        Safe <span style={{ background: '#d1fae5', padding: '2px 8px', borderRadius: '20px', fontSize: '14px' }}>{categorizedItems.safe.length}</span>
      </h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <ItemTable items={categorizedItems.safe} emptyMsg="No items in safe category." />
      </div>
    </div>
  )
}
