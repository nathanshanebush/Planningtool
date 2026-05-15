import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Download, ArrowUpDown, ExternalLink } from 'lucide-react'
import { TACTIC_COLORS, OWNERS, TACTIC_CATEGORIES } from '../data/tacticCategories'

const STATUS_COLORS = {
  backlog: { bg: '#F4F5F7', text: '#5E6C84' },
  'in-production': { bg: '#DEEBFF', text: '#0747A6' },
  scheduled: { bg: '#EAE6FF', text: '#403294' },
  'live-active': { bg: '#E3FCEF', text: '#006644' },
  'pending-review': { bg: '#FFFAE6', text: '#172B4D' },
  complete: { bg: '#E3FCEF', text: '#006644' },
}

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-production', label: 'In Production' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live-active', label: 'Live / Active' },
  { value: 'pending-review', label: 'Pending Review' },
  { value: 'complete', label: 'Complete' },
]

function fmtMoney(n) {
  const num = Number(n)
  if (!num && num !== 0) return '—'
  return `$${num.toLocaleString()}`
}

function fmtDate(d) {
  if (!d) return '—'
  try {
    const parts = d.split('-')
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

// Inline number editor — click the cell value to edit, Enter/blur to save
function NumberCell({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const start = (e) => {
    e.stopPropagation()
    setDraft(value ?? '')
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select()
  }, [editing])

  const commit = () => {
    setEditing(false)
    const num = draft === '' ? 0 : Number(draft)
    if (!isNaN(num)) onSave(num)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        onClick={e => e.stopPropagation()}
        className={`w-full font-mono text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50 ${className}`}
        style={{ minWidth: 70 }}
      />
    )
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      className={`cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors font-mono text-sm ${className}`}
    >
      {fmtMoney(value)}
    </span>
  )
}

// Inline text editor
function TextCell({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const start = (e) => {
    e.stopPropagation()
    setDraft(value || '')
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select()
  }, [editing])

  const commit = () => {
    setEditing(false)
    onSave(draft)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        onClick={e => e.stopPropagation()}
        className={`w-full text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50 ${className}`}
        style={{ minWidth: 120 }}
      />
    )
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      className={`cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors text-sm ${className}`}
    >
      {value || <span className="text-[#B3BAC5] italic">—</span>}
    </span>
  )
}

// Inline date editor
function DateCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  const start = (e) => {
    e.stopPropagation()
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.showPicker?.()
  }, [editing])

  const commit = (e) => {
    setEditing(false)
    onSave(e.target.value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={value || ''}
        onBlur={commit}
        onChange={commit}
        onKeyDown={e => { if (e.key === 'Escape') setEditing(false) }}
        onClick={e => e.stopPropagation()}
        className="text-xs font-mono border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50"
      />
    )
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      className="cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors font-mono text-xs"
    >
      {fmtDate(value)}
    </span>
  )
}

// Inline select editor
function SelectCell({ value, options, onSave, renderValue }) {
  const [editing, setEditing] = useState(false)
  const selectRef = useRef(null)

  const start = (e) => {
    e.stopPropagation()
    setEditing(true)
  }

  useEffect(() => {
    if (editing && selectRef.current) selectRef.current.focus()
  }, [editing])

  const commit = (e) => {
    setEditing(false)
    onSave(e.target.value)
  }

  if (editing) {
    return (
      <select
        ref={selectRef}
        defaultValue={value || ''}
        onBlur={commit}
        onChange={commit}
        onKeyDown={e => { if (e.key === 'Escape') setEditing(false) }}
        onClick={e => e.stopPropagation()}
        className="text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50"
      >
        <option value="">—</option>
        {options.map(o => (
          <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
        ))}
      </select>
    )
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      className="cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors text-sm"
    >
      {renderValue ? renderValue(value) : (value || <span className="text-[#B3BAC5] italic">—</span>)}
    </span>
  )
}

