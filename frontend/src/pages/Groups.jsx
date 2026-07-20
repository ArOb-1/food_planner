import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Groups() {
  const [groupsWithMembers, setGroupsWithMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  const fetchGroups = async () => {
    try {
      const { data } = await client.get('/groups/')
      const enriched = await Promise.all(
        data.map(async (group) => {
          const memberNames = await Promise.all(
            group.member_ids.map(async (memberId) => {
              try {
                const { data: user } = await client.get(`/users/${memberId}`)
                return user.name || user.email
              } catch {
                return memberId
              }
            })
          )
          return { ...group, memberNames }
        })
      )
      setGroupsWithMembers(enriched)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await client.post('/groups/', { name, member_ids: [] })
    setName('')
    setShowCreate(false)
    fetchGroups()
  }

  if (loading) return <div className="p-8">Загрузка...</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои группы</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Создать группу
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 mb-6">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Название группы"
            className="w-full p-3 border rounded-lg mb-3"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Создать
          </button>
        </form>
      )}

      {groupsWithMembers.length === 0 ? (
        <p className="text-gray-500">У вас пока нет групп.</p>
      ) : (
        <div className="space-y-4">
          {groupsWithMembers.map(group => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition"
            >
              <p className="font-semibold text-lg">{group.name}</p>
              <p className="text-sm text-gray-500">
                {group.memberNames?.length || 0} участников: {group.memberNames?.join(', ')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}