import { useState } from 'react'
import client from '../api/client'

export default function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const register = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.post('/auth/register', { email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      return data
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.post('/auth/login', { email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      return data
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  return { register, login, logout, loading, error }
}