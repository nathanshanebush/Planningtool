import { useState, useCallback, useEffect } from 'react'
import { INITIAL_BOARD_STATE } from '../data/seedData'
import { REPURPOSING_CHECKLIST } from '../data/seedData'

const STORAGE_KEY = 'snapscale-board-v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load board from storage:', e)
  }
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save board to storage:', e)
  }
}

function generateId(prefix = 'card') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useBoard() {
  const [boardState, setBoardState] = useState(() => {
    const stored = loadFromStorage()
    return stored || INITIAL_BOARD_STATE
  })

  const [activeTab, setActiveTab] = useState('podcast-webinar')
  const [selectedCard, setSelectedCard] = useState(null)
  const [filters, setFilters] = useState({ search: '', owner: '', specialty: '', tactic: '', month: '', sort: 'launchDate' })
  const [view, setView] = useState('kanban')
  const [spreadsheetSubTab, setSpreadsheetSubTab] = useState('campaigns')

  useEffect(() => {
    saveToStorage(boardState)
  }, [boardState])

  const getAllCards = useCallback(() => {
    const all = []
    Object.entries(boardState).forEach(([tabKey, columns]) => {
      Object.entries(columns).forEach(([colKey, cards]) => {
        cards.forEach(card => all.push({ ...card, _tabKey: tabKey, _colKey: colKey }))
      })
    })
    return all
  }, [boardState])

  const onDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    setBoardState(prev => {
      const newState = JSON.parse(JSON.stringify(prev))
      const sourceCol = newState[activeTab][source.droppableId]
      const destCol = newState[activeTab][destination.droppableId]
      const [moved] = sourceCol.splice(source.index, 1)
      moved.status = destination.droppableId
      destCol.splice(destination.index, 0, moved)
      return newState
    })
  }, [activeTab])

  const addCard = useCallback((tabKey, colKey, cardData) => {
    const id = generateId('card')
    const isWebinar = tabKey === 'podcast-webinar'
    const newCard = {
      id,
      name: cardData.name || 'New Campaign',
      campaignType: cardData.campaignType || '',
      tactic: cardData.tactic || '',
      trafficSources: cardData.trafficSources || [],
      funnelStep: cardData.funnelStep || '',
      budget: cardData.budget || 0,
      annualBudget: cardData.annualBudget || 0,
      spendToDate: cardData.spendToDate || 0,
      revenueEarned: cardData.revenueEarned || 0,
      specialty: cardData.specialty || [],
      launchDate: cardData.launchDate || '',
      endDate: cardData.endDate || '',
      owner: cardData.owner || '',
      notes: cardData.notes || '',
      checklist: isWebinar ? REPURPOSING_CHECKLIST.map(i => ({ ...i, id: i.id + '-' + id })) : (cardData.checklist || []),
      links: cardData.links || [],
      status: colKey,
      createdAt: new Date().toISOString(),
    }
    setBoardState(prev => {
      const newState = JSON.parse(JSON.stringify(prev))
      newState[tabKey][colKey].push(newCard)
      return newState
    })
    return newCard
  }, [])

  const updateCard = useCallback((tabKey, colKey, cardId, updates) => {
    setBoardState(prev => {
      const newState = JSON.parse(JSON.stringify(prev))
      const col = newState[tabKey][colKey]
      const idx = col.findIndex(c => c.id === cardId)
      if (idx !== -1) {
        newState[tabKey][colKey][idx] = { ...col[idx], ...updates }
      }
      return newState
    })
    if (selectedCard?.id === cardId) {
      setSelectedCard(prev => prev ? { ...prev, ...updates } : prev)
    }
  }, [selectedCard])

  const deleteCard = useCallback((tabKey, colKey, cardId) => {
    setBoardState(prev => {
      const newState = JSON.parse(JSON.stringify(prev))
      newState[tabKey][colKey] = newState[tabKey][colKey].filter(c => c.id !== cardId)
      return newState
    })
    if (selectedCard?.id === cardId) setSelectedCard(null)
  }, [selectedCard])

  const moveCard = useCallback((fromTab, fromCol, toTab, toCol, cardId) => {
    setBoardState(prev => {
      const newState = JSON.parse(JSON.stringify(prev))
      const sourceArr = newState[fromTab][fromCol]
      const idx = sourceArr.findIndex(c => c.id === cardId)
      if (idx === -1) return prev
      const [card] = sourceArr.splice(idx, 1)
      card.status = toCol
      newState[toTab][toCol].push(card)
      return newState
    })
  }, [])

  const openCard = useCallback((card, tabKey, colKey) => {
    setSelectedCard({ ...card, _tabKey: tabKey, _colKey: colKey })
  }, [])

  const closeCard = useCallback(() => {
    setSelectedCard(null)
  }, [])

  const applyFilter = useCallback((cards) => {
    let result = [...cards]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || (c.notes || '').toLowerCase().includes(q))
    }
    if (filters.owner) result = result.filter(c => c.owner === filters.owner)
    if (filters.specialty) result = result.filter(c => (c.specialty || []).includes(filters.specialty))
    if (filters.tactic) result = result.filter(c => c.tactic === filters.tactic)
    if (filters.month) {
      result = result.filter(c => {
        if (!c.launchDate) return false
        const m = new Date(c.launchDate).getMonth() + 1
        return m === parseInt(filters.month)
      })
    }
    if (filters.sort === 'launchDate') {
      result.sort((a, b) => {
        if (!a.launchDate) return 1
        if (!b.launchDate) return -1
        return new Date(a.launchDate) - new Date(b.launchDate)
      })
    } else if (filters.sort === 'budget') {
      result.sort((a, b) => b.budget - a.budget)
    } else if (filters.sort === 'owner') {
      result.sort((a, b) => (a.owner || '').localeCompare(b.owner || ''))
    }
    return result
  }, [filters])

  const getFilteredColumns = useCallback((tabKey) => {
    const tabData = boardState[tabKey] || {}
    const result = {}
    Object.entries(tabData).forEach(([colKey, cards]) => {
      result[colKey] = applyFilter(cards)
    })
    return result
  }, [boardState, applyFilter])

  const resetBoard = useCallback(() => {
    setBoardState(INITIAL_BOARD_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
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
    spreadsheetSubTab,
    setSpreadsheetSubTab,
    onDragEnd,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    getAllCards,
    getFilteredColumns,
    resetBoard,
  }
}
