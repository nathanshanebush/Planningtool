import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { TRAFFIC_SOURCE_COLORS, TACTIC_COLORS } from '../data/tacticCategories'
import { format, isPast, parseISO } from 'date-fns'

function fmt(n) {
  if (!n) return null
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

function isOverdue(card) {
  if (!card.launchDate) return false
  if (card.status === 'complete') return false
  return isPast(parseISO(card.launchDate))
}

function hasWarning(card) {
  return !card.owner || !card.launchDate
}

export default function Card({ card, index, tabKey, colKey, onOpen }) {
  const overdue = isOverdue(card)
  const warning = hasWarning(card)
  const checklistDone = card.checklist ? card.checklist.filter(i => i.done).length : 0
  const checklistTotal = card.checklist ? card.checklist.length : 0
  const tacticColor = TACTIC_COLORS[card.tactic] || TACTIC_COLORS['Admin']

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(card, tabKey, colKey)}
          className={`bg-white rounded-lg p-3 mb-2 cursor-pointer transition-shadow hover:shadow-md select-none
            ${snapshot.isDragging ? 'shadow-xl rotate-1 opacity-90' : 'shadow-sm'}
            ${overdue ? 'border-l-2 border-red-500' : warning ? 'border-l-2 border-[#FF604B]' : 'border border-[#DFE1E6]'}
          `}
          style={provided.draggableProps.style}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-[#172B4D] leading-tight flex-1">{card.name}</h4>
            {overdue && <span className="flex-shrink-0 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Overdue</span>}
            {!overdue && card.status === 'complete' && <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />}
          </div>

          {card.tactic && (
            <span
              className="inline-block text-xs px-1.5 py-0.5 rounded mb-2 font-medium"
              style={{ background: tacticColor.bg, color: tacticColor.text }}
            >
              {card.tactic.length > 24 ? card.tactic.slice(0, 22) + '…' : card.tactic}
            </span>
          )}

          {card.trafficSources?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.trafficSources.slice(0, 3).map(src => {
                const c = TRAFFIC_SOURCE_COLORS[src] || { bg: '#F4F5F7', text: '#5E6C84' }
                return (
                  <span key={src} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
                    {src}
                  </span>
                )
              })}
              {card.trafficSources.length > 3 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#F4F5F7] text-[#5E6C84]">+{card.trafficSources.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F4F5F7]">
            <div className="flex items-center gap-2">
              {card.owner && (
                <span className="text-xs bg-[#1A1A2E] text-white px-1.5 py-0.5 rounded font-medium">{card.owner.slice(0, 2).toUpperCase()}</span>
              )}
              {!card.owner && <AlertCircle size={13} className="text-[#FF604B]" />}
              {card.launchDate && (
                <span className="text-xs text-[#5E6C84] flex items-center gap-1">
                  <Clock size={11} />
                  {format(parseISO(card.launchDate), 'MMM d')}
                </span>
              )}
              {!card.launchDate && <span className="text-xs text-[#FF604B]">No date</span>}
            </div>
            <div className="flex items-center gap-2">
              {checklistTotal > 0 && (
                <span className="text-xs text-[#5E6C84]">{checklistDone}/{checklistTotal}</span>
              )}
              {card.budget > 0 && (
                <span className="text-xs font-mono text-[#5E6C84]">{fmt(card.budget)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
