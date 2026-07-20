import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import toast from 'react-hot-toast'

export default function PlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [correction, setCorrection] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const fetchPlan = async () => {
    try {
      const { data } = await client.get(`/plans/${id}`)
      setPlan(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [id])

  useEffect(() => {
    if (!plan || plan.status === 'completed' || plan.status === 'failed') return

    const interval = setInterval(async () => {
      try {
        const { data } = await client.get(`/plans/${id}`)
        setPlan(data)
        if (data.status === 'completed') {
          toast.success('План готов!')
        } else if (data.status === 'failed') {
          toast.error('Ошибка генерации')
        }
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [plan?.status, id])

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const { data } = await client.post('/plans/generate', {
        days: plan.days,
        is_group: !!plan.group_id,
        group_id: plan.group_id || null,
        cooking_time: plan.cooking_time,
        meals: plan.meals,
        available_products: plan.available_products,
        cuisine: plan.cuisine,
        correction_prompt: correction || null,
      })
      if (data.id) {
        setCorrection('')
        navigate(`/plans/${data.id}`)
      }
    } catch {
      toast.error('Ошибка перегенерации')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>
  if (!plan) return <div className="p-8">План не найден</div>

  const backUrl = plan.group_id ? `/groups/${plan.group_id}` : '/plans'
  const backLabel = plan.group_id ? '← Назад к группе' : '← Назад к списку'

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to={backUrl} className="text-green-600 hover:underline text-sm mb-4 inline-block">
        {backLabel}
      </Link>
      <h1 className="text-2xl font-bold mb-6">
        План питания на {plan.days} {plan.days === 1 ? 'день' : plan.days < 5 ? 'дня' : 'дней'}
      </h1>

      {plan.status === 'pending' && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Генерируем план...</p>
          <p className="text-sm text-gray-400 mt-1">Это займёт 10-15 секунд</p>
        </div>
      )}

      {plan.status === 'failed' && (
        <div className="bg-red-50 rounded-xl p-6 mb-6 text-center">
          <p className="text-red-600">Ошибка генерации</p>
          <Link to="/generate" className="text-green-600 hover:underline text-sm mt-2 inline-block">
            Попробовать снова
          </Link>
        </div>
      )}

      {plan.status === 'completed' && plan.plan_data?.days?.map(day => (
        <div key={day.day} className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-green-700 mb-4">День {day.day}</h2>
          {day.meals?.map((meal, i) => (
            <div key={i} className="border-l-4 border-green-500 pl-4 mb-4">
              <p className="font-semibold text-lg">{meal.name}</p>
              <p className="text-sm text-gray-500">{meal.type} | ⏱ {meal.cooking_time} мин</p>
              <p className="text-sm text-gray-600 mt-2"><strong>Ингредиенты:</strong> {meal.ingredients?.join(', ')}</p>
              <p className="text-sm text-gray-700 mt-1">{meal.recipe}</p>
            </div>
          ))}
        </div>
      ))}

      {plan.status === 'completed' && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h3 className="font-semibold mb-3">Что изменить в плане?</h3>
          <textarea
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
            rows={3}
            placeholder="Например: добавь больше рыбы, убери молочное, сделай завтраки сытнее..."
          />
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {regenerating ? 'Перегенерируем...' : 'Перегенерировать'}
          </button>
        </div>
      )}
    </div>
  )
}