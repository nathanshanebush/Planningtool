import React from 'react'
import { Mic, Building2, Megaphone } from 'lucide-react'

const TABS = [
  { key: 'podcast-webinar', label: 'Podcast / Webinar', icon: Mic },
  { key: 'trade-show', label: 'Trade Show', icon: Building2 },
  { key: 'paid-ads', label: 'Paid Ads / Digital', icon: Megaphone },
]

export default function TabNav({ activeTab, setActiveTab, boardState }) {
  const getCardCount = (tabKey) => {
    const tab = boardState[tabKey] || {}
    return Object.values(tab).reduce((sum, col) => sum + col.length, 0)
  }

  return (
    <div className="bg-white border-b border-[#DFE1E6] px-4 flex gap-0 overflow-x-auto">
      {TABS.map(({ key, label, icon: Icon }) => {
        const count = getCardCount(key)
        const isActive = activeTab === key
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? 'border-[#FF604B] text-[#172B4D]'
                : 'border-transparent text-[#5E6C84] hover:text-[#172B4D] hover:border-[#DFE1E6]'
            }`}
          >
            <Icon size={15} />
            {label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${isActive ? 'bg-[#FF604B] text-white' : 'bg-[#F4F5F7] text-[#5E6C84]'}`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
