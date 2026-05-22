import React, { useState } from 'react'
import { TableProperties, Kanban, BarChart2 } from 'lucide-react'
import { SpreadView } from '../components/content/SpreadView'
import { KanbanView } from '../components/content/KanbanView'
import { ROIView } from '../components/content/ROIView'

export default function ContentPage() {
  const [view, setView] = useState('spread')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Content Board</h2>
          <p className="text-white/50 text-sm mt-0.5">Manage all tactics across campaigns.</p>
        </div>
        <div className="flex bg-jet border border-white/10 rounded-lg p-1 gap-1">
          <button
            onClick={() => setView('spread')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
              ${view === 'spread' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <TableProperties size={14} /> Spread
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
              ${view === 'kanban' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <Kanban size={14} /> Kanban
          </button>
          <button
            onClick={() => setView('roi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
              ${view === 'roi' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <BarChart2 size={14} /> ROI
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === 'spread' && <SpreadView />}
        {view === 'kanban' && <KanbanView />}
        {view === 'roi' && <ROIView />}
      </div>
    </div>
  )
}
