import React from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { Paperclip, Calendar, AlertTriangle } from 'lucide-react'

const PRIORITY_BORDERS = {
  Low: 'border-l-4 border-l-gray-500',
  Medium: 'border-l-4 border-l-blue-500',
  High: 'border-l-4 border-l-amber-500',
  Urgent: 'border-l-4 border-l-red-500',
}

// Tactic types that require a creative asset upload
const CREATIVE_REQUIRED_TYPES = new Set([
  'Ad Creative', 'Quote Graphic', 'LinkedIn Carousel',
  'Podcast Thumbnail', 'Webinar Thumbnail',
])

export function TacticCard({ tactic, campaignName, onClick }) {
  const overdue = tactic.due_date && isPast(parseISO(tactic.due_date)) && !['Approved', 'Published'].includes(tactic.status)
  const creativeNeeded = CREATIVE_REQUIRED_TYPES.has(tactic.tactic_type) && !tactic.has_creative

  return (
    <div
      onClick={onClick}
      className={`
        bg-coal rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all border border-white/5 hover:border-white/15
        ${PRIORITY_BORDERS[tactic.priority] ?? ''}
      `}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="text-sm font-semibold text-white line-clamp-2 leading-snug flex-1">{tactic.name}</p>
        {creativeNeeded && (
          <div title="Creative asset needed" className="shrink-0 mt-0.5">
            <AlertTriangle size={13} className="text-amber-400" />
          </div>
        )}
      </div>
      {campaignName && (
        <p className="text-xs text-white/40 mb-2 truncate">{campaignName}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-2">
        {tactic.tactic_type && (
          <span className="text-xs bg-white/10 text-white/70 px-1.5 py-0.5 rounded">{tactic.tactic_type}</span>
        )}
        {tactic.platform && (
          <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{tactic.platform}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {tactic.due_date && (
            <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-white/40'}`}>
              <Calendar size={10} />
              <span>{format(parseISO(tactic.due_date), 'MMM d')}</span>
            </div>
          )}
          {tactic.has_creative && <Paperclip size={12} className="text-white/40" />}
        </div>
        {tactic.assigned_to && (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {tactic.assigned_to[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
