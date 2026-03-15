import { useEffect, useState } from 'react'
import { getInventoryHealth, getWasteRisk } from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [health, setHealth] = useState(null)
  const [risk, setRisk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getInventoryHealth(), getWasteRisk()])
      .then(([h, r]) => {
        setHealth(h.data)
        setRisk(r.data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard…</div>
  if (error) return <div className="error-msg">{error}</div>

  const score = health?.healthScore ?? 0
  const statusColor = score >= 80 ? '#27ae60' : score >= 60 ? '#f39c12' : score >= 40 ? '#e67e22' : '#c0392b'

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="subtitle">Overview of your grocery inventory</p>

      {/* Inventory Health */}
      <h2>Inventory Health</h2>
      <div className="card-row">
        <div className="card">
          <div className="stat-label">Health Score</div>
          <div className="stat-value" style={{ color: statusColor }}>{score}</div>
          <div className="health-bar-wrap">
            <div className="health-bar" style={{ width: `${score}%`, background: statusColor }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 12 }}>Status: <b>{health?.status}</b></div>
        </div>
        <div className="card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{health?.breakdown?.totalItems ?? 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Fresh Items</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>{health?.breakdown?.freshItems ?? 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">At Risk</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>{health?.breakdown?.atRiskItems ?? 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Expired</div>
          <div className="stat-value" style={{ color: '#c0392b' }}>{health?.breakdown?.expiredItems ?? 0}</div>
        </div>
      </div>

      {health?.recommendations?.length > 0 && (
        <>
          <div className="section-title">Recommendations</div>
          {health.recommendations.map((r, i) => (
            <div key={i} className="insight info">
              <div className="insight-msg">{r}</div>
            </div>
          ))}
        </>
      )}

      {/* Quick waste summary */}
      <div className="section-title">Waste Risk Summary</div>
      <div className="card-row">
        <div className="card">
          <div className="stat-label">Expired Items</div>
          <div className="stat-value" style={{ color: '#c0392b' }}>{risk?.summary?.expiredCount ?? 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Expiring in 3 days</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>{risk?.summary?.highRiskCount ?? 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Safe Items</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>{risk?.summary?.safeCount ?? 0}</div>
        </div>
      </div>

      {risk?.insights?.length > 0 && (
        <>
          <div className="section-title">Insights</div>
          {risk.insights.map((ins, i) => (
            <div key={i} className={`insight ${ins.type}`}>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-msg">{ins.message}</div>
              {ins.action && <div className="insight-action">{ins.action}</div>}
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: 20, fontSize: 13, color: '#888' }}>
        → <Link to="/waste-risk" style={{ color: '#1a56a0' }}>View full waste risk</Link> &nbsp;|&nbsp;
        <Link to="/waste-stats" style={{ color: '#1a56a0' }}>View waste statistics</Link>
      </div>
    </div>
  )
}
