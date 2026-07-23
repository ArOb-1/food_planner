import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../api/client'
import toast from 'react-hot-toast'
import { usePdf } from '../components/PdfContext' 

const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const IconClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconBook = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const MEAL_EMOJIS = {
  завтрак: '🥐', обед: '🍲', ужин: '🍝', перекус: '🍎',
  breakfast: '🥐', lunch: '🍲', dinner: '🍝', snack: '🍎',
}

const MEAL_COLORS = {
  завтрак: 'bg-amber-50 text-amber-700 border-amber-200',
  обед:    'bg-blue-50 text-blue-700 border-blue-200',
  ужин:    'bg-purple-50 text-purple-700 border-purple-200',
  перекус: 'bg-green-50 text-green-700 border-green-200',
  breakfast:'bg-amber-50 text-amber-700 border-amber-200',
  lunch:   'bg-blue-50 text-blue-700 border-blue-200',
  dinner:  'bg-purple-50 text-purple-700 border-purple-200',
  snack:   'bg-green-50 text-green-700 border-green-200',
}

function RecipeModal({ recipe, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const steps = recipe.instructions
    ? recipe.instructions.split(/\n+/).map(s => s.trim()).filter(Boolean)
    : []

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl
                     max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          {/* Thumbnail */}
          {recipe.thumbnail ? (
            <div className="relative h-56 flex-shrink-0">
              <img
                src={recipe.thumbnail}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {recipe.category && (
                  <span className="inline-block text-white/70 text-xs font-semibold
                                   uppercase tracking-widest mb-2">
                    {recipe.category}{recipe.area ? ` · ${recipe.area}` : ''}
                  </span>
                )}
                <h2 className="text-white text-2xl font-bold leading-tight">{recipe.name}</h2>
                {recipe.original_name && recipe.original_name !== recipe.name && (
                  <p className="text-white/50 text-sm mt-1">{recipe.original_name}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <p className="text-green-600 text-xs font-semibold uppercase tracking-widest mb-1">
                {recipe.category}{recipe.area ? ` · ${recipe.area}` : ''}
              </p>
              <h2 className="text-gray-900 text-2xl font-bold">{recipe.name}</h2>
            </div>
          )}

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full
                       bg-black/30 hover:bg-black/50 backdrop-blur-sm
                       flex items-center justify-center text-white text-lg
                       transition-colors leading-none"
          >
            ✕
          </button>

          {/* Скроллируемый контент */}
          <div className="flex-1 overflow-y-auto">

            {/* Ингредиенты */}
            {recipe.ingredients?.length > 0 && (
              <div className="p-6 border-b border-gray-50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Ингредиенты
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i}
                      className="flex items-center gap-2.5 bg-gray-50
                                 rounded-xl px-3 py-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Приготовление */}
            {steps.length > 0 && (
              <div className="p-6 border-b border-gray-50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Приготовление
                </h3>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500
                                       text-white text-xs font-bold flex items-center
                                       justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube */}
            {recipe.youtube && (
              <div className="p-6">
                <a
                  href={recipe.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-red-50
                             border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <span className="text-3xl">▶️</span>
                  <div>
                    <p className="text-red-600 font-semibold text-sm">Видео-рецепт</p>
                    <p className="text-red-400 text-xs mt-0.5">Смотреть на YouTube</p>
                  </div>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function MealCard({ meal, index }) {
  const [showRecipe, setShowRecipe] = useState(false)
  const hasRecipe = !!meal.full_recipe
  const typeColor = MEAL_COLORS[meal.type] || 'bg-gray-50 text-gray-600 border-gray-200'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100
                   hover:border-green-200 hover:shadow-md
                   transition-all duration-200 overflow-hidden"
      >
        {/* Thumbnail из MealDB если есть */}
        {meal.full_recipe?.thumbnail && (
          <div className="h-36 overflow-hidden relative">
            <img
              src={meal.full_recipe.thumbnail}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        )}

        <div className="p-5">
          {/* Хедер карточки */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">
                {MEAL_EMOJIS[meal.type] || '🍽️'}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                  {meal.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                                   border ${typeColor}`}>
                    {meal.type}
                  </span>
                  {hasRecipe && (
                    <span className="text-xs text-emerald-600 bg-emerald-50
                                     px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ из базы
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Время + кнопка рецепта */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {meal.cooking_time && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <IconClock />
                  {meal.cooking_time} мин
                </span>
              )}
              {hasRecipe && (
                <button
                  onClick={() => setShowRecipe(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold
                             text-green-600 bg-green-50 hover:bg-green-100
                             px-3 py-1.5 rounded-xl transition-colors border border-green-200"
                >
                  <IconBook />
                  Рецепт
                </button>
              )}
            </div>
          </div>

          {/* Ингредиенты — чипсы */}
          {meal.ingredients?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {meal.ingredients.map((ing, i) => (
                <span key={i}
                  className="px-2.5 py-1 bg-gray-50 text-gray-500
                             text-xs rounded-lg border border-gray-100">
                  {ing}
                </span>
              ))}
            </div>
          )}

          {/* AI-рецепт (краткий) */}
          {meal.recipe && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
              {meal.recipe}
            </p>
          )}
        </div>
      </motion.div>

      {/* Модал */}
      {showRecipe && (
        <RecipeModal
          recipe={meal.full_recipe}
          onClose={() => setShowRecipe(false)}
        />
      )}
    </>
  )
}

export default function PlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [correction, setCorrection] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const { startPdfGeneration, getPlanPdfStatus } = usePdf()
  const pdfStatus = getPlanPdfStatus(id)  

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
    if (!plan || plan.status !== 'pending') return

    const token = localStorage.getItem('access_token')
    const ws = new WebSocket(`ws://localhost:8000/ws/plans/${id}?token=${token}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.status === 'completed' || data.status === 'failed') {
        fetchPlan()
        ws.close()
      }
    }

    ws.onerror = () => {
      const interval = setInterval(() => {
        client.get(`/plans/${id}`).then(({ data }) => {
          if (data.status !== 'pending') {
            fetchPlan()
            clearInterval(interval)
          }
        })
      }, 3000)
    }

    return () => ws.close()
  }, [plan?.status, id])

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const { data } = await client.post('/plans/generate', {
        days:               plan.days,
        is_group:           !!plan.group_id,
        group_id:           plan.group_id || null,
        cooking_time:       plan.cooking_time,
        meals:              plan.meals,
        available_products: plan.available_products,
        cuisine:            plan.cuisine,
        correction_prompt:  correction || null,
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

  const handleGeneratePdf = () => startPdfGeneration(id)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-green-500
                        border-t-transparent rounded-full" />
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────
  if (!plan) {
    return (
      <div className="p-8 pt-24 text-center text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-medium">План не найден</p>
        <Link to="/plans" className="text-green-600 hover:underline text-sm mt-2 inline-block">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const token    = localStorage.getItem('access_token')
  const backUrl  = plan.group_id ? `/groups/${plan.group_id}` : '/plans'
  const backLabel = plan.group_id ? 'Назад к группе' : 'Назад к планам'

  const daysLabel = plan.days === 1 ? 'день'
    : plan.days < 5 ? 'дня'
    : 'дней'
  const PdfButton = () => {
    if (pdfStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400
                        bg-white border border-gray-200 px-4 py-2 rounded-xl
                        cursor-not-allowed">
          <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-green-500
                          rounded-full animate-spin" />
          Генерируем PDF...
        </div>
      )
    }

    if (pdfStatus === 'error') {
      return (
        <button
          onClick={handleGeneratePdf}
          className="flex items-center gap-2 text-sm text-red-500
                     bg-red-50 border border-red-200 px-4 py-2 rounded-xl
                     hover:bg-red-100 transition-colors"
        >
          <IconDownload />
          Ошибка — повторить
        </button>
      )
    }

    return (
      <button
        onClick={handleGeneratePdf}
        className="flex items-center gap-2 text-sm text-gray-500
                   hover:text-green-600 transition-colors
                   bg-white border border-gray-200 hover:border-green-300
                   px-4 py-2 rounded-xl"
      >
        <IconDownload />
        Скачать PDF
      </button>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pt-24">

      <div className="flex justify-between items-center mb-8">
        <Link
          to={backUrl}
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-green-600 transition-colors"
        >
          <IconArrowLeft />
          {backLabel}
        </Link>
        <PdfButton />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          План питания
        </h1>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-sm text-gray-500
                           bg-white border border-gray-200 px-3 py-1 rounded-full">
            📅 {plan.days} {daysLabel}
          </span>
          {plan.cooking_time && (
            <span className="inline-flex items-center gap-1 text-sm text-gray-500
                             bg-white border border-gray-200 px-3 py-1 rounded-full">
              ⏱ до {plan.cooking_time} мин
            </span>
          )}
          {plan.cuisine && (
            <span className="inline-flex items-center gap-1 text-sm text-gray-500
                             bg-white border border-gray-200 px-3 py-1 rounded-full">
              🍴 {plan.cuisine} кухня
            </span>
          )}
        </div>
      </motion.div>

      {plan.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-100 p-16 text-center"
        >
          <motion.div
            className="text-5xl mb-5"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            🍳
          </motion.div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Готовим ваш план</h2>
          <p className="text-gray-400 mb-6">
            Нейросеть подбирает блюда с учётом ваших предпочтений
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {plan.status === 'failed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 rounded-3xl border border-red-100 p-12 text-center"
        >
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Не удалось создать план</h2>
          <p className="text-red-400 mb-6 text-sm">Попробуйте сгенерировать заново</p>
          <Link
            to="/generate"
            className="inline-block bg-red-500 hover:bg-red-600 text-white
                       px-8 py-3 rounded-2xl font-semibold transition-colors"
          >
            Попробовать снова
          </Link>
        </motion.div>
      )}

      {plan.status === 'completed' && plan.plan_data?.days?.map((day, di) => (
        <div key={di} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white
                            flex items-center justify-center text-sm font-bold flex-shrink-0">
              {day.day}
            </div>
            <h2 className="text-lg font-bold text-gray-800">День {day.day}</h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-3">
            {day.meals?.map((meal, mi) => (
              <MealCard key={mi} meal={meal} index={mi} />
            ))}
          </div>
        </div>
      ))}

      {plan.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 mt-4"
        >
          <h3 className="font-bold text-gray-800 mb-1">Хотите что-то изменить?</h3>
          <p className="text-sm text-gray-400 mb-4">
            Опишите правки — AI перегенерирует план с учётом пожеланий
          </p>
          <textarea
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl mb-4
                       outline-none focus:ring-2 focus:ring-green-400
                       focus:border-transparent resize-none text-sm
                       text-gray-700 placeholder-gray-300 transition-all"
            rows={3}
            placeholder="Например: добавь больше рыбы, убери молочное, сделай завтраки сытнее..."
          />
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white px-6 py-3 rounded-2xl font-semibold
                       transition-colors text-sm"
          >
            {regenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent
                                rounded-full animate-spin" />
                Перегенерируем...
              </>
            ) : (
              <>
                🔄 Перегенерировать
              </>
            )}
          </button>
        </motion.div>
      )}

      <div className="h-12" />
    </div>
  )
}