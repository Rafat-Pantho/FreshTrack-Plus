import { useEffect, useState } from 'react'
import { getWasteRisk } from '../api'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

function ItemTable({ items, emptyMsg }) {
  if (!items || items.length === 0)
    return <p className="empty-msg">{emptyMsg}</p>

  return (
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
        {items.map(item => (
          <tr key={item._id}>
            <td>{item.name}</td>
            <td>{item.category}</td>
            <td>{item.quantity} {item.unit}</td>
            <td>{item.storageLocation}</td>
            <td>{fmt(item.expiryDate)}</td>
            <td>{item.daysUntilExpiry}</td>
            <td>
              <span className={`badge badge-${item.alertLevel}`}>{item.status}</span>
            </td>
            <td style={{ fontSize: 11, color: '#555' }}>{item.recommendation}</td>
          </tr>
        ))}
      </tbody>
    </table>
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

  if (loading) return <div className="loading">Analyzing waste risk…</div>
  if (error) return <div className="error-msg">{error}</div>

  const { summary, categorizedItems, insights } = data

  return (
    <div className="page">
      <h1>Waste Risk Analysis</h1>
      <p className="subtitle">Analyzed at {new Date(data.analyzedAt).toLocaleString()}</p>

      {/* Summary */}
      <div className="card-row">
        <div className="card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{summary.totalItems}</div>
        </div>
        <div className="card">
          <div className="stat-label">Expired</div>
          <div className="stat-value" style={{ color: '#c0392b' }}>{summary.expiredCount}</div>
        </div>
        <div className="card">
          <div className="stat-label">Expiring ≤ 3 days</div>
          <div className="stat-value" style={{ color: '#e67e22' }}>{summary.highRiskCount}</div>
        </div>
        <div className="card">
          <div className="stat-label">Safe</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>{summary.safeCount}</div>
        </div>
      </div>

      {/* Insights */}
      {insights?.length > 0 && (
        <>
          <div className="section-title">Insights</div>
          {insights.map((ins, i) => (
            <div key={i} className={`insight ${ins.type}`}>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-msg">{ins.message}</div>
              {ins.action && <div className="insight-action">{ins.action}</div>}
            </div>
          ))}
        </>
      )}

      {/* Expired */}
      <div className="section-title" style={{ color: '#c0392b' }}>
        Expired ({categorizedItems.expired.length})
      </div>
      <div className="card">
        <ItemTable items={categorizedItems.expired} emptyMsg="No expired items." />
      </div>

      {/* High Risk */}
      <div className="section-title" style={{ color: '#e67e22' }}>
        High Risk — Expiring Soon ({categorizedItems.highRisk.length})
      </div>
      <div className="card">
        <ItemTable items={categorizedItems.highRisk} emptyMsg="No high-risk items." />
      </div>

      {/* Safe */}
      <div className="section-title" style={{ color: '#27ae60' }}>
        Safe ({categorizedItems.safe.length})
      </div>
      <div className="card">
        <ItemTable items={categorizedItems.safe} emptyMsg="No items in safe category." />
      </div>
    </div>
  )
}
