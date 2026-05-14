import React from 'react'
import { Mic2, CalendarDays, Megaphone, BarChart3, TrendingUp, ChevronRight } from 'lucide-react'
import { COLUMNS } from '../data/tacticCategories.js'

const NAV_ITEMS = [
  { id: 'podcast-webinar', label: 'Podcast / Webinar', icon: Mic2 },
  { id: 'trade-show', label: 'Trade Shows', icon: CalendarDays },
  { id: 'paid-ads', label: 'Paid Ads / Digital', icon: Megaphone },
  { id: 'annual-plan', label: 'Annual Plan', icon: BarChart3 },
  { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
]

function countCards(boardState, boardKey) {
  if (!boardState || !boardState[boardKey]) return 0
  return Object.values(boardState[boardKey]).reduce((sum, col) => sum + col.length, 0)
}

export default function Sidebar({ activeView, setActiveView, boardState }) {
  return (
    <aside className="w-60 bg-snap-dark text-white flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-snap-orange rounded-lg flex items-center justify-center font-bold text-white text-sm font-mono">
            SS
          </div>
          <div>
            <div className="font-serif text-sm leading-tight text-white">snapscale</div>
            <div className="text-xs text-white/50 font-mono leading-tight">campaign command</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 px-3 mb-1">Boards</p>
          {NAV_ITEMS.slice(0, 3).map(item => {
            const Icon = item.icon
            const isActive = activeView === item.id
            const count = countCards(boardState, item.id)
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                  isActive
                    ? 'bg-snap-orange text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={15} />
                  {item.label}
                </span>
                {count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="px-3 mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 px-3 mb-1">Analytics</p>
          {NAV_ITEMS.slice(3).map(item => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                  isActive
                    ? 'bg-snap-orange text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/30 font-mono">© 2026 Snapscale</p>
      </div>
    </aside>
  )
}
