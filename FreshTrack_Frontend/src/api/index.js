const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// Analytics
export const getInventoryHealth = () => request('/analytics/inventory-health')
export const getWasteRisk = () => request('/analytics/waste-risk')
export const getWasteStats = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/analytics/waste-stats${q ? '?' + q : ''}`)
}

// Meal Plan
export const getIngredients = (mealType, dietaryPreferences = []) => {
  const q = new URLSearchParams({
    mealType,
    ...(dietaryPreferences.length ? { dietaryPreferences: dietaryPreferences.join(',') } : {}),
  }).toString()
  return request(`/meal-plan/ingredients?${q}`)
}

export const calculateTDEE = (body) =>
  request('/meal-plan/calculate-tdee', { method: 'POST', body: JSON.stringify(body) })

export const generateMealPlan = (body) =>
  request('/meal-plan/generate', { method: 'POST', body: JSON.stringify(body) })
