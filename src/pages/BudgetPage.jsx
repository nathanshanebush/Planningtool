import React, { useState, useMemo } from 'react'
import { DollarSign, TrendingUp, PiggyBank, Target, ChevronDown, ChevronRight, Edit2, Check, X } from 'lucide-react'
import { useCampaigns, useUpdateCampaign } from '../hooks/useCampaigns'
import { ANNUAL_BUDGET_DATA, ANNUAL_BUDGET_TOTAL } from '../data/annualBudget'
import BudgetBuilder from '../components/BudgetBuilder'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${Math.round(num).toLocaleString()}`
}

function fmtFull(n) {
  return `$${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function InlineNumber({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const start = () => { setDraft(String(Number(value) || 0)); setEditing(true) }
  const cancel = () => setEditing(false)
  const commit = () => {
    const n = parseFloat(draft.replace(/[^0-9.]/g, ''))
    if (!isNaN(n)) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
          className="w-24 bg-coal border border-orange/60 text-white text-sm rounded px-2 py-0.5 outline-none"
        />
        <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={13} /></button>
        <button onClick={cancel} className="text-white/40 hover:text-white"><X size={13} /></button>
      </span>
    )
  }

  return (
    <button
      onClick={start}
      className={`group flex items-center gap-1 text-sm font-mono hover:text-orange transition-colors ${className}`}
    >
      {fmtFull(value)}
      <Edit2 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  )
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-jet rounded-xl border border-white/10 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ?? 'bg-orange/10'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/50 mb-0.5">{label}</p>
        <p className="text-lg font-semibold font-mono text-white">{value}</p>
        {sub && <p className="text-xs text-white/40">{sub}</p>}
      </div>
    </div>
  )
}

const CATEGORY_COLORS = {
  'Tradeshows / Events':       'bg-purple-500',
  'Digital & Online Marketing':'bg-blue-500',
  'Broadcast Media':           'bg-cyan-500',
  'Outreach & Direct Sales':   'bg-green-500',
  'Affiliate Referrals':       'bg-amber-500',
  'Print Media / Direct Mail': 'bg-pink-500',
  'Corporate & Brand Initiatives': 'bg-red-500',
  'Admin':                     'bg-gray-500',
}

