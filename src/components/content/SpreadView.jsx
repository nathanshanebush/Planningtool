import React, { useState, useMemo, useRef, useEffect } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import { ArrowUpDown, ChevronRight, Paperclip, Plus, Filter, X, Download, SlidersHorizontal } from 'lucide-react'
import { useTactics, useUpdateTactic, useCreateTactic } from '../../hooks/useTactics'
import { useCampaigns } from '../../hooks/useCampaigns'
import { StatusBadge, PriorityBadge } from '../shared/Badge'
import { InlineEdit } from '../shared/InlineEdit'
import { Button } from '../shared/Button'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { EmptyState } from '../shared/EmptyState'
import { TacticDetailPanel } from './TacticDetailPanel'
import { usePermissions } from '../../hooks/usePermissions'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'

const PRIORITY_BORDERS = {
  Low: 'border-l-4 border-l-gray-500',
  Medium: 'border-l-4 border-l-blue-500',
  High: 'border-l-4 border-l-amber-500',
  Urgent: 'border-l-4 border-l-red-500',
}

function CellDropdown({ value, options, onChange, disabled }) {
  if (disabled) return <span className="text-white/60 text-sm">{value ?? '—'}</span>
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-white/80 text-sm outline-none cursor-pointer hover:text-white w-full"
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function BudgetCell({ value, onSave, disabled }) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(String(value ?? ''))
  const inputRef = React.useRef(null)

  React.useEffect(() => { setDraft(String(value ?? '')) }, [value])
  React.useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const num = Number(draft) || 0
    if (num !== (value ?? 0)) onSave(num)
  }

  if (disabled) {
    return <span className="text-white/60">{value != null ? `$${Number(value).toLocaleString()}` : '—'}</span>
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(String(value ?? '')); setEditing(false) }
        }}
        className="bg-white/10 text-white rounded px-2 py-0.5 outline-none border border-orange/60 w-24 text-right"
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
      title="Click to edit"
    >
      {value != null ? `$${Number(value).toLocaleString()}` : <span className="text-white/40 italic">—</span>}
    </span>
  )
}

