import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const token = localStorage.getItem('access_token')
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
    setIsOpen(false)
  }

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-lg shadow-black/5' 
          : 'bg-white/20 backdrop-blur-xl'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200/50"
              whileHover={{ rotate: 180, scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white text-lg">🍽️</span>
            </motion.div>
            <div className="flex items-center">
              <span className="font-bold text-xl text-gray-800">MealPlan</span>
              <span className="font-bold text-xl text-green-500">AI</span>
            </div>
          </Link>

          {/* Десктопное меню */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">Главная</NavLink>
            
            {token ? (
              <>
                <NavLink to="/dashboard">Кабинет</NavLink>
                <NavLink to="/plans">Мои планы</NavLink>
                <NavLink to="/groups">Группы</NavLink>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors relative group"
                >
                  Выйти
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all group-hover:w-full" />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Войти</NavLink>
                <Link to="/register">
                  <motion.button
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/70 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Начать бесплатно
                  </motion.button>
                </Link>
              </>
            )}

            {/* Кнопка "Поддержать проект" - ссылка на Donate */}
            <Link to="/donate">
              <motion.div
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-medium shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-200/70 transition-all cursor-pointer"
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">❤️</span>
                Поддержать
              </motion.div>
            </Link>
          </div>

          {/* Мобильная кнопка */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Мобильное меню */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden mt-4 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg"
            >
              <div className="flex flex-col p-4 space-y-2">
                <MobileLink to="/" onClick={() => setIsOpen(false)}>Главная</MobileLink>
                
                {token ? (
                  <>
                    <MobileLink to="/dashboard" onClick={() => setIsOpen(false)}>Личный кабинет</MobileLink>
                    <MobileLink to="/plans" onClick={() => setIsOpen(false)}>Мои планы</MobileLink>
                    <MobileLink to="/groups" onClick={() => setIsOpen(false)}>Группы</MobileLink>
                    <button 
                      onClick={handleLogout}
                      className="text-left px-3 py-2 rounded-xl text-red-500 font-medium hover:bg-red-50/30 transition-colors"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink to="/login" onClick={() => setIsOpen(false)}>Войти</MobileLink>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center rounded-xl font-medium">
                        Начать бесплатно
                      </div>
                    </Link>
                  </>
                )}

                {/* Мобильная ссылка на Donate */}
                <Link to="/donate" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-medium">
                    <span className="text-lg">❤️</span>
                    Поддержать проект
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-full" />
  </Link>
)

const MobileLink = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="block px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 font-medium hover:bg-white/30 transition-colors"
  >
    {children}
  </Link>
)