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
  if (error) return <div className="error-msg" style={{color: 'var(--danger)', padding: '16px', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5'}}>{error}</div>

  const score = health?.healthScore ?? 0
  const statusColor = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="subtitle">Overview of your grocery inventory</p>

      {/* Inventory Health */}
      <h2>Inventory Health</h2>
      <div className="card-row">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ background: `${statusColor}22`, color: statusColor }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <div className="stat-value" style={{ color: statusColor }}>{score}</div>
              <div className="stat-label">Health Score</div>
            </div>
          </div>
          <div className="health-bar-wrap" style={{ height: '8px', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="health-bar" style={{ width: `${score}%`, background: statusColor, height: '100%', borderRadius: '4px', transition: 'width 1s ease-in-out' }} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Status: <b style={{ color: 'var(--text-main)' }}>{health?.status}</b></div>
        </div>
        
        <div className="card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: 'var(--info)' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A2 2 0 0 0 22 14V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16Z"></path><path d="M12 2v4"></path><path d="M12 22v-4"></path><path d="M12 16h8"></path><path d="M4 16h8"></path></svg>
          </div>
          <div className="stat-value">{health?.breakdown?.totalItems ?? 0}</div>
          <div className="stat-label">Total Items</div>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{health?.breakdown?.freshItems ?? 0}</div>
          <div className="stat-label">Fresh Items</div>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{health?.breakdown?.atRiskItems ?? 0}</div>
          <div className="stat-label">At Risk</div>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{health?.breakdown?.expiredItems ?? 0}</div>
          <div className="stat-label">Expired</div>
        </div>
      </div>

      {health?.recommendations?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2>Recommendations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {health.recommendations.map((r, i) => (
              <div key={i} style={{ padding: '16px', background: '#eff6ff', borderLeft: '4px solid var(--info)', borderRadius: '4px 8px 8px 4px', color: '#1e3a8a' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span>{r}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick waste summary */}
      <h2>Waste Risk Summary</h2>
      <div className="card-row">
        <div className="card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{risk?.summary?.expiredCount ?? 0}</div>
          <div className="stat-label">Expired Items</div>
        </div>
        <div className="card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{risk?.summary?.highRiskCount ?? 0}</div>
          <div className="stat-label">Expiring in 3 days</div>
        </div>
        <div className="card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{risk?.summary?.safeCount ?? 0}</div>
          <div className="stat-label">Safe Items</div>
        </div>
      </div>

      {risk?.insights?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2>Insights</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {risk.insights.map((ins, i) => {
              const bg = ins.type === 'critical' ? '#fee2e2' : ins.type === 'warning' ? '#fef3c7' : '#eff6ff';
              const border = ins.type === 'critical' ? 'var(--danger)' : ins.type === 'warning' ? 'var(--warning)' : 'var(--info)';
              return (
                <div key={i} style={{ padding: '20px', background: bg, borderLeft: `4px solid ${border}`, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px', color: '#111827' }}>{ins.title}</div>
                  <div style={{ color: '#4b5563', marginBottom: ins.action ? '12px' : '0' }}>{ins.message}</div>
                  {ins.action && (
                    <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '6px', fontSize: '13px', fontWeight: 500, border: `1px solid ${border}44` }}>
                      {ins.action}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <Link to="/waste-risk" className="btn btn-primary" style={{ background: 'var(--info)', boxShadow: 'none' }}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
           View full waste risk
        </Link>
        <Link to="/waste-stats" className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          View waste statistics
        </Link>
      </div>
    </div>
  )
}
