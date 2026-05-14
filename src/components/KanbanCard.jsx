import React from 'react'
import { Calendar, DollarSign, User, CheckSquare } from 'lucide-react'
import { TACTIC_COLORS, TRAFFIC_SOURCE_COLORS } from '../data/tacticCategories.js'
import { format, parseISO } from 'date-fns'

function formatCurrency(val) {
  if (!val && val !== 0) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export default function KanbanCard({ card, isDragging, onClick }) {
  const tacticColor = TACTIC_COLORS[card.tactic] || { bg: '#F4F5F7', text: '#5E6C84', border: '#B3BAC5' }
  const checklistTotal = card.checklist?.length || 0
  const checklistDone = card.checklist?.filter(i => i.done).length || 0
  const hasChecklist = checklistTotal > 0

  let launchDisplay = null
  if (card.launchDate) {
    try {
      launchDisplay = format(parseISO(card.launchDate), 'MMM d, yyyy')
    } catch (e) {}
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-3 cursor-pointer border transition-all ${
        isDragging
          ? 'shadow-lg border-snap-orange rotate-1 scale-105'
          : 'shadow-sm border-transparent hover:border-snap-border hover:shadow-md'
      }`}
    >
      {/* Tactic badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-full"
          style={{ backgroundColor: tacticColor.bg, color: tacticColor.text, border: `1px solid ${tacticColor.border}` }}
        >
          {card.tactic}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-snap-primary leading-snug mb-2 line-clamp-2">
        {card.name}
      </h3>

      {/* Traffic sources */}
      {card.trafficSources && card.trafficSources.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.trafficSources.slice(0, 3).map(src => {
            const c = TRAFFIC_SOURCE_COLORS[src] || { bg: '#F4F5F7', text: '#5E6C84' }
            return (
              <span
                key={src}
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {src}
              </span>
            )
          })}
          {card.trafficSources.length > 3 && (
            <span className="text-xs text-snap-muted">+{card.trafficSources.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-snap-border/50 gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-snap-muted">
          {card.owner && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {card.owner}
            </span>
          )}
          {launchDisplay && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {launchDisplay}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {card.budget > 0 && (
            <span className="flex items-center gap-1 text-xs text-snap-muted font-mono">
              <DollarSign size={10} />
              {formatCurrency(card.budget)}/mo
            </span>
          )}
          {hasChecklist && (
            <span className={`flex items-center gap-1 text-xs font-mono ${
              checklistDone === checklistTotal ? 'text-snap-success' : 'text-snap-muted'
            }`}>
              <CheckSquare size={10} />
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
