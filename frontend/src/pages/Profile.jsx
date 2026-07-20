import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Profile() {
  const [name, setName] = useState('')
  const [allergies, setAllergies] = useState('')
  const [liked, setLiked] = useState('')
  const [hated, setHated] = useState('')
  const [disliked, setDisliked] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/users/me').then(({ data }) => {
      setName(data.name || '')
      setAllergies(data.allergies?.join(', ') || '')
      setLiked(data.liked_products?.join(', ') || '')
      setHated(data.hated_products?.join(', ') || '')
      setDisliked(data.disliked_products?.join(', ') || '')
      setLocation(data.location || '')
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await client.put('/users/me/profile', {
      name: name || null,
      allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
      liked_products: liked ? liked.split(',').map(s => s.trim()) : [],
      hated_products: hated ? hated.split(',').map(s => s.trim()) : [],
      disliked_products: disliked ? disliked.split(',').map(s => s.trim()) : [],
      location: location || null,
    })
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Редактировать профиль</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Имя</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="Ваше имя" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Аллергии (через запятую)</label>
          <input value={allergies} onChange={e => setAllergies(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="орехи, молоко" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Любимые продукты</label>
          <input value={liked} onChange={e => setLiked(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="курица, рис, авокадо" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ненавистные продукты</label>
          <input value={hated} onChange={e => setHated(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="рыба" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Нелюбимые (но съем)</label>
          <input value={disliked} onChange={e => setDisliked(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="брокколи" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Город</label>
          <input value={location} onChange={e => setLocation(e.target.value)}
            className="w-full p-3 border rounded-lg" placeholder="Москва" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}