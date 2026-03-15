import { useEffect, useState } from 'react'
import { getWasteStats } from '../api'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
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
      <h1>Waste Statistics</h1>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{ marginBottom: 0 }}>Period:</label>
        <select value={period} onChange={handlePeriod} style={{ width: 'auto' }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 365 days</option>
        </select>
      </div>

      {loading && <div className="loading">Loading statistics…</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && data && (
        <>
          <p className="subtitle">
            {fmt(data.period.start)} — {fmt(data.period.end)} ({data.period.days} days)
          </p>

          {/* Totals */}
          <div className="card-row">
            <div className="card">
              <div className="stat-label">Total Items Wasted</div>
              <div className="stat-value">{data.totals?.totalItems ?? 0}</div>
            </div>
            <div className="card">
              <div className="stat-label">Total Quantity Wasted</div>
              <div className="stat-value">{data.totals?.totalQuantity ?? 0}</div>
            </div>
            <div className="card">
              <div className="stat-label">Daily Average</div>
              <div className="stat-value">{data.dailyAverage}</div>
              <div className="stat-label">items/day</div>
            </div>
          </div>

          {/* By Reason */}
          <div className="section-title">By Reason</div>
          {data.byReason?.length > 0 ? (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th>Times Logged</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byReason.map(r => (
                    <tr key={r._id}>
                      <td>{r._id}</td>
                      <td>{r.count}</td>
                      <td>{r.totalQuantity.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No waste data for this period.</p>}

          {/* Most Wasted Items */}
          <div className="section-title">Most Wasted Items (Top 5)</div>
          {data.mostWastedItems?.length > 0 ? (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Times Logged</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostWastedItems.map((item, i) => (
                    <tr key={i}>
                      <td>{item._id?.name ?? item._id ?? '—'}</td>
                      <td>{item.count}</td>
                      <td>{item.totalQuantity?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No waste items found.</p>}

          {/* Recent Logs */}
          <div className="section-title">Recent Waste Logs</div>
          {data.recentLogs?.length > 0 ? (
            <div className="card">
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
                      <td>{log.item?.name ?? '—'}</td>
                      <td>{log.reason}</td>
                      <td>{log.quantity}</td>
                      <td>{fmt(log.dateLogged)}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{log.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No recent logs.</p>}
        </>
      )}
    </div>
  )
}
