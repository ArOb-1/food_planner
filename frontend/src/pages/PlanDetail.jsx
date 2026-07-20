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

  useEffect(() => { fetchPlan() }, [id])

  useEffect(() => {
    if (!plan || plan.status === 'completed' || plan.status === 'failed') return
    const interval = setInterval(async () => {
      try {
        const { data } = await client.get(`/plans/${id}`)
        setPlan(data)
        if (data.status === 'completed') toast.success('План готов!')
        if (data.status === 'failed') toast.error('Ошибка генерации')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!plan) {
    return <div className="p-8 text-center text-gray-500">План не найден</div>
  }

  const backUrl = plan.group_id ? `/groups/${plan.group_id}` : '/plans'
  const backLabel = plan.group_id ? '← Назад к группе' : '← Назад к списку'

  const mealEmojis = {
    'завтрак': '🥐', 'обед': '🍲', 'ужин': '🍝', 'перекус': '🍎',
    'breakfast': '🥐', 'lunch': '🍲', 'dinner': '🍝', 'snack': '🍎',
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to={backUrl} className="text-green-600 hover:underline text-sm mb-4 inline-block">
        {backLabel}
      </Link>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">План питания</h1>
      <p className="text-gray-500 mb-8">
        {plan.days} {plan.days === 1 ? 'день' : plan.days < 5 ? 'дня' : 'дней'}
        {plan.cooking_time ? ` · до ${plan.cooking_time} мин` : ''}
        {plan.cuisine ? ` · ${plan.cuisine} кухня` : ''}
      </p>

      {plan.status === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🍳</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Готовим ваш план</h2>
          <p className="text-gray-400">Нейросеть подбирает блюда с учётом ваших предпочтений</p>
        </div>
      )}

      {plan.status === 'failed' && (
        <div className="bg-red-50 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Не удалось создать план</h2>
          <Link to="/generate" className="inline-block mt-4 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600">
            Попробовать снова
          </Link>
        </div>
      )}

      {plan.status === 'completed' && plan.plan_data?.days?.map((day, di) => (
        <div key={di} className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">День {day.day}</h2>
          <div className="space-y-4">
            {day.meals?.map((meal, mi) => (
              <div key={mi} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mealEmojis[meal.type] || '🍽️'}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{meal.name}</h3>
                      <span className="text-xs text-gray-400 uppercase">{meal.type}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">⏱ {meal.cooking_time} мин</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {meal.ingredients?.map((ing, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                      {ing}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{meal.recipe}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {plan.status === 'completed' && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-8">
          <h3 className="font-semibold text-gray-800 mb-4">Что изменить в плане?</h3>
          <textarea
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={3}
            placeholder="Например: добавь больше рыбы, убери молочное..."
          />
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {regenerating ? 'Перегенерируем...' : 'Перегенерировать'}
          </button>
        </div>
      )}
    </div>
  )
}