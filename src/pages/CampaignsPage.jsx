import React, { useState } from 'react'
import { LayoutGrid, Kanban } from 'lucide-react'
import { CampaignList } from '../components/campaigns/CampaignList'
import { CampaignKanban } from '../components/campaigns/CampaignKanban'

export default function CampaignsPage() {
  const [view, setView] = useState('grid')

  return (
    <div>
      {/* View toggle in page header area */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-jet border border-white/10 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors
              ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <LayoutGrid size={13} /> Grid
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors
              ${view === 'kanban' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Kanban size={13} /> Kanban
          </button>
        </div>
      </div>

      {view === 'grid' ? <CampaignList /> : <CampaignKanban />}
    </div>
  )
}
