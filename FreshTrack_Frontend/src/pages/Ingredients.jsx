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
    <div className="page">
      <h1>Available Ingredients</h1>
      <p className="subtitle">Browse grocery items available for a given meal type and dietary preferences.</p>

      <div className="card">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label>Meal Type</label>
            <select value={mealType} onChange={handleMealType} style={{ width: 'auto' }}>
              {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Dietary Filters</label>
            <div className="checkbox-group" style={{ marginBottom: 0 }}>
              {DIETARY_OPTIONS.map(d => (
                <label key={d}>
                  <input type="checkbox" checked={dietary.includes(d)} onChange={() => toggleDiet(d)} />
                  {d}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading ingredients…</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && data && (
        <>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
            Showing <b>{data.availableCount}</b> item(s) for <b>{data.mealType}</b>
            {data.dietaryPreferences?.length > 0 && <> · Filters: {data.dietaryPreferences.join(', ')}</>}
          </div>

          {data.ingredients?.length > 0 ? (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Expiry</th>
                    <th>Days Left</th>
                    <th>Est. Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ingredients.map(item => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{fmt(item.expiryDate)}</td>
                      <td>
                        <span style={{ color: daysColor(item.daysUntilExpiry), fontWeight: 600 }}>
                          {item.daysUntilExpiry}
                        </span>
                      </td>
                      <td>{item.estimatedCalories} kcal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-msg">No ingredients available for the selected criteria.</p>
          )}
        </>
      )}
    </div>
  )
}
