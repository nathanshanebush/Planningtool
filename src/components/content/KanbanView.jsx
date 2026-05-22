import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Layers, User, ChevronDown, ChevronRight, Plus, X, SlidersHorizontal } from 'lucide-react'
import { useTactics, useUpdateTactic, useCreateTactic } from '../../hooks/useTactics'
import { useCampaigns } from '../../hooks/useCampaigns'
import { TacticCard } from './TacticCard'
import { TacticDetailPanel } from './TacticDetailPanel'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'
import { usePermissions } from '../../hooks/usePermissions'

const STATUS_COLUMNS = MOCK_DROPDOWNS['Asset Status']

const COLUMN_STYLES = {
  'Not Started': 'border-t-gray-500',
  'In Progress': 'border-t-blue-500',
  'Needs Review': 'border-t-amber-500',
  'Approved': 'border-t-green-500',
  'Published': 'border-t-teal-500',
  'On Hold': 'border-t-red-500',
}

// Makes the column body a drop target so empty columns accept cards
function DroppableBody({ status, children, className }) {
  const id = `col::${status}`
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-colors ${isOver ? 'bg-white/5 ring-1 ring-inset ring-orange/40' : ''}`}
    >
      {children}
    </div>
  )
}

function SortableCard({ tactic, campaignName, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tactic.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TacticCard tactic={tactic} campaignName={campaignName} onClick={onClick} />
    </div>
  )
}

// Inline quick-add form at bottom of each column
function QuickAdd({ status, defaultCampaignId, campaigns, onAdded }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [campaignId, setCampaignId] = useState(defaultCampaignId ?? '')
  const createTactic = useCreateTactic()

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await createTactic.mutateAsync({
      name: name.trim(),
      status,
      campaign_id: campaignId || null,
      priority: 'Medium',
    })
    setName('')
    setOpen(false)
    if (onAdded) onAdded()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-colors mt-1"
      >
        <Plus size={12} /> Add card
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="mt-1 bg-coal border border-white/10 rounded-lg p-2 space-y-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Card title…"
        className="w-full bg-jet border border-white/10 text-white text-xs rounded px-2.5 py-1.5 outline-none focus:border-orange/60 placeholder-white/20"
      />
      {!defaultCampaignId && campaigns?.length > 0 && (
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="w-full bg-jet border border-white/10 text-white/70 text-xs rounded px-2 py-1.5 outline-none focus:border-orange/60"
        >
          <option value="">No campaign</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={!name.trim() || createTactic.isPending}
          className="flex-1 bg-orange text-white text-xs rounded px-2 py-1.5 font-medium hover:bg-orange/90 disabled:opacity-40 transition-colors"
        >
          {createTactic.isPending ? '…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setName('') }}
          className="px-2 py-1.5 text-white/40 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </form>
  )
}

// A single status column used in both flat and grouped views
function Column({ status, items, campaignName, campaigns, defaultCampaignId, onCardClick, compact = false }) {
  const w = compact ? 'w-56' : 'w-64'
  return (
    <div className={`flex flex-col ${w} shrink-0 bg-jet rounded-xl border-t-2 ${COLUMN_STYLES[status] ?? ''} border border-white/10`}>
      <div className={`flex items-center justify-between ${compact ? 'px-3 py-2' : 'px-4 py-3'} border-b border-white/10`}>
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-white`}>{status}</h3>
        <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">{items.length}</span>
      </div>
      <DroppableBody status={status} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
        <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {items.map((t) => (
            <SortableCard
              key={t.id}
              tactic={t}
              campaignName={campaignName ?? undefined}
              onClick={() => onCardClick(t)}
            />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="text-center py-4 text-white/20 text-xs select-none">Drop here</div>
        )}
        <QuickAdd
          status={status}
          defaultCampaignId={defaultCampaignId}
          campaigns={campaigns}
          onAdded={() => {}}
        />
      </DroppableBody>
    </div>
  )
}

