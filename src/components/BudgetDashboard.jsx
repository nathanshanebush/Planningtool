import React from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, DollarSign, PiggyBank, Target } from 'lucide-react'

const CATEGORY_COLORS = {
  'Tradeshows / Events': '#8B5CF6',
  'Digital & Online Marketing': '#3B82F6',
  'Broadcast Media': '#06B6D4',
  'Outreach & Direct Sales': '#10B981',
  'Affiliate Referrals': '#F59E0B',
  'Print Media / Direct Mail': '#EC4899',
  'Corporate & Brand Initiatives': '#EF4444',
  'Admin': '#6B7280',
}

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString()}`
}

export default function BudgetDashboard({ budgetStats }) {
  const { totalAnnualBudget, totalSpent, remaining, roi, categoryData } = budgetStats
  const spentPct = totalAnnualBudget > 0 ? Math.min((totalSpent / totalAnnualBudget) * 100, 100) : 0

  const chartData = categoryData.slice(0, 6).map(d => ({
    name: d.name.length > 20 ? d.name.slice(0, 18) + '…' : d.name,
    fullName: d.name,
    value: d.allocated,
  }))

  return (
    <div className="bg-[#1A1A2E] text-white px-4 py-3 border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-wrap gap-3 items-start">
          <div className="flex gap-3 flex-wrap flex-1">
            <StatCard icon={<DollarSign size={14} />} label="Annual Budget" value={fmt(totalAnnualBudget)} />
            <StatCard icon={<Target size={14} />} label="Spent to Date" value={fmt(totalSpent)} highlight />
            <StatCard icon={<PiggyBank size={14} />} label="Remaining" value={fmt(remaining)} positive={remaining > 0} />
            <StatCard icon={<TrendingUp size={14} />} label="Est. ROI" value={roi > 0 ? `${roi.toFixed(1)}\xd7` : '—'} />
          </div>

          <div className="flex-1 min-w-[200px] max-w-[400px]">
            <div className="text-xs text-white/50 mb-1.5">Budget by Category</div>
            <ResponsiveContainer width="100%" height={50}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                  contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 11 }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                />
                <Bar dataKey="value" radius={2}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[entry.fullName] || '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Budget utilization</span>
            <span>{spentPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF604B] rounded-full transition-all duration-500"
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, highlight, positive }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 min-w-[120px]">
      <div className="text-[#FF604B]">{icon}</div>
      <div>
        <div className="text-xs text-white/50">{label}</div>
        <div className={`text-sm font-mono font-semibold ${positive === false ? 'text-red-400' : positive ? 'text-green-400' : 'text-white'}`}>
          {value}
        </div>
      </div>
    </div>
  )
}
