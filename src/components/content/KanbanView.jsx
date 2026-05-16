import React, { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Layers, User, ChevronDown, ChevronRight } from 'lucide-react'
import { useTactics, useUpdateTactic } from '../../hooks/useTactics'
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

function SortableCard({ tactic, campaignName, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tactic.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TacticCard tactic={tactic} campaignName={campaignName} onClick={onClick} />
    </div>
  )
}

function GroupSection({ label, tactics, campaignMap, byStatus, onCardClick, canEdit, updateTactic, setActiveId }) {
  const [collapsed, setCollapsed] = useState(false)

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
        <div className="flex gap-4 overflow-x-auto pb-2">
          {STATUS_COLUMNS.map((status) => {
            const items = tactics.filter((t) => t.status === status)
            return (
              <div
                key={status}
                className={`flex flex-col w-56 shrink-0 bg-jet rounded-xl border-t-2 ${COLUMN_STYLES[status] ?? ''} border border-white/10`}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                  <h3 className="text-xs font-semibold text-white">{status}</h3>
                  <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
                  <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {items.map((t) => (
                      <SortableCard
                        key={t.id}
                        tactic={t}
                        campaignName={campaignMap[t.campaign_id]}
                        onClick={() => onCardClick(t)}
                      />
                    ))}
                  </SortableContext>
                  {items.length === 0 && (
                    <div className="text-center py-4 text-white/20 text-xs">Empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
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
  const [groupBy, setGroupBy] = useState('none') // 'none' | 'campaign' | 'assigned_to'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const campaignMap = useMemo(() => {
    const m = {}
    ;(campaigns ?? []).forEach((c) => { m[c.id] = c.name })
    return m
  }, [campaigns])

  const byStatus = useMemo(() => {
    const m = {}
    STATUS_COLUMNS.forEach((s) => { m[s] = [] })
    ;(tactics ?? []).forEach((t) => {
      const col = m[t.status]
      if (col) col.push(t)
    })
    return m
  }, [tactics])

  const groups = useMemo(() => {
    if (groupBy === 'none' || !tactics) return null
    const map = new Map()
    tactics.forEach((t) => {
      const key = groupBy === 'campaign'
        ? (campaignMap[t.campaign_id] ?? 'No Campaign')
        : (t.assigned_to ?? 'Unassigned')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    })
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [tactics, groupBy, campaignMap])

  const draggedTactic = useMemo(() => (tactics ?? []).find((t) => t.id === activeId), [activeId, tactics])

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id || !canEdit) return
    const newStatus = STATUS_COLUMNS.find(
      (col) => byStatus[col]?.some((t) => t.id === over.id) || over.id === col
    )
    if (newStatus) {
      updateTactic.mutate({ id: active.id, status: newStatus })
    }
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
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
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {groupBy === 'none' ? (
          /* Default: flat status columns */
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
            {STATUS_COLUMNS.map((status) => {
              const items = byStatus[status] ?? []
              return (
                <div
                  key={status}
                  className={`flex flex-col w-64 shrink-0 bg-jet rounded-xl border-t-2 ${COLUMN_STYLES[status] ?? ''} border border-white/10`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">{status}</h3>
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-medium">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      {items.map((t) => (
                        <SortableCard
                          key={t.id}
                          tactic={t}
                          campaignName={groupBy === 'none' && !campaignId ? campaignMap[t.campaign_id] : undefined}
                          onClick={() => setPanelTactic(t)}
                        />
                      ))}
                    </SortableContext>
                    {items.length === 0 && (
                      <div className="text-center py-6 text-white/20 text-xs">No items</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Grouped: accordion sections per group, each with status sub-columns */
          <div className="overflow-y-auto h-[calc(100vh-280px)] pr-1">
            {(groups ?? []).map(([label, groupTactics]) => (
              <GroupSection
                key={label}
                label={label}
                tactics={groupTactics}
                campaignMap={campaignMap}
                byStatus={byStatus}
                onCardClick={setPanelTactic}
                canEdit={canEdit}
                updateTactic={updateTactic}
                setActiveId={setActiveId}
              />
            ))}
            {(!groups || groups.length === 0) && (
              <div className="text-center py-16 text-white/30">No tactics found.</div>
            )}
          </div>
        )}

        <DragOverlay>
          {draggedTactic && (
            <TacticCard
              tactic={draggedTactic}
              campaignName={campaignMap[draggedTactic.campaign_id]}
              onClick={() => {}}
            />
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
