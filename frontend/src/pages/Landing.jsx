import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const WaveBackground = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ 
        zIndex: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <svg 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      >
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2">
              <animate attributeName="stop-opacity" values="0.2;0.35;0.2" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="40%" stopColor="#10b981" stopOpacity="0.3">
              <animate attributeName="stop-opacity" values="0.3;0.45;0.3" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="80%" stopColor="#059669" stopOpacity="0.25">
              <animate attributeName="stop-opacity" values="0.25;0.4;0.25" dur="7s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.15">
              <animate attributeName="stop-opacity" values="0.15;0.3;0.15" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.25">
              <animate attributeName="stop-opacity" values="0.25;0.4;0.25" dur="7s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#dcfce7" stopOpacity="0.2">
              <animate attributeName="stop-opacity" values="0.2;0.35;0.2" dur="9s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.08" />
          </linearGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#softGlow)">
          <path
            d="M0 120 Q360 60 720 140 T1440 100"
            fill="none"
            stroke="url(#wave1)"
            strokeWidth="12"
            opacity="0.25"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;40,0;80,0;40,0;0,0"
              dur="18s"
              repeatCount="indefinite"
            />
          </path>

          <path
            d="M0 350 Q400 280 800 370 T1440 310"
            fill="none"
            stroke="url(#wave2)"
            strokeWidth="14"
            opacity="0.2"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;-50,0;-100,0;-50,0;0,0"
              dur="20s"
              repeatCount="indefinite"
            />
          </path>

          <path
            d="M0 580 Q350 510 850 600 T1440 530"
            fill="none"
            stroke="url(#wave1)"
            strokeWidth="13"
            opacity="0.18"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;60,0;120,0;60,0;0,0"
              dur="22s"
              repeatCount="indefinite"
            />
          </path>

          <path
            d="M0 780 Q400 710 900 800 T1440 730"
            fill="none"
            stroke="url(#wave3)"
            strokeWidth="11"
            opacity="0.15"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;-40,0;-80,0;-40,0;0,0"
              dur="19s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </div>
  )
}

export default function Landing() {
  const token = localStorage.getItem('access_token')
  const stepsRef = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: '-100px' })

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30">

      <WaveBackground />

      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ zIndex: 0, background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ zIndex: 0, background: 'radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)' }} />

      <motion.section
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-20"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md text-green-700
                     px-5 py-2.5 rounded-full text-sm font-medium mb-10
                     border border-green-100/50 shadow-sm"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          Работает на YandexGPT
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 max-w-4xl leading-[1.05] tracking-tight"
        >
          План питания,
          <br className="hidden sm:block" /> который учитывает{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400">
            вас
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl leading-relaxed"
        >
          Аллергии, любимые и ненавистные продукты, время на готовку —{' '}
          <span className="text-gray-700 font-medium">AI учтёт всё</span> и составит
          персональный план на день или неделю.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
          {token ? (
            <>
              <Link to="/generate">
                <motion.div
                  className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg
                             px-10 py-4 rounded-2xl font-semibold shadow-lg shadow-green-200/50
                             overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <span className="relative z-10">Создать план</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: '-200%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.7 }}
                  />
                </motion.div>
              </Link>
              <Link to="/dashboard">
                <motion.div
                  className="bg-white/80 backdrop-blur-sm text-gray-700 text-lg px-10 py-4
                             rounded-2xl font-semibold border border-gray-200
                             hover:border-green-200 hover:bg-green-50/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  Личный кабинет
                </motion.div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <motion.div
                  className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg
                             px-10 py-4 rounded-2xl font-semibold shadow-lg shadow-green-200/50
                             overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <span className="relative z-10">Начать бесплатно</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: '-200%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.7 }}
                  />
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div
                  className="bg-white/80 backdrop-blur-sm text-gray-700 text-lg px-10 py-4
                             rounded-2xl font-semibold border border-gray-200
                             hover:border-green-200 hover:bg-green-50/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  Войти
                </motion.div>
              </Link>
            </>
          )}
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        ref={stepsRef}
        className="relative z-10 py-20 px-4 max-w-5xl mx-auto"
        initial="hidden"
        animate={stepsInView ? 'visible' : 'hidden'}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-4">
          Как это работает
        </motion.h2>
        <motion.p variants={fadeUp} className="text-gray-500 text-center mb-14 max-w-lg mx-auto">
          Три простых шага — и персональный план питания готов
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full" />

          {[
            { step: '01', title: 'Заполните анкету', desc: 'Расскажите, что любите, а что нельзя из-за аллергии', icon: '📝' },
            { step: '02', title: 'Настройте план', desc: 'Выберите дни, приёмы пищи и время на готовку', icon: '⚙️' },
            { step: '03', title: 'Получите результат', desc: 'AI составит сбалансированное меню с рецептами', icon: '✅' },
          ].map(({ step, title, desc, icon }) => (
            <motion.div
              key={step}
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative text-center p-8 rounded-3xl bg-white/70 backdrop-blur-md
                         border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]
                         hover:shadow-[0_20px_60px_rgba(22,163,74,0.1)]
                         hover:border-green-100 transition-all duration-300 group"
            >
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-50
                           text-2xl rounded-2xl flex items-center justify-center
                           mx-auto mb-5 border border-green-100
                           group-hover:from-green-500 group-hover:to-emerald-500
                           group-hover:border-green-500
                           group-hover:shadow-lg group-hover:shadow-green-200
                           transition-all duration-300"
              >
                {icon}
              </motion.div>
              <div className="text-xs font-bold text-green-500/60 tracking-widest mb-2">ШАГ {step}</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Почему{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">
                именно мы
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Учёт аллергий', desc: 'Укажите аллергены — они никогда не попадут в ваш план', emoji: '🛡️', gradient: 'from-red-50 to-orange-50', border: 'hover:border-red-200' },
              { title: 'Любимые продукты', desc: 'Чаще предлагаем то, что вы действительно любите есть', emoji: '❤️', gradient: 'from-pink-50 to-rose-50', border: 'hover:border-pink-200' },
              { title: 'Гибкое расписание', desc: 'Меню на 1 день или всю неделю — вы выбираете', emoji: '📅', gradient: 'from-blue-50 to-indigo-50', border: 'hover:border-blue-200' },
              { title: 'Время на готовку', desc: 'Указываете 15 минут — получаете быстрые рецепты', emoji: '⏱️', gradient: 'from-amber-50 to-yellow-50', border: 'hover:border-amber-200' },
            ].map(({ title, desc, emoji, gradient, border }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${gradient}
                           border border-transparent ${border}
                           transition-all duration-300 cursor-default flex items-start gap-4`}
              >
                <span className="text-3xl mt-1">{emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        className="relative z-10 py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Готовы попробовать?</h2>
            <p className="text-green-100 mb-8 relative z-10">
              Создайте свой первый план питания за 2 минуты — бесплатно
            </p>
            <Link to={token ? '/generate' : '/register'}>
              <motion.div
                className="inline-block bg-white text-green-600 text-lg px-10 py-4
                           rounded-2xl font-bold cursor-pointer relative z-10
                           shadow-lg shadow-green-900/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {token ? 'Создать план' : 'Начать бесплатно'} →
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="h-10" />
    </div>
  )
}