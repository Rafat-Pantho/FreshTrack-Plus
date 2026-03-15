import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import WasteRisk from './pages/WasteRisk'
import WasteStats from './pages/WasteStats'
import MealPlan from './pages/MealPlan'
import Ingredients from './pages/Ingredients'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/waste-risk" element={<WasteRisk />} />
            <Route path="/waste-stats" element={<WasteStats />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/ingredients" element={<Ingredients />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
