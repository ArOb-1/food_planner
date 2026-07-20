import { Link } from 'react-router-dom'

export default function Landing() {
  const token = localStorage.getItem('access_token')

  return (
    <div className="min-h-[90vh] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Бейдж */}
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Работает на YandexGPT
        </div>

        {/* Заголовок */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 max-w-3xl leading-tight animate-fade-in">
          План питания, который учитывает{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">
            вас
          </span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-xl text-gray-500 mb-10 max-w-xl animate-fade-in">
          Аллергии, любимые и ненавистные продукты, время на готовку — AI учтёт всё
          и составит персональный план на день или неделю.
        </p>

        {/* Кнопки */}
        <div className="flex gap-4 animate-fade-in">
          {token ? (
            <>
              <Link
                to="/generate"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5"
              >
                Создать план
              </Link>
              <Link
                to="/dashboard"
                className="bg-white text-gray-700 text-lg px-8 py-4 rounded-2xl font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Личный кабинет
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5"
              >
                Зарегистрироваться и создать план
              </Link>
              <Link
                to="/login"
                className="bg-white text-gray-700 text-lg px-8 py-4 rounded-2xl font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Войти
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Как это работает */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Заполните анкету', desc: 'Расскажите, что любите, а что нельзя из-за аллергии' },
            { step: '02', title: 'Настройте план', desc: 'Выберите дни, приёмы пищи и время на готовку' },
            { step: '03', title: 'Получите результат', desc: 'AI составит сбалансированное меню с рецептами' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center p-8 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}