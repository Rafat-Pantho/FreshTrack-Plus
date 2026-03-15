import { useState } from 'react'
import { generateMealPlan, calculateTDEE } from '../api'

const ACTIVITY_LEVELS = [
  { value: 1.2,   label: 'Sedentary (little/no exercise)' },
  { value: 1.375, label: 'Lightly active (1–3 days/week)' },
  { value: 1.55,  label: 'Moderately active (3–5 days/week)' },
  { value: 1.725, label: 'Very active (6–7 days/week)' },
  { value: 1.9,   label: 'Extra active (physical job)' },
]

const DIETARY_OPTIONS = [
  'Vegan', 'Vegetarian', 'Dairy-Free', 'Gluten-Free',
  'Pescatarian', 'Keto', 'Paleo',
]

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

export default function MealPlan() {
  const [form, setForm] = useState({
    weight: '', height: '', age: '', gender: 'male', activityLevel: 1.55,
  })
  const [dietary, setDietary] = useState([])
  const [result, setResult] = useState(null)
  const [tdeeResult, setTdeeResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const toggleDiet = val => setDietary(d =>
    d.includes(val) ? d.filter(x => x !== val) : [...d, val]
  )

  const payload = () => ({
    weight: parseFloat(form.weight),
    height: parseFloat(form.height),
    age: parseInt(form.age),
    gender: form.gender,
    activityLevel: parseFloat(form.activityLevel),
    dietaryPreferences: dietary,
  })

  const handleTDEE = async e => {
    e.preventDefault()
    setError(null)
    setTdeeResult(null)
    setLoading(true)
    try {
      const r = await calculateTDEE(payload())
      setTdeeResult(r.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async e => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const r = await generateMealPlan(payload())
      setResult(r)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Meal Plan Generator</h1>
      <p className="subtitle">Generate a personalized daily meal plan based on your profile and available grocery items.</p>

      <div className="card">
        <h2>Your Profile</h2>
        <div className="form-grid">
          <div>
            <label>Weight (kg)</label>
            <input name="weight" type="number" value={form.weight} onChange={handleChange} placeholder="e.g. 70" />
          </div>
          <div>
            <label>Height (cm)</label>
            <input name="height" type="number" value={form.height} onChange={handleChange} placeholder="e.g. 175" />
          </div>
          <div>
            <label>Age</label>
            <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="e.g. 28" />
          </div>
          <div>
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label>Activity Level</label>
            <select name="activityLevel" value={form.activityLevel} onChange={handleChange}>
              {ACTIVITY_LEVELS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label style={{ marginBottom: 6 }}>Dietary Preferences</label>
        <div className="checkbox-group">
          {DIETARY_OPTIONS.map(d => (
            <label key={d}>
              <input type="checkbox" checked={dietary.includes(d)} onChange={() => toggleDiet(d)} />
              {d}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleTDEE} disabled={loading}>Calculate TDEE</button>
          <button onClick={handleGenerate} disabled={loading}>Generate Meal Plan</button>
        </div>
      </div>

      {loading && <div className="loading">Working…</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* TDEE Result */}
      {tdeeResult && (
        <>
          <div className="section-title">TDEE Calculation</div>
          <div className="tdee-result">
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
              BMR: <b>{tdeeResult.bmr} kcal</b> &nbsp;·&nbsp; Activity: ×{tdeeResult.activityLevel}
            </div>
            <div className="main-val">{tdeeResult.tdee} kcal / day</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{tdeeResult.activityDescription}</div>
            <div className="tdee-breakdown">
              <span>Breakfast: <b>{tdeeResult.breakdown.breakfast} kcal</b></span>
              <span>Lunch: <b>{tdeeResult.breakdown.lunch} kcal</b></span>
              <span>Dinner: <b>{tdeeResult.breakdown.dinner} kcal</b></span>
              <span>Snack: <b>{tdeeResult.breakdown.snack} kcal</b></span>
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{tdeeResult.formula?.equation}</div>
          </div>
        </>
      )}

      {/* Meal Plan Result */}
      {result && (
        <>
          <div className="section-title">Generated Meal Plan — {result.mealPlan?.date}</div>

          {/* Calorie info */}
          <div className="card-row">
            <div className="card">
              <div className="stat-label">Target</div>
              <div className="stat-value">{result.calorieCalculation?.tdee}</div>
              <div className="stat-label">kcal/day</div>
            </div>
            <div className="card">
              <div className="stat-label">Plan Total</div>
              <div className="stat-value">{result.mealPlan?.summary?.totalCalories}</div>
              <div className="stat-label">kcal</div>
            </div>
            <div className="card">
              <div className="stat-label">Variance</div>
              <div className="stat-value">{result.mealPlan?.summary?.variancePercent}%</div>
              <div className="stat-label">
                <span className={`badge ${result.mealPlan?.summary?.withinTolerance ? 'badge-safe' : 'badge-warning'}`}>
                  {result.mealPlan?.summary?.withinTolerance ? 'Within range' : 'Outside ±10%'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <>
              <div className="section-title">Plan Recommendations</div>
              {result.recommendations.map((r, i) => (
                <div key={i} className={`insight ${r.type}`}>
                  <div className="insight-msg">{r.message}</div>
                  {r.action && <div className="insight-action">{r.action}</div>}
                </div>
              ))}
            </>
          )}

          {/* Meals */}
          {result.mealPlan?.meals?.map((meal, i) => (
            <div key={i} className="meal-card">
              <h3>{meal.name}</h3>
              <div className="meal-meta">
                {meal.estimatedCalories} kcal &nbsp;·&nbsp; target {meal.targetCalories} kcal
                {meal.dietaryTags?.length > 0 && (
                  <> &nbsp;·&nbsp; {meal.dietaryTags.join(', ')}</>
                )}
                {' '}
                <span className={`badge ${meal.calorieMatch ? 'badge-safe' : 'badge-warning'}`}>
                  {meal.calorieMatch ? 'On target' : 'Off target'}
                </span>
              </div>

              {meal.ingredients?.length > 0 ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Ingredients:</div>
                  <ul className="ingredient-list">
                    {meal.ingredients.map((ing, j) => (
                      <li key={j}>
                        {ing.itemDetails?.name ?? '—'}
                        {' '}×{ing.quantityUsed}
                        <span style={{ color: '#888', marginLeft: 8 }}>
                          ~{ing.caloriesContributed} kcal &nbsp;|&nbsp; exp: {fmt(ing.itemDetails?.expiryDate)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="empty-msg" style={{ padding: '6px 0' }}>No ingredients available.</p>
              )}

              {meal.recipeInstructions && (
                <div className="recipe-box">{meal.recipeInstructions}</div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
