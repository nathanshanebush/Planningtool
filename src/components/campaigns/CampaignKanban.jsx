import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCampaigns, useUpdateCampaign } from '../../hooks/useCampaigns'
import { useTactics } from '../../hooks/useTactics'
import { LoadingSpinner } from '../shared/LoadingSpinner'

const STATUSES = ['planning', 'active', 'paused', 'completed']

const COLUMN_META = {
  planning:  { label: 'Planning',  border: 'border-t-blue-500' },
  active:    { label: 'Active',    border: 'border-t-green-500' },
  paused:    { label: 'Paused',    border: 'border-t-amber-500' },
  completed: { label: 'Completed', border: 'border-t-gray-500' },
}

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${Math.round(num).toLocaleString()}`
}

function KanbanCardInner({ campaign }) {
  const navigate = useNavigate()
  const { data: tactics } = useTactics({ campaign_id: campaign.id })
  const tacticCount = tactics?.length ?? 0

  const budget = Number(campaign.budget) || 0
  const spent = Number(campaign.spend_to_date) || 0
  const budgetPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

  return (
    <div
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="bg-coal rounded-lg border border-white/10 p-3 cursor-pointer hover:border-white/25 transition-all group"
    >
      <p className="text-sm font-semibold text-white group-hover:text-white/90 leading-tight mb-2">
        {campaign.name}
      </p>

      {campaign.campaign_type && (
        <span className="inline-block text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded mb-2">
          {campaign.campaign_type}
        </span>
      )}

      {budget > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>{fmt(spent)} / {fmt(budget)}</span>
            <span>{budgetPct.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-white/40">{tacticCount} tactic{tacticCount !== 1 ? 's' : ''}</p>
    </div>
  )
}

function DraggableCard({ campaign }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campaign.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardInner campaign={campaign} />
    </div>
  )
}

function KanbanColumn({ status, campaigns }) {
  const { label, border } = COLUMN_META[status]
  const { setNodeRef, isOver } = useDroppable({ id: `campcol::${status}` })

  return (
    <div className={`flex flex-col bg-jet rounded-xl border border-white/10 border-t-4 ${border} min-w-[220px] flex-1`}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">{label}</span>
        <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{campaigns.length}</span>
      </div>

      <SortableContext items={campaigns.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 p-3 space-y-2 min-h-[120px] transition-colors rounded-b-xl ${isOver ? 'bg-white/5' : ''}`}
        >
          {campaigns.map((c) => (
            <DraggableCard key={c.id} campaign={c} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function CampaignKanban() {
  const { data: campaigns, isLoading } = useCampaigns()
  const updateCampaign = useUpdateCampaign()
  const [activeId, setActiveId] = React.useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>

  const campaignMap = Object.fromEntries((campaigns ?? []).map(c => [c.id, c]))
  const byStatus = Object.fromEntries(STATUSES.map(s => [s, []]))
  for (const c of (campaigns ?? [])) {
    const col = byStatus[c.status] ? c.status : 'planning'
    byStatus[col].push(c)
  }

  const activeCampaign = activeId ? campaignMap[activeId] : null

  function handleDragStart({ active }) {
    setActiveId(active.id)
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return

    // over could be a card id or a column droppable id
    let newStatus = null
    const overId = over.id

    if (String(overId).startsWith('campcol::')) {
      newStatus = overId.replace('campcol::', '')
    } else {
      // dropped on another card — find which column that card belongs to
      const overCampaign = campaignMap[overId]
      if (overCampaign) newStatus = overCampaign.status
    }

    if (!newStatus || !STATUSES.includes(newStatus)) return
    const draggedCampaign = campaignMap[active.id]
    if (!draggedCampaign || draggedCampaign.status === newStatus) return

    updateCampaign.mutate({ id: active.id, status: newStatus })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <KanbanColumn key={status} status={status} campaigns={byStatus[status]} />
        ))}
      </div>

      <DragOverlay>
        {activeCampaign ? (
          <div style={{ opacity: 0.9, cursor: 'grabbing', width: 220 }}>
            <KanbanCardInner campaign={activeCampaign} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
