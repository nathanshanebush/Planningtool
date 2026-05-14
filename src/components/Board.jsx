import React, { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'
import { COLUMNS } from '../data/tacticCategories'
import { REPURPOSING_CHECKLIST } from '../data/seedData'

export default function Board({ activeTab, boardState, filters, onDragEnd, openCard, addCard, getFilteredColumns }) {
  const filteredColumns = getFilteredColumns(activeTab)

  const handleAddCard = (tabKey, colKey) => {
    const isWebinar = tabKey === 'podcast-webinar'
    const typeMap = { 'podcast-webinar': 'Podcast / Webinar', 'trade-show': 'Trade Show', 'paid-ads': 'Paid Ads / Digital' }
    addCard(tabKey, colKey, {
      name: 'New Campaign',
      campaignType: typeMap[tabKey] || '',
      checklist: isWebinar ? REPURPOSING_CHECKLIST.map(i => ({ ...i })) : [],
    })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 p-4 overflow-x-auto min-h-0 flex-1 items-start">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            colKey={col.id}
            title={col.title}
            cards={filteredColumns[col.id] || []}
            tabKey={activeTab}
            onOpen={openCard}
            onAddCard={handleAddCard}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