function CategoryGroup({ category, campaigns, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false)
  const updateCampaign = useUpdateCampaign()

  const totalBudget = campaigns.reduce((s, c) => s + (Number(c.budget) || 0), 0)
  const totalSpent = campaigns.reduce((s, c) => s + (Number(c.spend_to_date) || 0), 0)
  const remaining = totalBudget - totalSpent
  const planTotal = ANNUAL_BUDGET_DATA.find((d) => d.category === category)?.annualSubtotal ?? 0
  const dot = CATEGORY_COLORS[category] ?? 'bg-gray-500'

  const save = (campaign, field, val) => {
    updateCampaign.mutate({ id: campaign.id, [field]: val })
    if (onUpdate) onUpdate(campaign.id, field, val)
  }

  return (
    <div className="bg-jet rounded-xl border border-white/10 overflow-hidden mb-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
        <span className="text-sm font-semibold text-white flex-1 text-left">{category}</span>
        <div className="flex items-center gap-6 text-xs font-mono mr-4">
          <span className="text-white/40">Plan: <span className="text-white/70">{fmt(planTotal)}</span></span>
          <span className="text-white/40">Budget: <span className="text-white">{fmt(totalBudget)}</span></span>
          <span className="text-white/40">Spent: <span className="text-amber-400">{fmt(totalSpent)}</span></span>
          <span className={`${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>{remaining < 0 ? '–' : '+'}{fmt(Math.abs(remaining))}</span>
        </div>
        {collapsed ? <ChevronRight size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
      </button>

      {!collapsed && (
        <div className="border-t border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-2.5 text-xs text-white/40 font-medium">Campaign</th>
                <th className="text-left px-4 py-2.5 text-xs text-white/40 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 text-xs text-white/40 font-medium">Allocated Budget</th>
                <th className="text-right px-4 py-2.5 text-xs text-white/40 font-medium">Spent to Date</th>
                <th className="text-right px-5 py-2.5 text-xs text-white/40 font-medium">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((c) => {
                const budget = Number(c.budget) || 0
                const spent = Number(c.spend_to_date) || 0
                const rem = budget - spent
                const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{c.name}</p>
                      {c.description && <p className="text-white/40 text-xs truncate max-w-xs">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        c.status === 'active' ? 'bg-green-600/20 text-green-400' :
                        c.status === 'planning' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-white/10 text-white/50'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <InlineNumber value={budget} onSave={(v) => save(c, 'budget', v)} className="text-white ml-auto" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <InlineNumber value={spent} onSave={(v) => save(c, 'spend_to_date', v)} className="text-amber-400 ml-auto" />
                        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-right font-mono text-sm font-semibold ${rem < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {rem < 0 ? '-' : '+'}{fmtFull(Math.abs(rem))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function BudgetPage() {
  const { data: campaigns = [], isLoading } = useCampaigns()
  const [showBuilder, setShowBuilder] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map()
    ANNUAL_BUDGET_DATA.forEach((d) => map.set(d.category, []))
    campaigns.forEach((c) => {
      const cat = c.budget_category ?? 'Uncategorized'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat).push(c)
    })
    return [...map.entries()]
  }, [campaigns])

  const totalBudget = campaigns.reduce((s, c) => s + (Number(c.budget) || 0), 0)
  const totalSpent = campaigns.reduce((s, c) => s + (Number(c.spend_to_date) || 0), 0)
  const remaining = totalBudget - totalSpent
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Budget</h2>
        <p className="text-white/50 text-sm mt-0.5">
          Click any amount to edit. Changes sync instantly to Campaign cards.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<DollarSign size={18} className="text-orange" />}
          label="Total Allocated"
          value={fmt(totalBudget)}
          sub={`Plan: ${fmt(ANNUAL_BUDGET_TOTAL)}`}
          accent="bg-orange/10"
        />
        <StatCard
          icon={<Target size={18} className="text-amber-400" />}
          label="Spent to Date"
          value={fmt(totalSpent)}
          sub={`${pct.toFixed(0)}% of budget`}
          accent="bg-amber-400/10"
        />
        <StatCard
          icon={<PiggyBank size={18} className={remaining < 0 ? 'text-red-400' : 'text-green-400'} />}
          label="Remaining"
          value={fmt(Math.abs(remaining))}
          sub={remaining < 0 ? 'Over budget' : 'Available'}
          accent={remaining < 0 ? 'bg-red-400/10' : 'bg-green-400/10'}
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-purple-400" />}
          label="Campaigns"
          value={campaigns.length}
          sub={`${campaigns.filter((c) => c.status === 'active').length} active`}
          accent="bg-purple-400/10"
        />
      </div>

      {/* Budget utilization bar */}
      <div className="bg-jet rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>Budget utilization across all campaigns</span>
          <span className="font-mono">{fmt(totalSpent)} / {fmt(totalBudget)} ({pct.toFixed(1)}%)</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-red-500' : 'bg-orange'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Campaign budget rows grouped by category */}
      <div className="mb-6">
        {grouped.map(([category, cats]) => (
          <CategoryGroup key={category} category={category} campaigns={cats} />
        ))}
      </div>

      {/* Annual Budget Plan (collapsible reference) */}
      <div className="bg-jet rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-white text-left">Annual Budget Plan (Detail)</p>
            <p className="text-xs text-white/40 text-left mt-0.5">Full line-item breakdown by month · {fmt(ANNUAL_BUDGET_TOTAL)} total plan</p>
          </div>
          {showBuilder ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
        </button>
        {showBuilder && (
          <div className="border-t border-white/10">
            <BudgetBuilder />
          </div>
        )}
      </div>
    </div>
  )
}
