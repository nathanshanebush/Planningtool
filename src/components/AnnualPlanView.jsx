import React, { useState } from 'react'
import { ChevronDown, ChevronRight, DollarSign } from 'lucide-react'
import { ANNUAL_BUDGET_DATA, ANNUAL_BUDGET_TOTAL } from '../data/annualBudget.js'
import { TACTIC_COLORS } from '../data/tacticCategories.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatCurrency(val) {
  if (!val) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

function formatShort(val) {
  if (!val) return '—'
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
  return `$${val}`
}

function getMonthTotal(monthIdx) {
  let total = 0
  for (const cat of ANNUAL_BUDGET_DATA) {
    for (const item of cat.lineItems) {
      total += item.months[monthIdx + 1] || 0
    }
  }
  return total
}

export default function AnnualPlanView() {
  const [expanded, setExpanded] = useState({})

  function toggle(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const grandTotal = ANNUAL_BUDGET_TOTAL

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-snap-primary font-serif">Annual Marketing Plan</h1>
          <p className="text-sm text-snap-muted mt-1">2026 Budget Overview</p>
        </div>
        <div className="bg-snap-dark text-white rounded-xl px-5 py-3 text-right">
          <p className="text-xs text-white/60 font-mono">Total Annual Budget</p>
          <p className="text-2xl font-bold font-mono">{formatCurrency(grandTotal)}</p>
        </div>
      </div>

      {/* Monthly totals summary row */}
      <div className="bg-white rounded-xl shadow-sm border border-snap-border mb-4 overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-snap-border">
              <th className="text-left px-4 py-3 text-snap-muted font-semibold uppercase tracking-wide w-48">Category</th>
              {MONTHS.map(m => (
                <th key={m} className="px-2 py-3 text-snap-muted font-semibold uppercase tracking-wide text-center w-20">{m}</th>
              ))}
              <th className="px-3 py-3 text-snap-muted font-semibold uppercase tracking-wide text-right w-24">Annual</th>
            </tr>
          </thead>
          <tbody>
            {ANNUAL_BUDGET_DATA.map(cat => {
              const isOpen = expanded[cat.id]
              const tacticColor = TACTIC_COLORS[cat.category] || { bg: '#F4F5F7', text: '#5E6C84', border: '#B3BAC5' }

              // Compute monthly totals for this category
              const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
                return cat.lineItems.reduce((sum, item) => sum + (item.months[i + 1] || 0), 0)
              })

              return (
                <React.Fragment key={cat.id}>
                  <tr
                    className="border-b border-snap-border/50 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggle(cat.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isOpen ? <ChevronDown size={14} className="text-snap-muted" /> : <ChevronRight size={14} className="text-snap-muted" />}
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: tacticColor.bg, color: tacticColor.text }}
                        >
                          {cat.category}
                        </span>
                      </div>
                    </td>
                    {monthlyTotals.map((amt, i) => (
                      <td key={i} className="px-2 py-3 text-center font-mono text-snap-primary font-medium">
                        {amt > 0 ? formatShort(amt) : <span className="text-snap-border">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-right font-mono font-bold text-snap-primary">
                      {formatCurrency(cat.annualSubtotal)}
                    </td>
                  </tr>

                  {/* Expanded line items */}
                  {isOpen && cat.lineItems.map(item => (
                    <tr key={item.name} className="border-b border-snap-border/30 bg-gray-50/50">
                      <td className="px-4 py-2 pl-10 text-snap-muted">{item.name}</td>
                      {Array.from({ length: 12 }, (_, i) => (
                        <td key={i} className="px-2 py-2 text-center font-mono text-snap-muted text-xs">
                          {item.months[i + 1] ? formatShort(item.months[i + 1]) : <span className="text-snap-border/50">—</span>}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-mono text-snap-muted text-xs">
                        {formatCurrency(item.annual)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}

            {/* Grand total row */}
            <tr className="bg-snap-dark text-white">
              <td className="px-4 py-3 font-bold text-sm">TOTAL</td>
              {Array.from({ length: 12 }, (_, i) => {
                const total = getMonthTotal(i)
                return (
                  <td key={i} className="px-2 py-3 text-center font-mono font-bold text-sm">
                    {total > 0 ? formatShort(total) : '—'}
                  </td>
                )
              })}
              <td className="px-3 py-3 text-right font-mono font-bold text-sm">{formatCurrency(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Category breakdown cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {ANNUAL_BUDGET_DATA.map(cat => {
          const tacticColor = TACTIC_COLORS[cat.category] || { bg: '#F4F5F7', text: '#5E6C84', border: '#B3BAC5' }
          const pct = ((cat.annualSubtotal / grandTotal) * 100).toFixed(1)
          return (
            <div key={cat.id} className="bg-white rounded-xl p-4 border border-snap-border shadow-sm">
              <div
                className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2"
                style={{ backgroundColor: tacticColor.bg, color: tacticColor.text }}
              >
                {cat.category}
              </div>
              <p className="text-xl font-bold text-snap-primary font-mono">{formatCurrency(cat.annualSubtotal)}</p>
              <p className="text-xs text-snap-muted mt-1">{pct}% of total</p>
              <div className="mt-2 bg-snap-border rounded-full h-1">
                <div
                  className="h-1 rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: tacticColor.text }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
