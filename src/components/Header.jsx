import React from 'react'
import { LayoutGrid, Table2, PlusCircle, CalendarDays, DollarSign } from 'lucide-react'

const VIEWS = [
  { key: 'kanban',      label: 'Kanban',   icon: LayoutGrid  },
  { key: 'spreadsheet', label: 'Sheet',    icon: Table2      },
  { key: 'calendar',    label: 'Calendar', icon: CalendarDays },
  { key: 'budget',      label: 'Budget',   icon: DollarSign  },
]

export default function Header({ view, setView, onNewCampaign }) {
  return (
    <header className="bg-[#1A1A2E] text-white px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl font-bold tracking-tight flex items-center">
          <span className="bg-[#FF604B] text-white rounded px-1 mr-0.5 leading-tight">I</span>
          <span className="text-white">mpera</span>
        </span>
        <span className="text-[#5E6C84] text-sm hidden sm:block">Campaign Command Center</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-white/20">
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-r border-white/10 last:border-r-0 ${
                view === key ? 'bg-[#FF604B] text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onNewCampaign}
          className="flex items-center gap-1.5 bg-[#FF604B] hover:bg-[#e5503d] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle size={15} />
          <span className="hidden sm:inline">New Campaign</span>
        </button>
      </div>
    </header>
  )
}
