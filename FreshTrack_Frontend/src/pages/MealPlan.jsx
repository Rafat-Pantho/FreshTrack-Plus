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
        <h2 style={{ marginBottom: '20px' }}>Your Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Weight (kg)</label>
            <input className="input" style={{ width: '100%' }} name="weight" type="number" value={form.weight} onChange={handleChange} placeholder="e.g. 70" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Height (cm)</label>
            <input className="input" style={{ width: '100%' }} name="height" type="number" value={form.height} onChange={handleChange} placeholder="e.g. 175" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Age</label>
            <input className="input" style={{ width: '100%' }} name="age" type="number" value={form.age} onChange={handleChange} placeholder="e.g. 28" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Gender</label>
            <select className="input" style={{ width: '100%' }} name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Activity Level</label>
            <select className="input" style={{ width: '100%' }} name="activityLevel" value={form.activityLevel} onChange={handleChange}>
              {ACTIVITY_LEVELS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>Dietary Preferences</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          {DIETARY_OPTIONS.map(d => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', backgroundColor: dietary.includes(d) ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-color)', padding: '8px 16px', borderRadius: '20px', border: dietary.includes(d) ? '1px solid var(--secondary)' : '1px solid var(--border-color)', transition: 'all 0.2s', color: dietary.includes(d) ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '14px' }}>
              <input type="checkbox" checked={dietary.includes(d)} onChange={() => toggleDiet(d)} style={{ display: 'none' }} />
              {d}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }} onClick={handleTDEE} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            Calculate TDEE
          </button>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Generate Meal Plan
          </button>
        </div>
      </div>

      {loading && <div className="loading">Working…</div>}
      {error && <div className="error-msg">{error}</div>}

      {tdeeResult && (
        <div style={{ marginBottom: '32px' }}>
          <h2>TDEE Calculation</h2>
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <div style={{ fontSize: '14px', color: '#bfdbfe', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              <span>BMR: <b style={{ color: 'white' }}>{tdeeResult.bmr} kcal</b> &nbsp;·&nbsp; Activity: ×{tdeeResult.activityLevel}</span>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              {tdeeResult.tdee} <span style={{ fontSize: '18px', fontWeight: 500, color: '#bfdbfe' }}>kcal / day</span>
            </div>
            <div style={{ fontSize: '14px', color: '#dbeafe', marginBottom: '24px' }}>{tdeeResult.activityDescription}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breakfast</span><b style={{ fontSize: '18px' }}>{tdeeResult.breakdown.breakfast} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>kcal</span></b></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lunch</span><b style={{ fontSize: '18px' }}>{tdeeResult.breakdown.lunch} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>kcal</span></b></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dinner</span><b style={{ fontSize: '18px' }}>{tdeeResult.breakdown.dinner} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>kcal</span></b></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Snack</span><b style={{ fontSize: '18px' }}>{tdeeResult.breakdown.snack} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>kcal</span></b></div>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '16px', textAlign: 'right' }}>Formula: {tdeeResult.formula?.equation}</div>
          </div>
        </div>
      )}

      {/* Meal Plan Result */}
      {result && (
        <>
          <h2>Generated Meal Plan <span style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500 }}>— {result.mealPlan?.date}</span></h2>

          {/* Calorie info */}
          <div className="card-row">
            <div className="card" style={{ background: '#f8fafc' }}>
              <div className="stat-label">Target</div>
              <div className="stat-value" style={{ color: 'var(--text-main)' }}>{result.calorieCalculation?.tdee}</div>
              <div className="stat-label" style={{ textTransform: 'none' }}>kcal/day</div>
            </div>
            <div className="card" style={{ background: '#f8fafc' }}>
              <div className="stat-label">Plan Total</div>
              <div className="stat-value" style={{ color: 'var(--info)' }}>{result.mealPlan?.summary?.totalCalories}</div>
              <div className="stat-label" style={{ textTransform: 'none' }}>kcal</div>
            </div>
            <div className="card" style={{ background: '#f8fafc' }}>
              <div className="stat-label">Variance</div>
              <div className="stat-value" style={{ color: result.mealPlan?.summary?.withinTolerance ? 'var(--success)' : 'var(--warning)' }}>{result.mealPlan?.summary?.variancePercent}%</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>
                <span className={`badge ${result.mealPlan?.summary?.withinTolerance ? 'badge-safe' : 'badge-warning'}`}>
                  {result.mealPlan?.summary?.withinTolerance ? 'Within range' : 'Outside ±10%'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3>Recommendations</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{ padding: '16px', background: r.type === 'suggestion' ? '#fef3c7' : '#eff6ff', borderLeft: `4px solid ${r.type === 'suggestion' ? 'var(--warning)' : 'var(--info)'}`, borderRadius: '4px 8px 8px 4px' }}>
                    <div style={{ color: r.type === 'suggestion' ? '#92400e' : '#1e40af', fontWeight: 500 }}>{r.message}</div>
                    {r.action && <div style={{ fontSize: '13px', marginTop: '8px', color: '#6b7280' }}>↳ {r.action}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {result.mealPlan?.meals?.map((meal, i) => (
              <div key={i} className="card" style={{ marginBottom: 0, overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '6px 12px', background: 'var(--info)', color: 'white', borderRadius: '20px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal.name}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{meal.estimatedCalories} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>kcal</span></span>
                    <span style={{ color: 'var(--border-color)' }}>|</span>
                    <span style={{ color: 'var(--text-muted)' }}>target {meal.targetCalories} kcal</span>
                    {meal.dietaryTags?.length > 0 && meal.dietaryTags.map(tag => (
                      <span key={tag} style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{tag}</span>
                    ))}
                    <span className={`badge ${meal.calorieMatch ? 'badge-safe' : 'badge-warning'}`} style={{ marginLeft: '8px' }}>
                      {meal.calorieMatch ? '✓ Target Met' : '⚠ Off Target'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  {meal.ingredients?.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Ingredients To Use</div>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {meal.ingredients.map((ing, j) => (
                          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: 600, color: '#111827' }}>{ing.itemDetails?.name ?? '—'}</span>
                              <span style={{ padding: '2px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Qty: {ing.quantityUsed}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                              <span><b style={{ color: '#374151' }}>~{ing.caloriesContributed}</b> kcal</span>
                              {ing.itemDetails?.expiryDate && <span>Exp: {fmt(ing.itemDetails.expiryDate)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '8px' }}>No ingredients tracked for this meal.</div>
                  )}

                  {meal.recipeInstructions && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#92400e' }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Instructions
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>{meal.recipeInstructions}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
