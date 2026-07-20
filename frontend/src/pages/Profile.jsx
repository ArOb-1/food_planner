import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import toast from 'react-hot-toast'

export default function Profile() {
  const [name, setName] = useState('')
  const [allergies, setAllergies] = useState('')
  const [liked, setLiked] = useState('')
  const [hated, setHated] = useState('')
  const [disliked, setDisliked] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    client.get('/users/me').then(({ data }) => {
      setName(data.name || '')
      setAllergies(data.allergies?.join(', ') || '')
      setLiked(data.liked_products?.join(', ') || '')
      setHated(data.hated_products?.join(', ') || '')
      setDisliked(data.disliked_products?.join(', ') || '')
      setLocation(data.location || '')
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.put('/users/me/profile', {
        name: name || null,
        allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
        liked_products: liked ? liked.split(',').map(s => s.trim()) : [],
        hated_products: hated ? hated.split(',').map(s => s.trim()) : [],
        disliked_products: disliked ? disliked.split(',').map(s => s.trim()) : [],
        location: location || null,
      })
      toast.success('Профиль сохранён!')
      navigate('/dashboard')
    } catch {
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  console.log('Profile rendering, loading:', loading)
  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  )

  const fields = [
    {
      label: 'Имя',
      value: name,
      setter: setName,
      placeholder: 'Ваше имя',
      hint: 'Будет отображаться в группах'
    },
    {
      label: 'Аллергии',
      value: allergies,
      setter: setAllergies,
      placeholder: 'орехи, молоко, глютен',
      hint: 'Эти продукты будут полностью исключены'
    },
    {
      label: 'Любимые продукты',
      value: liked,
      setter: setLiked,
      placeholder: 'курица, рис, авокадо',
      hint: 'AI будет использовать их чаще'
    },
    {
      label: 'Ненавистные продукты',
      value: hated,
      setter: setHated,
      placeholder: 'рыба',
      hint: 'Никогда не попадут в план'
    },
    {
      label: 'Нелюбимые (но съем)',
      value: disliked,
      setter: setDisliked,
      placeholder: 'брокколи',
      hint: 'По возможности будут исключены'
    },
    {
      label: 'Город',
      value: location,
      setter: setLocation,
      placeholder: 'Москва',
      hint: 'Для учёта локальных продуктов'
    },
  ]

  console.log('Rendering form')
  return (
    <div className="max-w-2xl mx-auto p-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Редактировать профиль</h1>
        <p className="text-gray-500">Расскажите о своих предпочтениях, чтобы AI составил идеальный план</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {fields.map(({ label, value, setter, placeholder, icon, hint }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-1">{icon}</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder:text-gray-300"
                    placeholder={placeholder}
                  />
                  <p className="text-xs text-gray-400 mt-2">{hint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Сохраняем...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Сохранить
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}