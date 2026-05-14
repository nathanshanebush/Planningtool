import React from 'react'
import { LayoutGrid, Table2, PlusCircle } from 'lucide-react'

export default function Header({ view, setView, onNewCampaign }) {
  return (
    <header className="bg-[#1A1A2E] text-white px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl font-bold tracking-tight">
          <span className="text-[#FF604B]">S</span>napscale
        </span>
        <span className="text-[#5E6C84] text-sm hidden sm:block">Campaign Command Center</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-white/20">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === 'kanban' ? 'bg-[#FF604B] text-white' : 'text-white/70 hover:bg-white/10'}`}
          >
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setView('spreadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === 'spreadsheet' ? 'bg-[#FF604B] text-white' : 'text-white/70 hover:bg-white/10'}`}
          >
            <Table2 size={15} />
            <span className="hidden sm:inline">Spreadsheet</span>
          </button>
          <button
            onClick={() => setView('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === 'budget' ? 'bg-[#FF604B] text-white' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="hidden sm:inline">Budget Builder</span>
            <span className="sm:hidden">$</span>
          </button>
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
