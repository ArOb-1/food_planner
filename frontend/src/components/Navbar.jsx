import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const token = localStorage.getItem('access_token')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-green-600">
        MealPlan AI
      </Link>
      <div className="space-x-4">
        {token ? (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-green-600">Личный кабинет</Link>
            <Link to="/plans" className="text-gray-600 hover:text-green-600">Мои планы</Link>
            <button onClick={handleLogout} className="text-red-500 hover:underline">Выйти</button>
            <Link to="/groups" className="text-gray-600 hover:text-green-600">Группы</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-green-600">Войти</Link>
            <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}