import React, { useState } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  parseISO, format, addMonths, subMonths, getDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTactics } from '../../hooks/useTactics'
import { useCampaigns } from '../../hooks/useCampaigns'
import { TacticDetailPanel } from './TacticDetailPanel'

const STATUS_STYLES = {
  'Not Started': 'bg-white/10 text-white/50',
  'In Progress': 'bg-blue-500/20 text-blue-400',
  'Needs Review': 'bg-amber-500/20 text-amber-400',
  'Approved': 'bg-green-500/20 text-green-400',
  'Published': 'bg-[#ff604b]/20 text-[#ff604b]',
  'On Hold': 'bg-purple-500/20 text-purple-400',
}

const CAMPAIGN_STATUS_STYLES = {
  active: 'bg-green-500/30 text-green-400',
  planning: 'bg-blue-500/30 text-blue-400',
  paused: 'bg-amber-500/30 text-amber-400',
  completed: 'bg-white/10 text-white/40',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCalendarDays(month) {
  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const days = eachDayOfInterval({ start: first, end: last })
  const leadingBlanks = getDay(first)
  const trailingBlanks = 6 - getDay(last)
  return [
    ...Array(leadingBlanks).fill(null),
    ...days,
    ...Array(trailingBlanks).fill(null),
  ]
}

export function CalendarView() {
  const [month, setMonth] = useState(new Date())
  const [campaignFilter, setCampaignFilter] = useState('')
  const [selectedTactic, setSelectedTactic] = useState(null)

  const { data: tactics = [] } = useTactics(campaignFilter ? { campaign_id: campaignFilter } : undefined)
  const { data: campaigns = [] } = useCampaigns()

  const today = new Date()
  const calendarDays = buildCalendarDays(month)

  const tacticsForDay = (day) =>
    tactics.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), day))

  const campaignsForDay = (day) =>
    campaigns.filter((c) => {
      if (!c.start_date || !c.end_date) return false
      const start = parseISO(c.start_date)
      const end = parseISO(c.end_date)
      return day >= start && day <= end
    })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-xl font-semibold text-white w-44 text-center">
            {format(month, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            Today
          </button>
        </div>

        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="bg-jet border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange/60"
        >
          <option value="">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-xs font-medium text-white/40 text-center py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
          {calendarDays.map((day, i) => {
            if (!day) {
              return <div key={`blank-${i}`} className="bg-coal/60" />
            }

            const isToday = isSameDay(day, today)
            const isCurrentMonth = isSameMonth(day, month)
            const dayTactics = tacticsForDay(day)
            const visible = dayTactics.slice(0, 3)
            const overflow = dayTactics.length - 3
            const dayCampaigns = campaignsForDay(day)
            const visibleCampaigns = dayCampaigns.slice(0, 2)
            const campaignOverflow = dayCampaigns.length - 2

            return (
              <div
                key={day.toISOString()}
                className={`bg-coal p-1.5 flex flex-col gap-1 min-h-[90px] ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full self-end
                    ${isToday
                      ? 'bg-transparent text-orange border border-orange font-semibold'
                      : 'text-white/50'
                    }`}
                >
                  {format(day, 'd')}
                </span>
                {visibleCampaigns.map((c) => (
                  <div
                    key={c.id}
                    className={`w-full text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-4
                      ${CAMPAIGN_STATUS_STYLES[c.status] ?? 'bg-white/10 text-white/40'}`}
                    title={c.name}
                  >
                    {c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name}
                  </div>
                ))}
                {campaignOverflow > 0 && (
                  <span className="text-[10px] text-white/30 px-1">+{campaignOverflow} campaign{campaignOverflow > 1 ? 's' : ''}</span>
                )}
                {visible.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTactic(t)}
                    className={`w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-4
                      ${STATUS_STYLES[t.status] ?? 'bg-white/10 text-white/50'}
                      hover:brightness-125 transition-all`}
                    title={t.name}
                  >
                    {t.name}
                  </button>
                ))}
                {overflow > 0 && (
                  <span className="text-[10px] text-white/40 px-1">+{overflow} more</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <TacticDetailPanel
        tactic={selectedTactic}
        open={!!selectedTactic}
        onClose={() => setSelectedTactic(null)}
      />
    </div>
  )
}
