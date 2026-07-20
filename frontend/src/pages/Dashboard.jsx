import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    client.get('/users/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.clear()
        window.location.href = '/login'
      })
  }, [])

  if (!user) return <div className="p-8">Загрузка...</div>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Привет, {user.email}!</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Ваш профиль</h2>
        <p><strong>Аллергии:</strong> {user.allergies?.join(', ') || 'не указаны'}</p>
        <p><strong>Любимые:</strong> {user.liked_products?.join(', ') || 'не указаны'}</p>
        <p><strong>Ненавистные:</strong> {user.hated_products?.join(', ') || 'не указаны'}</p>
        <p><strong>Нелюбимые:</strong> {user.disliked_products?.join(', ') || 'не указаны'}</p>
        <p><strong>Локация:</strong> {user.location || 'не указана'}</p>
      </div>

      <div className="flex gap-4">
        <Link to="/profile" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
          Редактировать профиль
        </Link>
        <Link to="/generate" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Сгенерировать план
        </Link>
      </div>
    </div>
  )
}