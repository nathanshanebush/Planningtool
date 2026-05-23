import React, { useState } from 'react'
import { TableProperties, Kanban, CalendarDays, BarChart2 } from 'lucide-react'
import { SpreadView } from '../components/content/SpreadView'
import { KanbanView } from '../components/content/KanbanView'
import { CalendarView } from '../components/content/CalendarView'
import { ROIView } from '../components/content/ROIView'

const TABS = [
  { id: 'spread', label: 'Spreadsheet', icon: TableProperties },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'roi', label: 'ROI', icon: BarChart2 },
]

export default function ContentPage() {
  const [view, setView] = useState('kanban')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Content Board</h2>
          <p className="text-white/50 text-sm mt-0.5">Manage all tactics across campaigns.</p>
        </div>
        <div className="flex bg-jet border border-white/10 rounded-lg p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${view === id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === 'spread' && <SpreadView />}
        {view === 'kanban' && <KanbanView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'roi' && <ROIView />}
      </div>
    </div>
  )
}
