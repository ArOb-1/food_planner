import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: 'Артем',
    email: 'artem@gmail.com',
    allergies: 1,
    favorite: 4,
    hated: 1,
    disliked: 1,
    allergiesList: ['Орехи'],
    favoriteList: ['Курица', 'Говядина', 'Помидоры', 'Моцарелла']
  })

  // Иконки
  const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
      user: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      mail: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      alert: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      heart: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      thumbDown: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>,
      meh: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 12h7M12 8.5v7m9 3.5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      calendar: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      sparkles: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
      users: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      donate: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      food: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      arrowRight: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    }
    return icons[name] || null
  }

  // Компонент кнопки с эффектом заполнения
  const AnimatedButton = ({ to, children, icon, className = "" }) => (
    <Link to={to}>
      <motion.button
        className={`group relative overflow-hidden px-6 py-3 rounded-xl font-medium transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Фон кнопки */}
        <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 group-hover:scale-x-100 scale-x-0 origin-left" />
        
        {/* Тень при наведении */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg shadow-green-200/50" />
        
        {/* Контент */}
        <span className="relative flex items-center gap-2 text-slate-700 group-hover:text-white transition-colors duration-300">
          {icon && <Icon name={icon} className="w-5 h-5" />}
          {children}
        </span>
      </motion.button>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Фоновые волны */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M0 200 Q360 150 720 220 T1440 180 L1440 0 L0 0 Z" fill="url(#waveGrad)" opacity="0.3">
            <animateTransform attributeName="transform" type="translate" values="0,0;30,0;60,0;30,0;0,0" dur="15s" repeatCount="indefinite" />
          </path>
          <path d="M0 400 Q400 330 800 420 T1440 360 L1440 0 L0 0 Z" fill="url(#waveGrad)" opacity="0.2">
            <animateTransform attributeName="transform" type="translate" values="0,0;-25,0;-50,0;-25,0;0,0" dur="18s" repeatCount="indefinite" />
          </path>
          <path d="M0 600 Q350 540 700 620 T1440 560 L1440 0 L0 0 Z" fill="url(#waveGrad)" opacity="0.15">
            <animateTransform attributeName="transform" type="translate" values="0,0;20,0;40,0;20,0;0,0" dur="20s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Профиль */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-lg mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200/50">
              <span className="text-3xl text-white font-bold">
                {userData.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{userData.name}</h1>
              <div className="flex items-center gap-2 text-slate-500">
                <Icon name="mail" className="w-4 h-4" />
                <span className="text-sm">{userData.email}</span>
              </div>
            </div>
            <AnimatedButton to="/preferences" icon="edit" className="border border-green-200">
              Редактировать
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Статистика */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Аллергии', value: userData.allergies, color: 'rose', icon: 'alert' },
            { label: 'Любимые', value: userData.favorite, color: 'emerald', icon: 'heart' },
            { label: 'Ненавистные', value: userData.hated, color: 'violet', icon: 'thumbDown' },
            { label: 'Нелюбимые', value: userData.disliked, color: 'sky', icon: 'meh' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-400 flex items-center justify-center shadow-lg shadow-${stat.color}-200/50`}>
                  <Icon name={stat.icon} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Аллергии - крупная карточка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-lg mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-200/50">
              <Icon name="alert" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Аллергии</h2>
              <p className="text-sm text-slate-400">Продукты, которых стоит избегать</p>
            </div>
            <span className="ml-auto text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {userData.allergiesList.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {userData.allergiesList.length > 0 ? (
              userData.allergiesList.map((item, idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium border border-rose-200"
                >
                  {item}
                </motion.span>
              ))
            ) : (
              <p className="text-slate-400 text-sm">Нет аллергий</p>
            )}
          </div>
        </motion.div>

        {/* Быстрые действия */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { to: '/plans', label: 'Мои планы', icon: 'calendar', color: 'from-blue-500 to-cyan-500' },
            { to: '/generate', label: 'Создать план', icon: 'sparkles', color: 'from-violet-500 to-purple-500' },
            { to: '/groups', label: 'Группы', icon: 'users', color: 'from-orange-500 to-rose-500' },
            { to: '/donate', label: 'Поддержать', icon: 'donate', color: 'from-yellow-400 to-orange-400' },
          ].map((action, index) => (
            <Link key={index} to={action.to}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all text-center cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <Icon name={action.icon} className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Выход */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => {
              localStorage.clear()
              window.location.href = '/'
            }}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Выйти из аккаунта
          </button>
        </motion.div>
      </div>
    </div>
  )
}