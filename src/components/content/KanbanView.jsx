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
import { useTactics, useUpdateTactic } from '../../hooks/useTactics'
import { useCampaigns } from '../../hooks/useCampaigns'
import { TacticCard } from './TacticCard'
import { TacticDetailPanel } from './TacticDetailPanel'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'
import { usePermissions } from '../../hooks/usePermissions'

const COLUMNS = MOCK_DROPDOWNS['Asset Status']

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

export function KanbanView() {
  const { data: tactics, isLoading } = useTactics()
  const { data: campaigns } = useCampaigns()
  const updateTactic = useUpdateTactic()
  const { canEdit } = usePermissions()
  const [panelTactic, setPanelTactic] = useState(null)
  const [activeId, setActiveId] = useState(null)

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
    COLUMNS.forEach((s) => { m[s] = [] })
    ;(tactics ?? []).forEach((t) => {
      const col = m[t.status]
      if (col) col.push(t)
    })
    return m
  }, [tactics])

  const draggedTactic = useMemo(() => (tactics ?? []).find((t) => t.id === activeId), [activeId, tactics])

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id || !canEdit) return
    const newStatus = COLUMNS.find((col) => byStatus[col]?.some((t) => t.id === over.id) || over.id === col)
    if (newStatus) {
      updateTactic.mutate({ id: active.id, status: newStatus })
    }
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
          {COLUMNS.map((status) => {
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
                        campaignName={campaignMap[t.campaign_id]}
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
