import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import AnnualPlanView from './components/AnnualPlanView.jsx'
import ForecastingView from './components/ForecastingView.jsx'
import { INITIAL_BOARD_STATE } from './data/seedData.js'

const STORAGE_KEY = 'snapscale-kanban-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {}
}

export default function App() {
  const [activeView, setActiveView] = useState('podcast-webinar')
  const [boardState, setBoardState] = useState(() => loadState() || INITIAL_BOARD_STATE)

  useEffect(() => {
    saveState(boardState)
  }, [boardState])

  const isKanban = activeView === 'podcast-webinar' || activeView === 'trade-show' || activeView === 'paid-ads'

  return (
    <div className="flex h-screen overflow-hidden bg-snap-bg font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} boardState={boardState} />
      <main className="flex-1 overflow-auto">
        {isKanban && (
          <KanbanBoard
            key={activeView}
            boardKey={activeView}
            columns={boardState[activeView] || {}}
            setBoardState={setBoardState}
          />
        )}
        {activeView === 'annual-plan' && <AnnualPlanView />}
        {activeView === 'forecasting' && <ForecastingView />}
      </main>
    </div>
  )
}
