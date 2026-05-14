import React, { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import Card from './Card'

const COLUMN_HEADER_STYLES = {
  backlog: 'bg-[#F4F5F7]',
  'in-production': 'bg-blue-50',
  scheduled: 'bg-purple-50',
  'live-active': 'bg-green-50',
  'pending-review': 'bg-yellow-50',
  complete: 'bg-gray-100',
}

const COLUMN_DOT_STYLES = {
  backlog: 'bg-[#5E6C84]',
  'in-production': 'bg-blue-500',
  scheduled: 'bg-purple-500',
  'live-active': 'bg-green-500',
  'pending-review': 'bg-yellow-500',
  complete: 'bg-gray-400',
}

export default function Column({ colKey, title, cards, tabKey, onOpen, onAddCard }) {
  const headerBg = COLUMN_HEADER_STYLES[colKey] || 'bg-[#F4F5F7]'
  const dotColor = COLUMN_DOT_STYLES[colKey] || 'bg-gray-400'

  return (
    <div className="flex-shrink-0 w-[280px] flex flex-col max-h-full">
      <div className={`${headerBg} rounded-t-lg px-3 py-2.5 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold text-[#172B4D]">{title}</h3>
          <span className="text-xs bg-white/70 text-[#5E6C84] px-1.5 py-0.5 rounded-full font-mono">{cards.length}</span>
        </div>
        <button
          onClick={() => onAddCard(tabKey, colKey)}
          className="text-[#5E6C84] hover:text-[#172B4D] hover:bg-white/60 rounded p-0.5 transition-colors"
          title="Add card"
        >
          <Plus size={15} />
        </button>
      </div>

      <Droppable droppableId={colKey}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 rounded-b-lg min-h-[80px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-[#F4F5F7]/50'}`}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                tabKey={tabKey}
                colKey={colKey}
                onOpen={onOpen}
              />
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-xs text-[#5E6C84]/50">Drop cards here</div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
