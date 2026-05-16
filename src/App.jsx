import React, { useCallback } from 'react'
import Header from './components/Header'
import TabNav from './components/TabNav'
import BudgetDashboard from './components/BudgetDashboard'
import FilterBar from './components/FilterBar'
import Board from './components/Board'
import CardDetail from './components/CardDetail'
import SpreadsheetView from './components/SpreadsheetView'
import BudgetBuilder from './components/BudgetBuilder'
import CalendarView from './components/CalendarView'
import { useBoard } from './hooks/useBoard'
import { useBudget } from './hooks/useBudget'
import { useCalendar } from './hooks/useCalendar'
import { REPURPOSING_CHECKLIST } from './data/seedData'

export default function App() {
  const {
    boardState,
    activeTab,
    setActiveTab,
    selectedCard,
    openCard,
    closeCard,
    filters,
    setFilters,
    view,
    setView,
    onDragEnd,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    getAllCards,
    getFilteredColumns,
  } = useBoard()

  const { budgetStats } = useBudget(getAllCards)
  const { tactics, addTactic, updateTactic, deleteTactic } = useCalendar()

  const showTabNav = view !== 'budget' && view !== 'calendar'
  const showFilterBar = view !== 'budget' && view !== 'calendar'

  const handleNewCampaign = useCallback(() => {
    const typeMap = {
      'podcast-webinar': 'Podcast / Webinar',
      'trade-show': 'Trade Show',
      'paid-ads': 'Paid Ads / Digital',
    }
    const isWebinar = activeTab === 'podcast-webinar'
    const newCard = addCard(activeTab, 'backlog', {
      name: 'New Campaign',
      campaignType: typeMap[activeTab] || '',
      checklist: isWebinar ? REPURPOSING_CHECKLIST.map(i => ({ ...i })) : [],
    })
    if (newCard) {
      setTimeout(() => openCard(newCard, activeTab, 'backlog'), 100)
    }
  }, [activeTab, addCard, openCard])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F4F5F7]">
      <Header view={view} setView={setView} onNewCampaign={handleNewCampaign} />
      <BudgetDashboard budgetStats={budgetStats} />

      {showTabNav && (
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} boardState={boardState} />
      )}

      {showFilterBar && (
        <FilterBar filters={filters} setFilters={setFilters} onNewCampaign={handleNewCampaign} />
      )}

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {view === 'kanban' && (
          <Board
            activeTab={activeTab}
            boardState={boardState}
            filters={filters}
            onDragEnd={onDragEnd}
            openCard={openCard}
            addCard={addCard}
            getFilteredColumns={getFilteredColumns}
          />
        )}
        {view === 'spreadsheet' && (
          <SpreadsheetView
            getAllCards={getAllCards}
            openCard={openCard}
            addCard={addCard}
            onUpdate={updateCard}
          />
        )}
        {view === 'calendar' && (
          <CalendarView
            getAllCards={getAllCards}
            openCard={openCard}
            onUpdate={updateCard}
            tactics={tactics}
            onAddTactic={addTactic}
            onUpdateTactic={updateTactic}
            onDeleteTactic={deleteTactic}
          />
        )}
        {view === 'budget' && (
          <BudgetBuilder />
        )}
      </div>

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={closeCard}
          onUpdate={updateCard}
          onDelete={deleteCard}
          onMove={moveCard}
          onDuplicate={(tabKey, cardData) => {
            const { id, createdAt, status, _tabKey, _colKey, ...rest } = cardData
            const newCard = addCard(tabKey, 'backlog', { ...rest, name: `${rest.name} (copy)` })
            if (newCard) setTimeout(() => openCard(newCard, tabKey, 'backlog'), 100)
          }}
        />
      )}
    </div>
  )
}
