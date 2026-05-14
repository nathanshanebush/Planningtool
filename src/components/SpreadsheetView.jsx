import React, { useState, useMemo } from 'react'
import { Download, Plus, ArrowUpDown } from 'lucide-react'
import { TACTIC_COLORS } from '../data/tacticCategories'

const STATUS_COLORS = {
  backlog: { bg: '#F4F5F7', text: '#5E6C84' },
  'in-production': { bg: '#DEEBFF', text: '#0747A6' },
  scheduled: { bg: '#EAE6FF', text: '#403294' },
  'live-active': { bg: '#E3FCEF', text: '#006644' },
  'pending-review': { bg: '#FFFAE6', text: '#172B4D' },
  complete: { bg: '#E3FCEF', text: '#006644' },
}

const STATUS_LABELS = {
  backlog: 'Backlog',
  'in-production': 'In Production',
  scheduled: 'Scheduled',
  'live-active': 'Live / Active',
  'pending-review': 'Pending Review',
  complete: 'Complete',
}

function fmt(n) {
  if (!n && n !== 0) return '—'
  return `$${Number(n).toLocaleString()}`
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

export default function SpreadsheetView({ getAllCards, openCard, addCard }) {
  const [sortKey, setSortKey] = useState('launchDate')
  const [sortDir, setSortDir] = useState('asc')

  const allCards = useMemo(() => getAllCards(), [getAllCards])

  const sorted = useMemo(() => {
    return [...allCards].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'launchDate') {
        av = av ? new Date(av).getTime() : Infinity
        bv = bv ? new Date(bv).getTime() : Infinity
      } else if (['budget', 'annualBudget', 'spendToDate', 'revenueEarned'].includes(sortKey)) {
        av = Number(av) || 0
        bv = Number(bv) || 0
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [allCards, sortKey, sortDir])

  const totals = useMemo(() => ({
    budget: sorted.reduce((s, c) => s + (Number(c.budget) || 0), 0),
    annualBudget: sorted.reduce((s, c) => s + (Number(c.annualBudget) || 0), 0),
    spendToDate: sorted.reduce((s, c) => s + (Number(c.spendToDate) || 0), 0),
    revenueEarned: sorted.reduce((s, c) => s + (Number(c.revenueEarned) || 0), 0),
  }), [sorted])

  const blendedRoi = totals.annualBudget > 0 && totals.revenueEarned > 0
    ? (totals.revenueEarned / totals.annualBudget).toFixed(1) + '×'
    : '—'

  const sort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const exportCSV = () => {
    const headers = ['Campaign Name', 'Type', 'Tactic', 'Owner', 'Launch Date', 'Monthly Budget', 'Annual Budget', 'Spend to Date', 'Revenue Earned', 'Est ROI', 'Status', 'Specialty']
    const rows = sorted.map(c => [
      c.name, c.campaignType, c.tactic, c.owner, c.launchDate,
      c.budget, c.annualBudget, c.spendToDate, c.revenueEarned,
      c.annualBudget > 0 && c.revenueEarned > 0 ? (c.revenueEarned / c.annualBudget).toFixed(2) : '',
      STATUS_LABELS[c.status] || c.status,
      (c.specialty || []).join('; '),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'snapscale-campaigns.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const Th = ({ label, field }) => (
    <th
      onClick={() => sort(field)}
      className="text-left text-xs font-semibold text-[#5E6C84] uppercase tracking-wider px-3 py-2.5 cursor-pointer hover:text-[#172B4D] whitespace-nowrap select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={11} className={sortKey === field ? 'text-[#FF604B]' : 'text-[#DFE1E6]'} />
      </span>
    </th>
  )

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-[#DFE1E6] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6]">
          <h2 className="text-sm font-semibold text-[#172B4D]">All Campaigns <span className="text-[#5E6C84] font-normal">({sorted.length})</span></h2>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm text-[#5E6C84] hover:text-[#172B4D] border border-[#DFE1E6] px-3 py-1.5 rounded-md hover:bg-[#F4F5F7] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F5F7] border-b border-[#DFE1E6]">
              <tr>
                <Th label="Campaign" field="name" />
                <Th label="Type" field="campaignType" />
                <Th label="Tactic" field="tactic" />
                <Th label="Owner" field="owner" />
                <Th label="Launch Date" field="launchDate" />
                <Th label="Monthly $" field="budget" />
                <Th label="Annual $" field="annualBudget" />
                <Th label="Spent" field="spendToDate" />
                <Th label="Revenue" field="revenueEarned" />
                <th className="text-left text-xs font-semibold text-[#5E6C84] uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">ROI</th>
                <Th label="Status" field="status" />
                <th className="text-left text-xs font-semibold text-[#5E6C84] uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Specialty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7]">
              {sorted.map(card => {
                const roi = card.annualBudget > 0 && card.revenueEarned > 0
                  ? (card.revenueEarned / card.annualBudget).toFixed(1) + '×'
                  : '—'
                const sc = STATUS_COLORS[card.status] || STATUS_COLORS.backlog
                return (
                  <tr
                    key={card.id}
                    onClick={() => openCard(card, card._tabKey, card._colKey)}
                    className="hover:bg-[#F4F5F7] cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-[#172B4D] max-w-[200px]">
                      <div className="truncate">{card.name}</div>
                    </td>
                    <td className="px-3 py-2.5 text-[#5E6C84] whitespace-nowrap">{card.campaignType}</td>
                    <td className="px-3 py-2.5">
                      {card.tactic && (
                        <span className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: TACTIC_COLORS[card.tactic]?.bg || '#F4F5F7', color: TACTIC_COLORS[card.tactic]?.text || '#5E6C84' }}>
                          {card.tactic.length > 20 ? card.tactic.slice(0, 18) + '…' : card.tactic}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[#5E6C84] whitespace-nowrap">{card.owner || '—'}</td>
                    <td className="px-3 py-2.5 text-[#5E6C84] whitespace-nowrap font-mono text-xs">{fmtDate(card.launchDate)}</td>
                    <td className="px-3 py-2.5 font-mono text-[#172B4D] whitespace-nowrap">{fmt(card.budget)}</td>
                    <td className="px-3 py-2.5 font-mono text-[#172B4D] whitespace-nowrap">{fmt(card.annualBudget)}</td>
                    <td className="px-3 py-2.5 font-mono text-[#172B4D] whitespace-nowrap">{fmt(card.spendToDate)}</td>
                    <td className="px-3 py-2.5 font-mono text-[#172B4D] whitespace-nowrap">{fmt(card.revenueEarned)}</td>
                    <td className="px-3 py-2.5 font-mono text-[#172B4D] whitespace-nowrap">{roi}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: sc.bg, color: sc.text }}>
                        {STATUS_LABELS[card.status] || card.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#5E6C84] text-xs">{(card.specialty || []).join(', ') || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-[#1A1A2E] text-white">
              <tr>
                <td className="px-3 py-2.5 font-semibold" colSpan={5}>Totals ({sorted.length} campaigns)</td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmt(totals.budget)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmt(totals.annualBudget)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmt(totals.spendToDate)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmt(totals.revenueEarned)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold">{blendedRoi}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
