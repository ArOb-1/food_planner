import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'

// ── Иконки ───────────────────────────────────────────────────────────────────
const icons = {
  mail:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
  alert:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>,
  heart:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>,
  thumbDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/>,
  meh:       <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></>,
  calendar:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>,
  sparkles:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>,
  users:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>,
  edit:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>,
  logout:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>,
  donate:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>,
  location:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>,
}

function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  )
}

// ── Анимации ─────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

// ── Тег ──────────────────────────────────────────────────────────────────────
function Tag({ text, color }) {
  const cls = {
    rose:    'bg-rose-50   text-rose-600   border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    violet:  'bg-violet-50 text-violet-600 border-violet-200',
    sky:     'bg-sky-50    text-sky-600    border-sky-200',
  }
  return (
    <span className={`px-3 py-1 rounded-xl text-xs font-medium border ${cls[color]}`}>
      {text}
    </span>
  )
}

// ── Карточка статистики ───────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, items, index }) {
  const [open, setOpen] = useState(false)
  const gradients = {
    rose:    'from-rose-500   to-orange-400',
    emerald: 'from-emerald-500 to-green-400',
    violet:  'from-violet-500 to-purple-400',
    sky:     'from-sky-500    to-cyan-400',
  }
  const shadows = {
    rose:    'shadow-rose-200/60',
    emerald: 'shadow-emerald-200/60',
    violet:  'shadow-violet-200/60',
    sky:     'shadow-sky-200/60',
  }

  return (
    <motion.div
      {...fadeUp(0.15 + index * 0.07)}
      whileHover={{ y: -4 }}
      onClick={() => items?.length && setOpen(o => !o)}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5
                  border border-white/60 shadow-lg hover:shadow-xl
                  transition-shadow duration-300
                  ${items?.length ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[color]}
                         flex items-center justify-center
                         shadow-lg ${shadows[color]} flex-shrink-0`}>
          <Icon name={icon} className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        </div>
        {items?.length > 0 && (
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            className="ml-auto text-slate-300 text-lg select-none"
          >›</motion.span>
        )}
      </div>

      <AnimatePresence>
        {open && items?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {items.map(item => (
                <Tag key={item} text={item} color={color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Быстрое действие ─────────────────────────────────────────────────────────
function ActionCard({ to, label, icon, gradient, index }) {
  return (
    <motion.div {...fadeUp(0.35 + index * 0.06)}>
      <Link to={to}>
        <motion.div
          whileHover={{ y: -5, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-5
                     border border-white/60 shadow-lg hover:shadow-xl
                     transition-shadow duration-300 text-center cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                           flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <Icon name={icon} className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/users/me')
      .then(({ data }) => setUser(data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"
      />
      <p className="text-sm text-slate-400">Загружаем профиль...</p>
    </div>
  )

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const stats = [
    { label: 'Аллергии',    value: user?.allergies?.length        ?? 0, icon: 'alert',     color: 'rose',    items: user?.allergies },
    { label: 'Любимые',     value: user?.liked_products?.length   ?? 0, icon: 'heart',     color: 'emerald', items: user?.liked_products },
    { label: 'Ненавистные', value: user?.hated_products?.length   ?? 0, icon: 'thumbDown', color: 'violet',  items: user?.hated_products },
    { label: 'Нелюбимые',   value: user?.disliked_products?.length ?? 0, icon: 'meh',       color: 'sky',     items: user?.disliked_products },
  ]

  const actions = [
    { to: '/plans',    label: 'Мои планы',    icon: 'calendar', gradient: 'from-blue-500    to-cyan-400'    },
    { to: '/generate', label: 'Создать план', icon: 'sparkles', gradient: 'from-violet-500  to-purple-400'  },
    { to: '/groups',   label: 'Группы',       icon: 'users',    gradient: 'from-orange-500  to-rose-400'    },
    { to: '/donate',   label: 'Поддержать',   icon: 'donate',   gradient: 'from-yellow-400  to-orange-400'  },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40
                    pt-24 pb-16 px-4 relative overflow-hidden">

      {/* Декоративные блобы */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px]
                      bg-green-300/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px]
                      bg-emerald-300/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">

        {/* ── Профиль ──────────────────────────────────────────────────────── */}
<motion.div
  {...fadeUp(0)}
  className="rounded-3xl overflow-hidden shadow-xl border border-white/60"
>
  {/* Весь контент живёт внутри градиента — никаких перекрытий */}
  <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 relative p-7">

    {/* Точечный паттерн */}
    <div
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    />

    <div className="relative flex items-center gap-5">

      {/* Аватар */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm
                   border-2 border-white/40 shadow-lg
                   flex items-center justify-center
                   text-2xl font-extrabold text-white flex-shrink-0"
      >
        {initials}
      </motion.div>

      {/* Имя + контакты */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-extrabold text-white truncate">
          {user?.name || 'Пользователь'}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
          <span className="flex items-center gap-1.5 text-green-100 text-sm">
            <Icon name="mail" className="w-3.5 h-3.5" />
            {user?.email}
          </span>
          {user?.location && (
            <span className="flex items-center gap-1.5 text-green-100 text-sm">
              <Icon name="location" className="w-3.5 h-3.5" />
              {user.location}
            </span>
          )}
        </div>
      </div>

      {/* Кнопка редактирования */}
      <Link to="/profile" className="flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.35)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-white/20 backdrop-blur-sm border border-white/30
                     text-white text-sm font-semibold
                     transition-colors duration-200"
        >
          <Icon name="edit" className="w-4 h-4" />
          Редактировать
        </motion.button>
      </Link>

    </div>
  </div>
</motion.div>

        {/* ── Статистика (кликабельные, раскрывают теги) ───────────────────── */}
        <div>
          <motion.p {...fadeUp(0.12)}
            className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Предпочтения
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </div>
          <motion.p {...fadeUp(0.3)}
            className="text-xs text-slate-400 mt-2 px-1 text-center">
            Нажми на карточку, чтобы увидеть список
          </motion.p>
        </div>

        {/* ── Быстрые действия ─────────────────────────────────────────────── */}
        <div>
          <motion.p {...fadeUp(0.3)}
            className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Быстрые действия
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((a, i) => (
              <ActionCard key={a.to} {...a} index={i} />
            ))}
          </div>
        </div>

        {/* ── Выход ────────────────────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.55)} className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                       text-slate-400 hover:text-red-500 hover:bg-red-50
                       text-sm font-medium transition-all duration-200
                       border border-transparent hover:border-red-100"
          >
            <Icon name="logout" className="w-4 h-4" />
            Выйти из аккаунта
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}