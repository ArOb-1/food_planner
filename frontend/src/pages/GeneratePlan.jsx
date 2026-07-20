import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import toast from 'react-hot-toast'

export default function GeneratePlan() {
  const [days, setDays] = useState(7)
  const [cookingTime, setCookingTime] = useState('')
  const [meals, setMeals] = useState(['breakfast', 'lunch', 'dinner'])
  const [availableProducts, setAvailableProducts] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const toggleMeal = (meal) => {
    setMeals(prev =>
      prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const { data } = await client.post('/plans/generate', {
        days,
        is_group: false,
        cooking_time: cookingTime ? Number(cookingTime) : null,
        meals,
        available_products: availableProducts || null,
        cuisine: cuisine || null,
      })
      if (data.id) {
        navigate(`/plans/${data.id}`)
      }
    } catch {
      toast.error('Ошибка генерации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Сгенерировать план питания</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">На сколько дней?</label>
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="w-full p-3 border rounded-lg">
            <option value={1}>1 день</option>
            <option value={3}>3 дня</option>
            <option value={7}>7 дней</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Время на готовку (минут)</label>
          <select value={cookingTime} onChange={e => setCookingTime(e.target.value)}
            className="w-full p-3 border rounded-lg">
            <option value="">Без ограничений</option>
            <option value="15">15 минут</option>
            <option value="30">30 минут</option>
            <option value="60">1 час</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Приёмы пищи</label>
          <div className="flex gap-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
              <label key={meal} className="flex items-center gap-1">
                <input type="checkbox" checked={meals.includes(meal)} onChange={() => toggleMeal(meal)} />
                {meal === 'breakfast' ? 'Завтрак' : meal === 'lunch' ? 'Обед' : meal === 'dinner' ? 'Ужин' : 'Перекус'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Что есть под рукой?</label>
          <input value={availableProducts} onChange={e => setAvailableProducts(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="курица, рис, помидоры" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Предпочитаемая кухня</label>
          <select value={cuisine} onChange={e => setCuisine(e.target.value)}
            className="w-full p-3 border rounded-lg">
            <option value="">Без предпочтений</option>
            <option value="русская">Русская</option>
            <option value="итальянская">Итальянская</option>
            <option value="азиатская">Азиатская</option>
          </select>
        </div>

        <button onClick={handleGenerate} disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Генерируем ваш план...' : 'Сгенерировать'}
      </button>
      </div>
    </div>
  )
}