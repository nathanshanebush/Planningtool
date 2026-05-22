import React, { useState } from 'react'
import { useTactics } from '../../hooks/useTactics'
import { useCampaigns } from '../../hooks/useCampaigns'
import { TacticDetailPanel } from './TacticDetailPanel'
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'

function SummaryCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-jet border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-orange/15 flex items-center justify-center">
          <Icon size={14} className="text-orange" />
        </div>
        <span className="text-xs text-white/50 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </div>
  )
}

function roiPct(budget, revenue) {
  if (!budget && !revenue) return null
  if (!budget) return 100
  return ((revenue - budget) / budget) * 100
}

function ROIPill({ pct }) {
  if (pct === null) return <span className="text-white/30 text-sm">—</span>
  const color = pct > 0 ? 'text-green-400' : pct < 0 ? 'text-red-400' : 'text-white/40'
  return <span className={`text-sm font-semibold ${color}`}>{pct > 0 ? '+' : ''}{pct.toFixed(1)}%</span>
}

export function ROIView() {
  const { data: tactics = [] } = useTactics()
  const { data: campaigns = [] } = useCampaigns()
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [selectedTactic, setSelectedTactic] = useState(null)

  const campaignMap = Object.fromEntries(campaigns.map((c) => [c.id, c.name]))

  const filtered = campaignFilter === 'all'
    ? tactics
    : tactics.filter((t) => t.campaign_id === campaignFilter)

  const totalRevenue = filtered.reduce((s, t) => s + (t.revenue_generated || 0), 0)
  const totalBudget = filtered.reduce((s, t) => s + (t.budget || 0), 0)
  const totalAppointments = filtered.reduce((s, t) => s + (t.appointments_booked || 0), 0)
  const overallROI = roiPct(totalBudget, totalRevenue)

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70">ROI Summary</h3>
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="bg-jet border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-orange/60"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="across filtered tactics"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Budget Spent"
          value={`$${totalBudget.toLocaleString()}`}
          sub="allocated budget"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Overall ROI"
          value={overallROI !== null ? `${overallROI > 0 ? '+' : ''}${overallROI.toFixed(1)}%` : '—'}
          sub="revenue vs budget"
        />
        <SummaryCard
          icon={Calendar}
          label="Appointments"
          value={totalAppointments.toLocaleString()}
          sub="total booked"
        />
      </div>

      <div className="bg-jet border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Tactic Name', 'Campaign', 'Budget', 'Revenue', 'Appointments', 'Leads', 'Sales', 'ROI %'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">No tactics found.</td>
                </tr>
              )}
              {filtered.map((t) => {
                const pct = roiPct(t.budget || 0, t.revenue_generated || 0)
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTactic(t)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{t.name}</td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap max-w-[160px] truncate">{campaignMap[t.campaign_id] ?? t.campaign_id}</td>
                    <td className="px-4 py-3 text-white/80 whitespace-nowrap">${(t.budget || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-white/80 whitespace-nowrap">${(t.revenue_generated || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-white/80">{t.appointments_booked ?? 0}</td>
                    <td className="px-4 py-3 text-white/80">{t.leads_generated ?? 0}</td>
                    <td className="px-4 py-3 text-white/80">{t.sales_count ?? 0}</td>
                    <td className="px-4 py-3"><ROIPill pct={pct} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTactic && (
        <TacticDetailPanel
          tactic={selectedTactic}
          open={!!selectedTactic}
          onClose={() => setSelectedTactic(null)}
        />
      )}
    </div>
  )
}
