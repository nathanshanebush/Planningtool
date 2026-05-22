import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const STORAGE_KEY = 'impera_budget_monthly'

// Pre-seeded monthly data from line-item mapping
const DEFAULT_MONTHLY = {
  '1':  { '5': 3040 },
  '2':  { '9': 5000 },
  '3':  { '9': 5000, '10': 5000 },
  '4':  { '10': 5000, '11': 5000, '12': 5000 },
  '5':  { '1': 11850, '2': 5000, '4': 5500, '5': 5000, '6': 6000, '7': 5000, '8': 5000, '9': 5000 },
  '6':  { '1': 1245, '2': 1245, '3': 1245, '4': 1245, '5': 1245, '6': 1245, '7': 1245, '8': 1245, '9': 1245, '10': 1245, '11': 1245, '12': 1245 },
  '7':  { '1': 1464, '2': 1464, '3': 1464, '4': 1464, '5': 1464, '6': 1464, '7': 1464, '8': 1464, '9': 1464, '10': 1464, '11': 1464, '12': 1464 },
  '8':  { '7': 1373, '8': 1373, '9': 1373, '10': 1373, '11': 1374, '12': 1374 },
  '9':  { '1': 8128, '2': 8128, '3': 8128, '4': 8128, '5': 8128, '6': 8128, '7': 8128, '8': 8128, '9': 8128, '10': 8128, '11': 8128, '12': 8126 },
  '10': { '1': 460, '2': 460, '3': 460, '4': 460, '5': 460, '6': 460, '7': 460, '8': 460, '9': 460, '10': 460, '11': 460, '12': 460 },
  '11': { '1': 875, '3': 5000, '6': 1250, '9': 875, '12': 250 },
  '12': { '1': 1740, '2': 1740, '3': 1740, '4': 1740, '5': 1740, '6': 1740, '7': 1740, '8': 1740, '9': 1740, '10': 1740, '11': 1740, '12': 1735 },
  '13': { '1': 999, '2': 999, '3': 999, '4': 999, '5': 999, '6': 999, '7': 999, '8': 999, '9': 999, '10': 999, '11': 999, '12': 999 },
}

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    return null
  } catch {
    return null
  }
}

export function useBudgetPlan() {
  const qc = useQueryClient()

  const [monthly, setMonthly] = useState(() => {
    const stored = load()
    if (stored) return stored
    // First load: seed from defaults
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MONTHLY)) } catch {}
    return DEFAULT_MONTHLY
  })

  // Update a single monthly cell and sync annual total to campaign cache
  const updateMonth = useCallback((campaignId, month, amount) => {
    setMonthly(prev => {
      const campaignMonths = { ...(prev[campaignId] ?? {}), [String(month)]: Number(amount) || 0 }
      const next = { ...prev, [campaignId]: campaignMonths }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      // Compute new annual total and sync to React Query cache
      const annual = Object.values(campaignMonths).reduce((s, v) => s + (Number(v) || 0), 0)
      qc.setQueryData(['campaigns'], (old) =>
        (old ?? []).map(c => c.id === campaignId ? { ...c, budget: annual } : c)
      )
      return next
    })
  }, [qc])

  // When campaign budget is updated externally, redistribute monthly cells
  const syncFromCampaign = useCallback((campaignId, newBudget) => {
    setMonthly(prev => {
      const months = prev[campaignId] ?? {}
      const currentSum = Object.values(months).reduce((s, v) => s + (Number(v) || 0), 0)
      if (Math.abs(currentSum - newBudget) < 1) return prev // already in sync

      const keys = Object.keys(months).filter(k => Number(months[k]) > 0)
      let newMonths = {}

      if (keys.length === 0 || currentSum === 0) {
        // Distribute evenly across 12 months
        const perMonth = Math.round(newBudget / 12)
        for (let m = 1; m <= 12; m++) newMonths[String(m)] = perMonth
      } else {
        // Scale all months proportionally
        const scale = newBudget / currentSum
        keys.forEach(k => { newMonths[k] = Math.round((Number(months[k]) || 0) * scale) })
      }

      const next = { ...prev, [campaignId]: newMonths }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const getMonthly = useCallback((campaignId) => monthly[campaignId] ?? {}, [monthly])

  return { updateMonth, syncFromCampaign, getMonthly, monthly }
}
