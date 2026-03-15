import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Fresh<span>Track</span>+</div>
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/waste-risk" className={({ isActive }) => isActive ? 'active' : ''}>Waste Risk</NavLink>
        <NavLink to="/waste-stats" className={({ isActive }) => isActive ? 'active' : ''}>Waste Stats</NavLink>
        <NavLink to="/meal-plan" className={({ isActive }) => isActive ? 'active' : ''}>Meal Plan</NavLink>
        <NavLink to="/ingredients" className={({ isActive }) => isActive ? 'active' : ''}>Ingredients</NavLink>
      </nav>
    </aside>
  )
}
