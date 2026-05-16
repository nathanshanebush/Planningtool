import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'impera-calendar-tactics'

export function useCalendar() {
  const [tactics, setTactics] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tactics))
  }, [tactics])

  const addTactic = useCallback((tactic) => {
    const id = `tactic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newTactic = { ...tactic, id }
    setTactics(prev => [...prev, newTactic])
    return newTactic
  }, [])

  const updateTactic = useCallback((id, updates) => {
    setTactics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const deleteTactic = useCallback((id) => {
    setTactics(prev => prev.filter(t => t.id !== id))
  }, [])

  return { tactics, addTactic, updateTactic, deleteTactic }
}
