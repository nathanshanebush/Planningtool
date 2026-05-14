import { useMemo } from 'react'
import { ANNUAL_BUDGET_TOTAL } from '../data/annualBudget'

export function useBudget(getAllCards) {
  const budgetStats = useMemo(() => {
    const cards = getAllCards()
    const totalAnnualBudget = ANNUAL_BUDGET_TOTAL
    const totalSpent = cards.reduce((sum, c) => sum + (Number(c.spendToDate) || 0), 0)
    const totalRevenue = cards.reduce((sum, c) => sum + (Number(c.revenueEarned) || 0), 0)
    const totalAllocated = cards.reduce((sum, c) => sum + (Number(c.annualBudget) || 0), 0)
    const remaining = totalAnnualBudget - totalSpent
    const roi = totalAllocated > 0 && totalRevenue > 0 ? totalRevenue / totalAllocated : 0

    const byCategory = {}
    cards.forEach(card => {
      const cat = card.tactic || 'Uncategorized'
      if (!byCategory[cat]) byCategory[cat] = { allocated: 0, spent: 0, revenue: 0 }
      byCategory[cat].allocated += Number(card.annualBudget) || 0
      byCategory[cat].spent += Number(card.spendToDate) || 0
      byCategory[cat].revenue += Number(card.revenueEarned) || 0
    })

    const categoryData = Object.entries(byCategory).map(([name, data]) => ({
      name,
      allocated: data.allocated,
      spent: data.spent,
      revenue: data.revenue,
      roi: data.allocated > 0 && data.revenue > 0 ? data.revenue / data.allocated : 0,
    })).sort((a, b) => b.allocated - a.allocated)

    return { totalAnnualBudget, totalSpent, totalRevenue, totalAllocated, remaining, roi, categoryData }
  }, [getAllCards])

  return { budgetStats }
}
