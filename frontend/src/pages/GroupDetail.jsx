import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [profile, setProfile] = useState(null)
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [email, setEmail] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const [showGenerate, setShowGenerate] = useState(false)
  const [genDays, setGenDays] = useState(7)
  const [genCookingTime, setGenCookingTime] = useState('')
  const [genMeals, setGenMeals] = useState(['breakfast', 'lunch', 'dinner'])
  const [genProducts, setGenProducts] = useState('')
  const [genCuisine, setGenCuisine] = useState('')
  const [generating, setGenerating] = useState(false)

  const [deleteMemberId, setDeleteMemberId] = useState(null)
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false)
  const [deletePlanId, setDeletePlanId] = useState(null)

  const fetchGroup = async () => {
    const { data } = await client.get(`/groups/${id}`)
    setGroup(data)

    try {
      const { data: prof } = await client.get(`/groups/${id}/profile`)
      setProfile(prof)
    } catch {}

    if (data.member_ids?.length > 0) {
      const memberData = await Promise.all(
        data.member_ids.map(async (memberId) => {
          try {
            const { data: user } = await client.get(`/users/${memberId}`)
            return user
          } catch {
            return { id: memberId, email: memberId, name: null }
          }
        })
      )
      setMembers(memberData)
    }

    try {
      const { data: plansData } = await client.get(`/plans/?group_id=${id}`)
      setPlans(plansData)
    } catch {}

    setLoading(false)
  }

  useEffect(() => { fetchGroup() }, [id])

  const handleEmailChange = async (e) => {
    const value = e.target.value
    setEmail(value)
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const { data } = await client.get(`/users/search?email=${encodeURIComponent(value)}`)
      setSuggestions(data)
      setShowSuggestions(data.length > 0)
    } catch {
      setSuggestions([])
    }
  }

  const handleSelectUser = (user) => {
    setEmail(user.email)
    setShowSuggestions(false)
    addMember(user.id)
  }

  const addMember = async (userId) => {
    setAdding(true)
    try {
      await client.post(`/groups/${id}/members`, { user_id: userId })
      setEmail('')
      setSuggestions([])
      setShowSuggestions(false)
      toast.success('Участник добавлен')
      fetchGroup()
    } catch {
      toast.error('Ошибка добавления')
    } finally {
      setAdding(false)
    }
  }

  const handleAddMember = async (e) => {
    e?.preventDefault()
    if (!email) return
    const exact = suggestions.find(u => u.email === email)
    if (exact) {
      addMember(exact.id)
    } else {
      toast.error('Выберите пользователя из списка или введите точный email')
    }
  }

  const handleRemoveMemberConfirm = async () => {
    if (!deleteMemberId) return
    try {
      await client.delete(`/groups/${id}/members/${deleteMemberId}`)
      toast.success('Участник удалён')
      fetchGroup()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка удаления')
    }
    setDeleteMemberId(null)
  }

  const handleDeleteGroupConfirm = async () => {
    try {
      await client.delete(`/groups/${id}`)
      toast.success('Группа удалена')
      navigate('/groups')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка удаления')
    }
    setDeleteGroupOpen(false)
  }

  const handleDeletePlanConfirm = async () => {
    if (!deletePlanId) return
    await client.delete(`/plans/${deletePlanId}`)
    toast.success('План удалён')
    fetchGroup()
    setDeletePlanId(null)
  }

  const toggleMeal = (meal) => {
    setGenMeals(prev =>
      prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
    )
  }

  const handleGeneratePlan = async () => {
    setGenerating(true)
    try {
      const { data } = await client.post('/plans/generate', {
        days: genDays,
        is_group: true,
        group_id: id,
        cooking_time: genCookingTime ? Number(genCookingTime) : null,
        meals: genMeals,
        available_products: genProducts || null,
        cuisine: genCuisine || null,
      })
      if (data.id) navigate(`/plans/${data.id}`)
    } catch {
      toast.error('Ошибка генерации')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>
  if (!group) return <div className="p-8">Группа не найдена</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGenerate(!showGenerate)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Сгенерировать план
          </button>
          <button
            onClick={() => setDeleteGroupOpen(true)}
            className="text-red-500 hover:underline text-sm"
          >
            Удалить группу
          </button>
        </div>
      </div>

      <Link to="/groups" className="text-green-600 hover:underline text-sm mb-6 inline-block">
        ← К списку групп
      </Link>

      {showGenerate && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
          <h2 className="font-semibold">Генерация плана для группы</h2>
          <div>
            <label className="block text-sm font-medium mb-1">На сколько дней?</label>
            <select value={genDays} onChange={e => setGenDays(Number(e.target.value))}
              className="w-full p-3 border rounded-lg">
              <option value={1}>1 день</option>
              <option value={3}>3 дня</option>
              <option value={7}>7 дней</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Время на готовку (минут)</label>
            <select value={genCookingTime} onChange={e => setGenCookingTime(e.target.value)}
              className="w-full p-3 border rounded-lg">
              <option value="">Без ограничений</option>
              <option value="15">15 минут</option>
              <option value="30">30 минут</option>
              <option value="60">1 час</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Приёмы пищи</label>
            <div className="flex gap-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
                <label key={meal} className="flex items-center gap-1">
                  <input type="checkbox" checked={genMeals.includes(meal)} onChange={() => toggleMeal(meal)} />
                  {meal === 'breakfast' ? 'Завтрак' : meal === 'lunch' ? 'Обед' : meal === 'dinner' ? 'Ужин' : 'Перекус'}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Что есть под рукой?</label>
            <input value={genProducts} onChange={e => setGenProducts(e.target.value)}
              className="w-full p-3 border rounded-lg" placeholder="курица, рис, помидоры" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Предпочитаемая кухня</label>
            <select value={genCuisine} onChange={e => setGenCuisine(e.target.value)}
              className="w-full p-3 border rounded-lg">
              <option value="">Без предпочтений</option>
              <option value="русская">Русская</option>
              <option value="итальянская">Итальянская</option>
              <option value="азиатская">Азиатская</option>
            </select>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {generating ? 'Генерируем...' : 'Сгенерировать'}
          </button>
        </div>
      )}

      {profile && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-3">Агрегированный профиль</h2>
          <p><strong>Запрещено:</strong> {profile.forbidden?.join(', ') || '—'}</p>
          <p><strong>Приоритет:</strong> {profile.priority?.join(', ') || '—'}</p>
        </div>
      )}

      {plans.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-3">Планы группы</h2>
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{plan.days} {plan.days === 1 ? 'день' : plan.days < 5 ? 'дня' : 'дней'}</p>
                  <p className="text-xs text-gray-500">{new Date(plan.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                    plan.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {plan.status === 'completed' ? 'Готов' : plan.status === 'failed' ? 'Ошибка' : '...'}
                  </span>
                  {plan.status !== 'failed' && (
                    <Link to={`/plans/${plan.id}`} className="text-green-600 hover:underline text-sm">
                      {plan.status === 'completed' ? 'Смотреть' : 'Статус'}
                    </Link>
                  )}
                  <button
                    onClick={() => setDeletePlanId(plan.id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold mb-3">Участники ({members.length})</h2>
        {members.length > 0 ? (
          <ul className="space-y-2">
            {members.map(member => (
              <li key={member.id} className="flex justify-between items-center">
                <span className="text-gray-700">
                  {member.name || member.email}
                  {member.id === group.owner_id && (
                    <span className="text-xs text-gray-400 ml-2">(владелец)</span>
                  )}
                </span>
                {member.id !== group.owner_id && (
                  <button
                    onClick={() => setDeleteMemberId(member.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Удалить
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Нет участников</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-3">Добавить участника</h2>
        <form onSubmit={handleAddMember}>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                value={email}
                onChange={handleEmailChange}
                placeholder="Email пользователя"
                className="w-full p-3 border rounded-lg"
                autoComplete="off"
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm"
                    >
                      {user.name ? `${user.name} (${user.email})` : user.email}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? '...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={!!deleteMemberId}
        onClose={() => setDeleteMemberId(null)}
        onConfirm={handleRemoveMemberConfirm}
        title="Удалить участника?"
        message="Участник будет удалён из группы."
      />

      <ConfirmModal
        isOpen={deleteGroupOpen}
        onClose={() => setDeleteGroupOpen(false)}
        onConfirm={handleDeleteGroupConfirm}
        title="Удалить группу?"
        message="Группа и все её планы будут удалены навсегда."
      />

      <ConfirmModal
        isOpen={!!deletePlanId}
        onClose={() => setDeletePlanId(null)}
        onConfirm={handleDeletePlanConfirm}
        title="Удалить план?"
        message="Это действие нельзя отменить."
      />
    </div>
  )
}