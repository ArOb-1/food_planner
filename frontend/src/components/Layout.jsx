import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 bg-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-8 flex justify-between items-center text-sm text-gray-400">
          <span>© 2026 MealPlan AI</span>
          <Link to="/donate" className="hover:text-green-600 transition-colors">
            Поддержать проект
          </Link>
        </div>
      </footer>
    </div>
  )
}