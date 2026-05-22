import React from 'react'
import { useTactics } from '../hooks/useTactics'
import { ANNUAL_BUDGET_TOTAL, ANNUAL_BUDGET_DATA } from '../data/annualBudget'
import BudgetDashboard from '../components/BudgetDashboard'
import BudgetBuilder from '../components/BudgetBuilder'

function useBudgetStats() {
  const { data: tactics = [] } = useTactics()
  const totalSpent = tactics.reduce((s, t) => s + (Number(t.spend_to_date) || 0), 0)
  const totalRevenue = tactics.reduce((s, t) => s + (Number(t.revenue_earned) || 0), 0)
  const totalAllocated = tactics.reduce((s, t) => s + (Number(t.budget) || 0), 0)
  const remaining = ANNUAL_BUDGET_TOTAL - totalSpent
  const roi = totalAllocated > 0 && totalRevenue > 0 ? totalRevenue / totalAllocated : 0

  const byCategory = {}
  ANNUAL_BUDGET_DATA.forEach((cat) => {
    byCategory[cat.category] = { allocated: cat.annualSubtotal, spent: 0, revenue: 0 }
  })
  tactics.forEach((t) => {
    const cat = t.tactic_type || 'Uncategorized'
    if (!byCategory[cat]) byCategory[cat] = { allocated: 0, spent: 0, revenue: 0 }
    byCategory[cat].spent += Number(t.spend_to_date) || 0
    byCategory[cat].revenue += Number(t.revenue_earned) || 0
  })

  const categoryData = Object.entries(byCategory)
    .map(([name, d]) => ({
      name,
      allocated: d.allocated,
      spent: d.spent,
      revenue: d.revenue,
      roi: d.allocated > 0 && d.revenue > 0 ? d.revenue / d.allocated : 0,
    }))
    .sort((a, b) => b.allocated - a.allocated)

  return { totalAnnualBudget: ANNUAL_BUDGET_TOTAL, totalSpent, totalRevenue, totalAllocated, remaining, roi, categoryData }
}

export default function BudgetPage() {
  const budgetStats = useBudgetStats()

  return (
    <div className="-m-6">
      <BudgetDashboard budgetStats={budgetStats} />
      <div className="p-6">
        <BudgetBuilder />
      </div>
    </div>
  )
}
