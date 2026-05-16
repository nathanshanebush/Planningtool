import React from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'

const RECENT_MOCK = [
  { id: 'a1', text: 'Podcast Intro Email moved to In Progress', time: '2026-05-15T14:00:00Z' },
  { id: 'a2', text: 'LinkedIn Announcement Post needs review', time: '2026-05-14T10:30:00Z' },
  { id: 'a3', text: 'Google Search Ad Copy approved', time: '2026-05-13T16:00:00Z' },
  { id: 'a4', text: 'New campaign "Trade Show Chicago" created', time: '2026-05-12T09:00:00Z' },
]

export function RecentActivityWidget() {
  return (
    <div className="bg-jet rounded-xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
      <ul className="space-y-3">
        {RECENT_MOCK.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-orange shrink-0" />
            <div>
              <p className="text-sm text-white">{item.text}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {formatDistanceToNow(parseISO(item.time), { addSuffix: true })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
