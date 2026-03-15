import { useState, useEffect } from 'react'
import { getIngredients } from '../api'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const DIETARY_OPTIONS = [
  'Vegan', 'Vegetarian', 'Dairy-Free', 'Gluten-Free',
  'Pescatarian', 'Keto', 'Paleo',
]

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

function daysColor(days) {
  if (days < 0) return '#c0392b'
  if (days <= 3) return '#e67e22'
  return '#27ae60'
}

export default function Ingredients() {
  const [mealType, setMealType] = useState('Lunch')
  const [dietary, setDietary] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = (mt, dp) => {
    setLoading(true)
    setError(null)
    getIngredients(mt, dp)
      .then(r => setData(r))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(mealType, dietary) }, [])

  const toggleDiet = val => {
    const next = dietary.includes(val) ? dietary.filter(x => x !== val) : [...dietary, val]
    setDietary(next)
    load(mealType, next)
  }

  const handleMealType = e => {
    setMealType(e.target.value)
    load(e.target.value, dietary)
  }

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50', margin: '0 0 8px 0' }}>Available Ingredients</h1>
        <p className="subtitle" style={{ color: '#7f8c8d', fontSize: '1.1rem', margin: 0 }}>Browse grocery items available for a given meal type and dietary preferences.</p>
      </header>

      <div className="card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, color: '#34495e' }}>Meal Type</label>
            <select value={mealType} onChange={handleMealType} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '1rem', cursor: 'pointer', outline: 'none' }}>
              {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, color: '#34495e' }}>Dietary Filters</label>
            <div className="checkbox-group" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', minHeight: '40px' }}>
              {DIETARY_OPTIONS.map(d => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', backgroundColor: dietary.includes(d) ? '#ebf5fb' : 'transparent', padding: '6px 12px', borderRadius: '20px', border: dietary.includes(d) ? '1px solid #3498db' : '1px solid #e0e0e0', transition: 'all 0.2s', color: dietary.includes(d) ? '#2980b9' : '#555' }}>
                  <input type="checkbox" checked={dietary.includes(d)} onChange={() => toggleDiet(d)} style={{ display: 'none' }} />
                  {d}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="loading" style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Loading ingredients…</div>}
      {error && <div className="error-msg" style={{ padding: '16px', backgroundColor: '#fdeedc', color: '#e74c3c', borderRadius: '8px', border: '1px solid #fadbd8' }}>{error}</div>}

      {!loading && !error && data && (
        <>
          <div style={{ fontSize: '0.95rem', color: '#7f8c8d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Showing <b style={{ color: '#2c3e50' }}>{data.availableCount}</b> item(s) for <b style={{ color: '#2c3e50' }}>{data.mealType}</b></span>
            {data.dietaryPreferences?.length > 0 && <span>• Filters: {data.dietaryPreferences.join(', ')}</span>}
          </div>

          {data.ingredients?.length > 0 ? (
            <div className="card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: '#4a5568', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '16px 20px', color: '#4a5568', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '16px 20px', color: '#4a5568', fontWeight: 600 }}>Quantity</th>
                      <th style={{ padding: '16px 20px', color: '#4a5568', fontWeight: 600 }}>Expiry</th>
                      <th style={{ padding: '16px 20px', color: '#4a5568', fontWeight: 600 }}>Days Left</th>
                      <th style={{ padding: '16px 20px', color: '#4a5568', fontWeight: 600 }}>Est. Calories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ingredients.map((item, idx) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #edf2f7', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafbfc' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 500, color: '#2d3748' }}>{item.name}</td>
                        <td style={{ padding: '16px 20px', color: '#718096' }}>{item.category}</td>
                        <td style={{ padding: '16px 20px', color: '#4a5568' }}>{item.quantity} {item.unit}</td>
                        <td style={{ padding: '16px 20px', color: '#718096' }}>{fmt(item.expiryDate)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            color: daysColor(item.daysUntilExpiry), 
                            fontWeight: 600,
                            backgroundColor: item.daysUntilExpiry <= 3 ? (item.daysUntilExpiry < 0 ? '#fdeced' : '#fef4e8') : '#eef8f2',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-block'
                          }}>
                            {item.daysUntilExpiry} {item.daysUntilExpiry === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#4a5568' }}>{item.estimatedCalories} kcal</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: '#f8f9fa', borderRadius: '12px', color: '#a0aec0' }}>
              <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', color: '#cbd5e0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>No ingredients available for the selected criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
