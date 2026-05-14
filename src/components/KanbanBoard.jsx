import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Filter, Search } from 'lucide-react'
import { COLUMNS, TACTIC_CATEGORIES } from '../data/tacticCategories.js'
import KanbanCard from './KanbanCard.jsx'
import CardModal from './CardModal.jsx'
import AddCardModal from './AddCardModal.jsx'

const BOARD_TITLES = {
  'podcast-webinar': 'Podcast / Webinar',
  'trade-show': 'Trade Shows',
  'paid-ads': 'Paid Ads / Digital',
}

const COLUMN_COLORS = {
  backlog: 'bg-gray-100',
  'in-production': 'bg-blue-50',
  scheduled: 'bg-purple-50',
  'live-active': 'bg-green-50',
  'pending-review': 'bg-yellow-50',
  complete: 'bg-teal-50',
}

const COLUMN_HEADER_COLORS = {
  backlog: 'bg-gray-200 text-gray-700',
  'in-production': 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  'live-active': 'bg-green-100 text-green-800',
  'pending-review': 'bg-yellow-100 text-yellow-800',
  complete: 'bg-teal-100 text-teal-800',
}

export default function KanbanBoard({ boardKey, columns, setBoardState }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [addingToColumn, setAddingToColumn] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTactic, setFilterTactic] = useState('')

  function onDragEnd(result) {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    setBoardState(prev => {
      const board = { ...prev[boardKey] }
      const sourceCol = [...(board[source.droppableId] || [])]
      const destCol = source.droppableId === destination.droppableId
        ? sourceCol
        : [...(board[destination.droppableId] || [])]

      const [moved] = sourceCol.splice(source.index, 1)
      const updatedCard = { ...moved, status: destination.droppableId }

      if (source.droppableId === destination.droppableId) {
        sourceCol.splice(destination.index, 0, updatedCard)
        return { ...prev, [boardKey]: { ...board, [source.droppableId]: sourceCol } }
      } else {
        destCol.splice(destination.index, 0, updatedCard)
        return {
          ...prev,
          [boardKey]: {
            ...board,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol,
          },
        }
      }
    })
  }

  function handleSaveCard(updatedCard) {
    setBoardState(prev => {
      const board = { ...prev[boardKey] }
      // Find which column the card is in
      for (const colId of Object.keys(board)) {
        const idx = board[colId].findIndex(c => c.id === updatedCard.id)
        if (idx !== -1) {
          const newCol = [...board[colId]]
          // If status changed, move to new column
          if (updatedCard.status !== colId) {
            newCol.splice(idx, 1)
            const targetCol = [...(board[updatedCard.status] || [])]
            targetCol.push(updatedCard)
            return {
              ...prev,
              [boardKey]: { ...board, [colId]: newCol, [updatedCard.status]: targetCol },
            }
          }
          newCol[idx] = updatedCard
          return { ...prev, [boardKey]: { ...board, [colId]: newCol } }
        }
      }
      return prev
    })
    setSelectedCard(null)
  }

  function handleDeleteCard(cardId) {
    setBoardState(prev => {
      const board = { ...prev[boardKey] }
      for (const colId of Object.keys(board)) {
        const idx = board[colId].findIndex(c => c.id === cardId)
        if (idx !== -1) {
          const newCol = [...board[colId]]
          newCol.splice(idx, 1)
          return { ...prev, [boardKey]: { ...board, [colId]: newCol } }
        }
      }
      return prev
    })
    setSelectedCard(null)
  }

  function handleAddCard(card) {
    setBoardState(prev => {
      const board = { ...prev[boardKey] }
      const col = [...(board[addingToColumn] || [])]
      col.push({ ...card, status: addingToColumn })
      return { ...prev, [boardKey]: { ...board, [addingToColumn]: col } }
    })
    setAddingToColumn(null)
  }

  function getFilteredCards(cards) {
    return cards.filter(card => {
      const matchSearch = !searchQuery || card.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTactic = !filterTactic || card.tactic === filterTactic
      return matchSearch && matchTactic
    })
  }

  const totalCards = Object.values(columns).reduce((s, col) => s + col.length, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-snap-border px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-snap-primary font-serif">{BOARD_TITLES[boardKey]}</h1>
          <p className="text-xs text-snap-muted font-mono mt-0.5">{totalCards} campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-snap-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-snap-border rounded-lg focus:outline-none focus:ring-2 focus:ring-snap-orange/30 w-44"
            />
          </div>
          <div className="relative flex items-center gap-1.5">
            <Filter size={14} className="text-snap-muted" />
            <select
              value={filterTactic}
              onChange={e => setFilterTactic(e.target.value)}
              className="text-sm border border-snap-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-snap-orange/30 bg-white"
            >
              <option value="">All Tactics</option>
              {TACTIC_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const cards = getFilteredCards(columns[col.id] || [])
              return (
                <div
                  key={col.id}
                  className={`flex flex-col rounded-xl w-64 shrink-0 h-full ${COLUMN_COLORS[col.id] || 'bg-gray-100'}`}
                >
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${COLUMN_HEADER_COLORS[col.id] || ''}`}>
                    <span className="text-xs font-semibold uppercase tracking-wide">{col.title}</span>
                    <span className="text-xs font-mono bg-white/50 rounded-full px-1.5 py-0.5">{cards.length}</span>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-2 space-y-2 rounded-b-xl transition-colors ${
                          snapshot.isDraggingOver ? 'bg-snap-orange/10' : ''
                        }`}
                      >
                        {cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                              >
                                <KanbanCard
                                  card={card}
                                  isDragging={snap.isDragging}
                                  onClick={() => setSelectedCard(card)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add card */}
                  <button
                    onClick={() => setAddingToColumn(col.id)}
                    className="flex items-center gap-1.5 mx-2 mb-2 px-3 py-1.5 text-xs text-snap-muted hover:text-snap-primary hover:bg-white/60 rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    Add card
                  </button>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardKey={boardKey}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
      {addingToColumn && (
        <AddCardModal
          boardKey={boardKey}
          columnId={addingToColumn}
          onClose={() => setAddingToColumn(null)}
          onAdd={handleAddCard}
        />
      )}
    </div>
  )
}
