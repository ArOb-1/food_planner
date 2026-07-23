import { useState } from 'react'
import RecipeModal from './RecipeModal'

export default function MealCard({ meal }) {
  const [showRecipe, setShowRecipe] = useState(false)

  const hasFullRecipe = !!meal.full_recipe

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5
                      hover:shadow-md transition-shadow duration-200">

        {/* Тип приёма пищи */}
        <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
          {meal.type}
        </p>

        {/* Название + кнопка */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-gray-900 font-bold text-lg leading-tight">
            {meal.name}
          </h3>

          {hasFullRecipe && (
            <button
              onClick={() => setShowRecipe(true)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold
                         text-green-600 bg-green-50 hover:bg-green-100
                         px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              <span>📖</span>
              Рецепт
            </button>
          )}
        </div>

        {/* Краткие ингредиенты из AI (не из MealDB) */}
        {meal.ingredients && (
          <p className="text-gray-400 text-sm mt-2">
            {Array.isArray(meal.ingredients)
              ? meal.ingredients.join(', ')
              : meal.ingredients}
          </p>
        )}

        {/* Время готовки */}
        {meal.cooking_time && (
          <div className="flex items-center gap-1 mt-3 text-gray-400 text-xs">
            <span>⏱</span>
            <span>{meal.cooking_time} мин</span>
          </div>
        )}

        {/* Тег — рецепт найден в базе */}
        {hasFullRecipe && (
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600
                          bg-emerald-50 px-2.5 py-1 rounded-full">
            <span>✓</span> Рецепт из базы
          </div>
        )}
      </div>

      {/* Модал — рендерится вне карточки через портал если нужно */}
      {showRecipe && (
        <RecipeModal
          recipe={meal.full_recipe}
          mealName={meal.name}
          onClose={() => setShowRecipe(false)}
        />
      )}
    </>
  )
}