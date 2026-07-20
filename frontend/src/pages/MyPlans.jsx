import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function MyPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/plans/')
      .then(({ data }) => setPlans(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Удалить план?')) return
    await client.delete(`/plans/${id}`)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div className="p-8">Загрузка...</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Мои планы питания</h1>

      {plans.length === 0 ? (
        <p className="text-gray-500">У вас пока нет планов. <Link to="/generate" className="text-green-600 underline">Создать первый</Link></p>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">{new Date(plan.created_at).toLocaleDateString('ru-RU')}</p>
                  <p className="font-medium">{plan.days} {plan.days === 1 ? 'день' : plan.days < 5 ? 'дня' : 'дней'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                  plan.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {plan.status === 'completed' ? 'Готов' : plan.status === 'failed' ? 'Ошибка' : 'В процессе'}
                </span>
              </div>
              <div className="flex gap-2 text-sm text-gray-500">
                {plan.cooking_time && <span>⏱ {plan.cooking_time} мин</span>}
                {plan.cuisine && <span>🍽 {plan.cuisine}</span>}
                <span>📋 {plan.meals?.length || 0} приёмов</span>
              </div>
              <div className="flex gap-4 mt-3">
                {plan.status !== 'failed' && (
                  <Link
                    to={`/plans/${plan.id}`}
                    className="text-green-600 hover:underline text-sm font-medium"
                  >
                    {plan.status === 'completed' ? 'Посмотреть план →' : 'Смотреть статус →'}
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}