function GroupSection({ label, tactics, campaignId, campaignMap, campaigns, onCardClick }) {
  const [collapsed, setCollapsed] = useState(false)
  // Derive defaultCampaignId from the group label (if grouped by campaign)
  const defaultCampaignId = campaignId ??
    Object.entries(campaignMap).find(([, name]) => name === label)?.[0] ?? null

  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 text-white/60 hover:text-white transition-colors text-sm font-semibold"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        <span>{label}</span>
        <span className="text-white/30 font-normal">({tactics.length})</span>
      </button>

      {!collapsed && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STATUS_COLUMNS.map((status) => {
            const items = tactics.filter((t) => t.status === status)
            return (
              <Column
                key={status}
                status={status}
                items={items}
                campaigns={campaigns}
                defaultCampaignId={defaultCampaignId}
                onCardClick={onCardClick}
                compact
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

const PRIORITY_COLORS = {
  Low: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  High: 'bg-orange/20 text-orange border-orange/40',
  Urgent: 'bg-red-500/20 text-red-400 border-red-500/40',
}

function FilterPopover({ filters, setFilters, onClose }) {
  const popoverRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose()
      }
    }
    // Delay to prevent immediate close from the trigger click
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  const togglePriority = (p) => {
    setFilters((f) => ({
      ...f,
      priorities: f.priorities.includes(p)
        ? f.priorities.filter((x) => x !== p)
        : [...f.priorities, p],
    }))
  }

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-2 w-72 bg-coal border border-white/10 rounded-xl shadow-2xl z-30 p-4 space-y-4"
    >
      {/* Priority */}
      <div>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Priority</p>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_DROPDOWNS['Priority'].map((p) => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-medium
                ${filters.priorities.includes(p)
                  ? (PRIORITY_COLORS[p] ?? 'bg-white/20 text-white border-white/20')
                  : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tactic Type */}
      <div>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Tactic Type</p>
        <select
          value={filters.tactic_type}
          onChange={(e) => setFilters((f) => ({ ...f, tactic_type: e.target.value }))}
          className="w-full bg-jet border border-white/10 text-white/80 text-xs rounded-lg px-3 py-2 outline-none focus:border-orange/60"
        >
          <option value="">All types</option>
          {MOCK_DROPDOWNS['Tactic Type'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Assigned To */}
      <div>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Assigned To</p>
        <input
          type="text"
          value={filters.assigned_to}
          onChange={(e) => setFilters((f) => ({ ...f, assigned_to: e.target.value }))}
          placeholder="Filter by assignee…"
          className="w-full bg-jet border border-white/10 text-white/80 text-xs rounded-lg px-3 py-2 outline-none focus:border-orange/60 placeholder-white/20"
        />
      </div>
    </div>
  )
}

export function KanbanView({ campaignId }) {
  const { data: tactics, isLoading } = useTactics(campaignId ? { campaign_id: campaignId } : undefined)
  const { data: campaigns } = useCampaigns()
  const updateTactic = useUpdateTactic()
  const { canEdit } = usePermissions()
  const [panelTactic, setPanelTactic] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [filters, setFilters] = useState({ priorities: [], tactic_type: '', assigned_to: '' })
  const [showFilterPopover, setShowFilterPopover] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const campaignMap = useMemo(() => {
    const m = {}
    ;(campaigns ?? []).forEach((c) => { m[c.id] = c.name })
    return m
  }, [campaigns])

  const filtered = useMemo(() => {
    let t = tactics ?? []
    if (filters.priorities.length) t = t.filter((x) => filters.priorities.includes(x.priority))
    if (filters.tactic_type) t = t.filter((x) => x.tactic_type === filters.tactic_type)
    if (filters.assigned_to) t = t.filter((x) => (x.assigned_to ?? '').toLowerCase().includes(filters.assigned_to.toLowerCase()))
    return t
  }, [tactics, filters])

  const hasActiveFilters = filters.priorities.length > 0 || filters.tactic_type || filters.assigned_to

  const clearFilters = () => setFilters({ priorities: [], tactic_type: '', assigned_to: '' })

  const removeFilter = (type, value) => {
    if (type === 'priority') {
      setFilters((f) => ({ ...f, priorities: f.priorities.filter((p) => p !== value) }))
    } else if (type === 'tactic_type') {
      setFilters((f) => ({ ...f, tactic_type: '' }))
    } else if (type === 'assigned_to') {
      setFilters((f) => ({ ...f, assigned_to: '' }))
    }
  }

  const byStatus = useMemo(() => {
    const m = {}
    STATUS_COLUMNS.forEach((s) => { m[s] = [] })
    filtered.forEach((t) => { if (m[t.status]) m[t.status].push(t) })
    return m
  }, [filtered])

  const groups = useMemo(() => {
    if (groupBy === 'none' || !filtered) return null
    const map = new Map()
    filtered.forEach((t) => {
      const key = groupBy === 'campaign'
        ? (campaignMap[t.campaign_id] ?? 'No Campaign')
        : (t.assigned_to ?? 'Unassigned')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    })
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered, groupBy, campaignMap])

  const draggedTactic = useMemo(() => (tactics ?? []).find((t) => t.id === activeId), [activeId, tactics])

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id || !canEdit) return

    // over.id can be a tactic id, or a droppable column id like "col::In Progress"
    let newStatus = null
    if (typeof over.id === 'string' && over.id.startsWith('col::')) {
      newStatus = over.id.replace('col::', '')
    } else {
      newStatus = STATUS_COLUMNS.find((col) =>
        byStatus[col]?.some((t) => t.id === over.id)
      )
    }

    if (newStatus && newStatus !== (tactics ?? []).find((t) => t.id === active.id)?.status) {
      updateTactic.mutate({ id: active.id, status: newStatus })
    }
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wide">Group by</span>
        <div className="flex bg-jet border border-white/10 rounded-lg p-0.5 gap-0.5">
          {[
            { value: 'none', label: 'Status', icon: <Layers size={12} /> },
            { value: 'campaign', label: 'Campaign', icon: <Layers size={12} /> },
            { value: 'assigned_to', label: 'Assigned To', icon: <User size={12} /> },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setGroupBy(value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors
                ${groupBy === value ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Filter button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterPopover((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${hasActiveFilters
                ? 'bg-orange/10 text-orange border-orange/30 hover:bg-orange/20'
                : 'bg-jet border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
          >
            <SlidersHorizontal size={13} />
            Filter
            {hasActiveFilters && (
              <span className="ml-0.5 bg-orange text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {filters.priorities.length + (filters.tactic_type ? 1 : 0) + (filters.assigned_to ? 1 : 0)}
              </span>
            )}
          </button>

          {showFilterPopover && (
            <FilterPopover
              filters={filters}
              setFilters={setFilters}
              onClose={() => setShowFilterPopover(false)}
            />
          )}
        </div>

        {/* Active filter chips */}
        {filters.priorities.map((p) => (
          <span key={p} className="flex items-center gap-1 text-xs bg-white/10 text-white/70 pl-2 pr-1 py-0.5 rounded-full">
            Priority: {p}
            <button onClick={() => removeFilter('priority', p)} className="text-white/40 hover:text-white ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
        {filters.tactic_type && (
          <span className="flex items-center gap-1 text-xs bg-white/10 text-white/70 pl-2 pr-1 py-0.5 rounded-full">
            Type: {filters.tactic_type}
            <button onClick={() => removeFilter('tactic_type')} className="text-white/40 hover:text-white ml-0.5">
              <X size={10} />
            </button>
          </span>
        )}
        {filters.assigned_to && (
          <span className="flex items-center gap-1 text-xs bg-white/10 text-white/70 pl-2 pr-1 py-0.5 rounded-full">
            Assigned: {filters.assigned_to}
            <button onClick={() => removeFilter('assigned_to')} className="text-white/40 hover:text-white ml-0.5">
              <X size={10} />
            </button>
          </span>
        )}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-white/40 hover:text-orange transition-colors underline underline-offset-2">
            Clear all
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {groupBy === 'none' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
            {STATUS_COLUMNS.map((status) => (
              <Column
                key={status}
                status={status}
                items={byStatus[status] ?? []}
                campaigns={campaigns}
                defaultCampaignId={campaignId}
                onCardClick={setPanelTactic}
                campaignName={null}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-280px)] pr-1">
            {(groups ?? []).map(([label, groupTactics]) => (
              <GroupSection
                key={label}
                label={label}
                tactics={groupTactics}
                campaignId={campaignId}
                campaignMap={campaignMap}
                campaigns={campaigns}
                onCardClick={setPanelTactic}
              />
            ))}
            {(!groups || groups.length === 0) && (
              <div className="text-center py-16 text-white/30">
                {hasActiveFilters ? 'No tactics match your filters.' : 'No tactics found.'}
              </div>
            )}
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {draggedTactic && (
            <div className="rotate-1 opacity-90">
              <TacticCard
                tactic={draggedTactic}
                campaignName={campaignMap[draggedTactic.campaign_id]}
                onClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TacticDetailPanel
        tactic={panelTactic}
        open={!!panelTactic}
        onClose={() => setPanelTactic(null)}
      />
    </>
  )
}
