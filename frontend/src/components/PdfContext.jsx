import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import client from '../api/client'

const PdfContext = createContext(null)

export function PdfProvider({ children }) {
  // { [taskId]: { planId, status: 'loading'|'success'|'error' } }
  const [tasks, setTasks]   = useState({})
  const intervalsRef        = useRef({})   // храним интервалы отдельно от стейта

  // ── Запуск генерации ─────────────────────────────────────────────────────
  const startPdfGeneration = useCallback(async (planId) => {
    try {
      const { data } = await client.post(`/plans/${planId}/pdf/generate`)
      const taskId   = data.task_id

      setTasks(prev => ({ ...prev, [taskId]: { planId, status: 'loading' } }))

      // Polling — живёт в контексте, не зависит от страницы
      const interval = setInterval(async () => {
        try {
          const { data: s } = await client.get(`/plans/tasks/${taskId}/status`)

          if (s.status === 'success') {
            _stopInterval(taskId)
            setTasks(prev => ({ ...prev, [taskId]: { planId, status: 'success' } }))

            // Авто-скачивание
            const token = localStorage.getItem('access_token')
            const url   = `http://localhost:8000/api/v1/plans/${planId}/pdf/download/${taskId}?token=${token}`
            _autoDownload(url, `meal_plan_${planId}.pdf`)

            // Тост виден на любой странице
            toast.success('PDF готов и скачивается! 📄', { duration: 5000 })
          }

          if (s.status === 'failure') {
            _stopInterval(taskId)
            setTasks(prev => ({ ...prev, [taskId]: { planId, status: 'error' } }))
            toast.error('Не удалось создать PDF')
          }

        } catch {
          _stopInterval(taskId)
          setTasks(prev => ({ ...prev, [taskId]: { planId, status: 'error' } }))
        }
      }, 2000)

      intervalsRef.current[taskId] = interval

    } catch {
      toast.error('Ошибка запуска генерации PDF')
    }
  }, [])

  const _stopInterval = (taskId) => {
    clearInterval(intervalsRef.current[taskId])
    delete intervalsRef.current[taskId]
  }

  const _autoDownload = (url, filename) => {
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
  }

  // Статус по planId (для кнопки в PlanDetail)
  const getPlanPdfStatus = useCallback((planId) => {
    const task = Object.values(tasks).findLast(t => t.planId === planId)
    return task?.status ?? 'idle'
  }, [tasks])

  // Чистим все интервалы при полном размонтировании провайдера
  useEffect(() => {
    return () => Object.values(intervalsRef.current).forEach(clearInterval)
  }, [])

  return (
    <PdfContext.Provider value={{ startPdfGeneration, getPlanPdfStatus }}>
      {children}
    </PdfContext.Provider>
  )
}

export function usePdf() {
  const ctx = useContext(PdfContext)
  if (!ctx) throw new Error('usePdf нужен внутри PdfProvider')
  return ctx
}