export function SpreadView() {
  const { data: tactics, isLoading } = useTactics()
  const { data: campaigns } = useCampaigns()
  const updateTactic = useUpdateTactic()
  const createTactic = useCreateTactic()
  const { canEdit } = usePermissions()

  const [selectedIds, setSelectedIds] = useState([])
  const [activeTactic, setActiveTactic] = useState(null)
  const [sortField, setSortField] = useState('due_date')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({ campaign_id: '', status: '', tactic_type: '', assigned_to: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')
  const [colVisible, setColVisible] = useState({
    campaign: true, type: true, platform: true, traffic: true,
    funnel: true, pillar: true, budget: true, spent: true, creative: true,
  })
  const [showColMenu, setShowColMenu] = useState(false)
  const colMenuRef = useRef(null)

  const campaignMap = useMemo(() => {
    const m = {}
    ;(campaigns ?? []).forEach((c) => { m[c.id] = c.name })
    return m
  }, [campaigns])

  const filtered = useMemo(() => {
    let data = [...(tactics ?? [])]
    if (filters.campaign_id) data = data.filter((t) => t.campaign_id === filters.campaign_id)
    if (filters.status) data = data.filter((t) => t.status === filters.status)
    if (filters.tactic_type) data = data.filter((t) => t.tactic_type === filters.tactic_type)
    data.sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return data
  }, [tactics, filters, sortField, sortDir])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const toggleRow = (id) => setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((t) => t.id))

  const update = (id, data) => updateTactic.mutate({ id, ...data })

  const applyBulkStatus = () => {
    if (!bulkStatus) return
    selectedIds.forEach((id) => update(id, { status: bulkStatus }))
    setSelectedIds([])
    setBulkStatus('')
  }

  const addTactic = async () => {
    await createTactic.mutateAsync({
      name: 'New Tactic',
      campaign_id: filters.campaign_id || (campaigns?.[0]?.id ?? ''),
      status: 'Not Started',
      priority: 'Medium',
    })
  }

  const exportCSV = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const headers = ['Name', 'Campaign', 'Type', 'Platform', 'Traffic Source', 'Funnel Step', 'Content Pillar', 'Due Date', 'Status', 'Priority', 'Budget', 'Spent', 'Assigned To']
    const rows = filtered.map((t) => [
      q(t.name),
      q(campaignMap[t.campaign_id] ?? ''),
      q(t.tactic_type),
      q(t.platform),
      q(t.traffic_source),
      q(t.funnel_step),
      q(t.content_pillar),
      q(t.due_date),
      q(t.status),
      q(t.priority),
      q(t.budget),
      q(t.spend_to_date),
      q(t.assigned_to),
    ].join(','))
    const csvString = [headers.map(q).join(','), ...rows].join('\n')
    const url = URL.createObjectURL(new Blob([csvString], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `tactics-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!showColMenu) return
    const handler = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) {
        setShowColMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColMenu])

  const Th = ({ label, field, className = '' }) => (
    <th
      onClick={field ? () => toggleSort(field) : undefined}
      className={`text-left px-3 py-3 text-xs font-medium text-white/50 whitespace-nowrap
        ${field ? 'cursor-pointer hover:text-white/80 select-none' : ''} ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        {field && <ArrowUpDown size={10} className={sortField === field ? 'text-orange' : 'text-white/20'} />}
      </span>
    </th>
  )

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} /> Filters
          {Object.values(filters).some(Boolean) && <span className="w-2 h-2 rounded-full bg-orange" />}
        </Button>
        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filters.campaign_id}
              onChange={(e) => setFilters((f) => ({ ...f, campaign_id: e.target.value }))}
              className="bg-jet border border-white/10 text-white text-xs rounded px-2 py-1.5 outline-none"
            >
              <option value="">All Campaigns</option>
              {campaigns?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="bg-jet border border-white/10 text-white text-xs rounded px-2 py-1.5 outline-none"
            >
              <option value="">All Statuses</option>
              {MOCK_DROPDOWNS['Asset Status'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filters.tactic_type}
              onChange={(e) => setFilters((f) => ({ ...f, tactic_type: e.target.value }))}
              className="bg-jet border border-white/10 text-white text-xs rounded px-2 py-1.5 outline-none"
            >
              <option value="">All Types</option>
              {MOCK_DROPDOWNS['Tactic Type'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {Object.values(filters).some(Boolean) && (
              <button onClick={() => setFilters({ campaign_id: '', status: '', tactic_type: '', assigned_to: '' })}
                className="text-white/40 hover:text-white text-xs flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exportCSV} title="Export CSV">
            <Download size={14} /> Export CSV
          </Button>
          <div className="relative" ref={colMenuRef}>
            <Button variant="ghost" size="sm" onClick={() => setShowColMenu((v) => !v)} title="Toggle columns">
              <SlidersHorizontal size={14} />
            </Button>
            {showColMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-coal border border-white/10 rounded-lg shadow-xl p-3 min-w-[160px]">
                <p className="text-white/40 text-xs font-medium mb-2 uppercase tracking-wide">Columns</p>
                {[
                  { key: 'campaign', label: 'Campaign' },
                  { key: 'type', label: 'Type' },
                  { key: 'platform', label: 'Platform' },
                  { key: 'traffic', label: 'Traffic' },
                  { key: 'funnel', label: 'Funnel' },
                  { key: 'pillar', label: 'Pillar' },
                  { key: 'budget', label: 'Budget' },
                  { key: 'spent', label: 'Spent' },
                  { key: 'creative', label: 'Creative' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 py-1 cursor-pointer hover:text-white text-white/70 text-sm">
                    <input
                      type="checkbox"
                      checked={colVisible[key]}
                      onChange={() => setColVisible((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className="accent-orange"
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-orange/10 border border-orange/20 rounded-lg px-4 py-2.5 mb-3 text-sm">
          <span className="text-white font-medium">{selectedIds.length} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="bg-coal border border-white/20 text-white text-xs rounded px-2 py-1.5 outline-none"
          >
            <option value="">Change Status…</option>
            {MOCK_DROPDOWNS['Asset Status'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {bulkStatus && <Button size="sm" variant="primary" onClick={applyBulkStatus}>Apply</Button>}
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/10">
        {filtered.length === 0 ? (
          <EmptyState title="No tactics found" description="Try adjusting your filters or add a new tactic." />
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-jet sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-orange"
                  />
                </th>
                <Th label="Tactic Name" field="name" className="min-w-[180px]" />
                {colVisible.campaign && <Th label="Campaign" field="campaign_id" className="min-w-[140px]" />}
                {colVisible.type && <Th label="Type" field="tactic_type" />}
                {colVisible.platform && <Th label="Platform" field="platform" />}
                {colVisible.traffic && <Th label="Traffic" field="traffic_source" />}
                {colVisible.funnel && <Th label="Funnel" field="funnel_step" />}
                {colVisible.pillar && <Th label="Pillar" field="content_pillar" />}
                <Th label="Due Date" field="due_date" />
                <Th label="Status" field="status" />
                <Th label="Priority" field="priority" />
                {colVisible.budget && <Th label="Budget" field="budget" />}
                {colVisible.spent && <Th label="Spent" field="spend_to_date" />}
                {colVisible.creative && <th className="px-3 py-3 text-xs font-medium text-white/50">Creative</th>}
                <th className="px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((t) => {
                const overdue = t.due_date && isPast(parseISO(t.due_date)) && !['Approved', 'Published'].includes(t.status)
                const selected = selectedIds.includes(t.id)
                return (
                  <tr
                    key={t.id}
                    className={`
                      hover:bg-white/5 transition-colors ${PRIORITY_BORDERS[t.priority] ?? ''}
                      ${selected ? 'bg-orange/5' : ''}
                    `}
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={selected} onChange={() => toggleRow(t.id)} className="accent-orange" />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-white min-w-[180px]">
                      <InlineEdit value={t.name} onSave={(v) => update(t.id, { name: v })} disabled={!canEdit} />
                    </td>
                    {colVisible.campaign && (
                      <td className="px-3 py-2.5 text-white/60">
                        <CellDropdown
                          value={campaignMap[t.campaign_id]}
                          options={campaigns?.map((c) => c.name) ?? []}
                          onChange={(v) => {
                            const c = campaigns?.find((c) => c.name === v)
                            if (c) update(t.id, { campaign_id: c.id })
                          }}
                          disabled={!canEdit}
                        />
                      </td>
                    )}
                    {colVisible.type && (
                      <td className="px-3 py-2.5">
                        <CellDropdown value={t.tactic_type} options={MOCK_DROPDOWNS['Tactic Type']} onChange={(v) => update(t.id, { tactic_type: v })} disabled={!canEdit} />
                      </td>
                    )}
                    {colVisible.platform && (
                      <td className="px-3 py-2.5">
                        <CellDropdown value={t.platform} options={MOCK_DROPDOWNS['Platform']} onChange={(v) => update(t.id, { platform: v })} disabled={!canEdit} />
                      </td>
                    )}
                    {colVisible.traffic && (
                      <td className="px-3 py-2.5">
                        <CellDropdown value={t.traffic_source} options={MOCK_DROPDOWNS['Traffic Source']} onChange={(v) => update(t.id, { traffic_source: v })} disabled={!canEdit} />
                      </td>
                    )}
                    {colVisible.funnel && (
                      <td className="px-3 py-2.5">
                        <CellDropdown value={t.funnel_step} options={MOCK_DROPDOWNS['Funnel Step']} onChange={(v) => update(t.id, { funnel_step: v })} disabled={!canEdit} />
                      </td>
                    )}
                    {colVisible.pillar && (
                      <td className="px-3 py-2.5">
                        <CellDropdown value={t.content_pillar} options={MOCK_DROPDOWNS['Content Pillar']} onChange={(v) => update(t.id, { content_pillar: v })} disabled={!canEdit} />
                      </td>
                    )}
                    <td className={`px-3 py-2.5 text-sm whitespace-nowrap ${overdue ? 'text-red-400' : 'text-white/60'}`}>
                      {canEdit ? (
                        <input
                          type="date"
                          value={t.due_date ?? ''}
                          onChange={(e) => update(t.id, { due_date: e.target.value })}
                          className="bg-transparent text-sm outline-none cursor-pointer w-full"
                        />
                      ) : (
                        t.due_date ? format(parseISO(t.due_date), 'MMM d') : '—'
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {canEdit ? (
                        <select
                          value={t.status ?? ''}
                          onChange={(e) => update(t.id, { status: e.target.value })}
                          className="bg-transparent text-sm outline-none cursor-pointer"
                        >
                          {MOCK_DROPDOWNS['Asset Status'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <StatusBadge status={t.status} />
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {canEdit ? (
                        <select
                          value={t.priority ?? ''}
                          onChange={(e) => update(t.id, { priority: e.target.value })}
                          className="bg-transparent text-sm outline-none cursor-pointer"
                        >
                          {MOCK_DROPDOWNS['Priority'].map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : (
                        <PriorityBadge priority={t.priority} />
                      )}
                    </td>
                    {colVisible.budget && (
                      <td className="px-3 py-2.5 text-white/70 font-mono text-sm whitespace-nowrap">
                        <BudgetCell value={t.budget} onSave={(v) => update(t.id, { budget: v })} disabled={!canEdit} />
                      </td>
                    )}
                    {colVisible.spent && (
                      <td className="px-3 py-2.5 text-white/70 font-mono text-sm whitespace-nowrap">
                        <BudgetCell value={t.spend_to_date} onSave={(v) => update(t.id, { spend_to_date: v })} disabled={!canEdit} />
                      </td>
                    )}
                    {colVisible.creative && (
                      <td className="px-3 py-2.5 text-center">
                        <Paperclip size={14} className="text-white/30 mx-auto" />
                      </td>
                    )}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setActiveTactic(t)}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Tactic */}
      {canEdit && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={addTactic} disabled={createTactic.isPending}>
            <Plus size={14} /> Add Tactic
          </Button>
        </div>
      )}

      <TacticDetailPanel
        tactic={activeTactic}
        open={!!activeTactic}
        onClose={() => setActiveTactic(null)}
      />
    </div>
  )
}