export default function SpreadsheetView({ getAllCards, openCard, onUpdate }) {
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
      } else {
        av = (av || '').toLowerCase()
        bv = (bv || '').toLowerCase()
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
    ? (totals.revenueEarned / totals.annualBudget).toFixed(2) + '×'
    : '—'

  const sort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const update = (card, field, value) => {
    onUpdate(card._tabKey, card._colKey, card.id, { [field]: value })
  }

  const exportCSV = () => {
    const headers = ['Campaign Name', 'Type', 'Tactic', 'Owner', 'Launch Date', 'Monthly Budget', 'Annual Budget', 'Spend to Date', 'Revenue Earned', 'Est ROI', 'Status', 'Specialty']
    const rows = sorted.map(c => [
      c.name, c.campaignType, c.tactic, c.owner, c.launchDate,
      c.budget, c.annualBudget, c.spendToDate, c.revenueEarned,
      c.annualBudget > 0 && c.revenueEarned > 0 ? (c.revenueEarned / c.annualBudget).toFixed(2) : '',
      (STATUS_OPTIONS.find(s => s.value === c.status) || {}).label || c.status,
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
          <div>
            <h2 className="text-sm font-semibold text-[#172B4D]">
              All Campaigns <span className="text-[#5E6C84] font-normal">({sorted.length})</span>
            </h2>
            <p className="text-xs text-[#5E6C84] mt-0.5">Click any cell to edit inline. Click <ExternalLink size={10} className="inline" /> to open full card.</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm text-[#5E6C84] hover:text-[#172B4D] border border-[#DFE1E6] px-3 py-1.5 rounded-md hover:bg-[#F4F5F7] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#F4F5F7] border-b border-[#DFE1E6]">
              <tr>
                <th className="w-8 px-2 py-2.5" />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7]">
              {sorted.map(card => {
                const roi = Number(card.annualBudget) > 0 && Number(card.revenueEarned) > 0
                  ? (Number(card.revenueEarned) / Number(card.annualBudget)).toFixed(2) + '×'
                  : '—'
                const sc = STATUS_COLORS[card.status] || STATUS_COLORS.backlog

                return (
                  <tr key={card.id} className="hover:bg-[#FAFBFC] transition-colors group">

                    {/* Open full card button */}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => openCard(card, card._tabKey, card._colKey)}
                        title="Open full card"
                        className="opacity-0 group-hover:opacity-100 text-[#5E6C84] hover:text-[#0747A6] transition-all"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </td>

                    {/* Campaign Name */}
                    <td className="px-3 py-2 font-semibold text-[#172B4D] max-w-[200px]">
                      <TextCell
                        value={card.name}
                        onSave={v => update(card, 'name', v)}
                        className="font-semibold"
                      />
                    </td>

                    {/* Type — read-only (set by tab) */}
                    <td className="px-3 py-2 text-[#5E6C84] whitespace-nowrap text-xs">{card.campaignType}</td>

                    {/* Tactic */}
                    <td className="px-3 py-2">
                      <SelectCell
                        value={card.tactic}
                        options={TACTIC_CATEGORIES}
                        onSave={v => update(card, 'tactic', v)}
                        renderValue={v => v ? (
                          <span className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: TACTIC_COLORS[v]?.bg || '#F4F5F7', color: TACTIC_COLORS[v]?.text || '#5E6C84' }}>
                            {v.length > 22 ? v.slice(0, 20) + '…' : v}
                          </span>
                        ) : null}
                      />
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <SelectCell
                        value={card.owner}
                        options={OWNERS}
                        onSave={v => update(card, 'owner', v)}
                      />
                    </td>

                    {/* Launch Date */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <DateCell
                        value={card.launchDate}
                        onSave={v => update(card, 'launchDate', v)}
                      />
                    </td>

                    {/* Monthly Budget */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <NumberCell
                        value={card.budget}
                        onSave={v => update(card, 'budget', v)}
                      />
                    </td>

                    {/* Annual Budget */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <NumberCell
                        value={card.annualBudget}
                        onSave={v => update(card, 'annualBudget', v)}
                      />
                    </td>

                    {/* Spend to Date */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <NumberCell
                        value={card.spendToDate}
                        onSave={v => update(card, 'spendToDate', v)}
                        className="text-[#FF5630]"
                      />
                    </td>

                    {/* Revenue Earned */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <NumberCell
                        value={card.revenueEarned}
                        onSave={v => update(card, 'revenueEarned', v)}
                        className="text-[#36B37E]"
                      />
                    </td>

                    {/* ROI — computed, read-only */}
                    <td className="px-3 py-2 font-mono text-[#172B4D] whitespace-nowrap font-semibold text-xs">
                      {roi}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <SelectCell
                        value={card.status}
                        options={STATUS_OPTIONS}
                        onSave={v => update(card, 'status', v)}
                        renderValue={v => {
                          const c = STATUS_COLORS[v] || STATUS_COLORS.backlog
                          const label = (STATUS_OPTIONS.find(s => s.value === v) || {}).label || v
                          return (
                            <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.text }}>
                              {label}
                            </span>
                          )
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-[#1A1A2E] text-white">
              <tr>
                <td colSpan={6} className="px-3 py-2.5 font-semibold text-sm">
                  Totals — {sorted.length} campaigns
                </td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmtMoney(totals.budget)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold">{fmtMoney(totals.annualBudget)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold text-red-300">{fmtMoney(totals.spendToDate)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold text-green-300">{fmtMoney(totals.revenueEarned)}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-yellow-300">{blendedRoi}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
