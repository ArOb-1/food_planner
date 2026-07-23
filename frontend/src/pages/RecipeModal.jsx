import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export default function RecipeModal({ recipe, mealName, onClose }) {
  // Закрытие по Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!recipe) return null

  const steps = recipe.instructions
    ? recipe.instructions
        .split(/\n+/)
        .map(s => s.trim())
        .filter(Boolean)
    : []

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl
                     max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          {/* Thumbnail */}
          {recipe.thumbnail && (
            <div className="relative h-52 flex-shrink-0 overflow-hidden">
              <img
                src={recipe.thumbnail}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Заголовок поверх картинки */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">
                  {recipe.category} · {recipe.area}
                </p>
                <h2 className="text-white text-2xl font-bold leading-tight">
                  {recipe.name}
                </h2>
                {recipe.original_name && recipe.original_name !== recipe.name && (
                  <p className="text-white/60 text-sm mt-0.5">{recipe.original_name}</p>
                )}
              </div>
            </div>
          )}

          {/* Без картинки — просто заголовок */}
          {!recipe.thumbnail && (
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <p className="text-green-600 text-xs font-medium uppercase tracking-widest mb-1">
                {recipe.category} · {recipe.area}
              </p>
              <h2 className="text-gray-900 text-2xl font-bold">{recipe.name}</h2>
              {recipe.original_name && (
                <p className="text-gray-400 text-sm mt-0.5">{recipe.original_name}</p>
              )}
            </div>
          )}

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/30 hover:bg-black/50
                       backdrop-blur-sm rounded-full flex items-center justify-center
                       text-white transition-colors"
          >
            ✕
          </button>

          {/* Контент — скроллится */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Ингредиенты */}
            {recipe.ingredients?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Ингредиенты
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Приготовление */}
            {steps.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Приготовление
                </h3>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white
                                   text-xs font-bold flex items-center justify-center mt-0.5"
                      >
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
              <a
                href={recipe.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-50
                           border border-red-100 hover:bg-red-100 transition-colors group"
              >
                <span className="text-2xl">▶️</span>
                <div>
                  <p className="text-red-600 font-semibold text-sm">Видео-рецепт на YouTube</p>
                  <p className="text-red-400 text-xs">Нажмите, чтобы посмотреть</p>
                </div>
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}