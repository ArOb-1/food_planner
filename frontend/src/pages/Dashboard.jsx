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

  if (!user) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  )

  const stats = [
    { label: 'Аллергии', value: user.allergies?.length || 0, color: 'bg-red-50 text-red-600' },
    { label: 'Любимые', value: user.liked_products?.length || 0, color: 'bg-green-50 text-green-600' },
    { label: 'Ненавистные', value: user.hated_products?.length || 0, color: 'bg-gray-100 text-gray-600' },
    { label: 'Нелюбимые', value: user.disliked_products?.length || 0, color: 'bg-yellow-50 text-yellow-600' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Приветствие */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Привет{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 text-lg">{user.email}</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-sm font-bold mb-3`}>
              {value}
            </div>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Профиль */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Ваши предпочтения</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Аллергии" value={user.allergies?.join(', ') || '—'} />
          <InfoRow label="Любимые" value={user.liked_products?.join(', ') || '—'} />
          <InfoRow label="Ненавистные" value={user.hated_products?.join(', ') || '—'} />
          <InfoRow label="Нелюбимые" value={user.disliked_products?.join(', ') || '—'} />
          <InfoRow label="Город" value={user.location || '—'} />
        </div>
      </div>

      {/* Действия */}
      <div className="flex gap-4 flex-wrap">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:border-green-300 hover:text-green-600 transition-all shadow-sm"
        >
          Редактировать профиль
        </Link>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200"
        >
          Сгенерировать план
        </Link>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  )
}