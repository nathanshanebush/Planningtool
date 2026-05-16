import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, ExternalLink, Check } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Campaign tab → color
const TAB_COLORS = {
  'podcast-webinar': { bg: '#EAE6FF', text: '#403294', bar: '#8777D9' },
  'trade-show':      { bg: '#FFEBE6', text: '#BF2600', bar: '#FF8F73' },
  'paid-ads':        { bg: '#E6FCFF', text: '#006878', bar: '#79E2F2' },
}

// Tactic type → color + label
export const TACTIC_TYPE_META = {
  'social-post':    { bg: '#DEEBFF', text: '#0747A6', dot: '#4C9AFF',  label: 'Social Post' },
  'email':          { bg: '#E3FCEF', text: '#006644', dot: '#57D9A3',  label: 'Email' },
  'sms':            { bg: '#F3F0FF', text: '#403294', dot: '#8777D9',  label: 'SMS / Text' },
  'paid-ad':        { bg: '#E6FCFF', text: '#006878', dot: '#00B8D9',  label: 'Paid Ad' },
  'blog':           { bg: '#F4F5F7', text: '#172B4D', dot: '#344563',  label: 'Blog' },
  'press-release':  { bg: '#FFFAE6', text: '#7A4800', dot: '#FFC400',  label: 'Press Release' },
  'video':          { bg: '#FFEBE6', text: '#BF2600', dot: '#FF8F73',  label: 'Video Clip' },
  'other':          { bg: '#F4F5F7', text: '#5E6C84', dot: '#97A0AF',  label: 'Other' },
}

const STATUS_META = {
  'draft':     { bg: '#F4F5F7', text: '#5E6C84', label: 'Draft' },
  'approved':  { bg: '#DEEBFF', text: '#0747A6', label: 'Approved' },
  'posted':    { bg: '#E3FCEF', text: '#006644', label: 'Posted' },
  'not-ready': { bg: '#FFEBE6', text: '#BF2600', label: 'Not Ready' },
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseLocalDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0

  const days = []

  for (let i = startDow; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }

  let trailing = 1
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, trailing++), isCurrentMonth: false })
  }

  return days
}

function campaignOnDate(card, dateStr) {
  if (!card.launchDate) return false
  if (card.launchDate === dateStr) return true
  if (card.endDate && card.launchDate <= dateStr && dateStr <= card.endDate) return true
  return false
}

// ── Tactic Modal ────────────────────────────────────────────────────────────

function TacticModal({ date, tactic, allCards, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    date: tactic?.date ?? date,
    type: tactic?.type ?? 'social-post',
    label: tactic?.label ?? '',
    campaignId: tactic?.campaignId ?? '',
    status: tactic?.status ?? 'draft',
  })

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const inp = (f) => ({ value: form[f], onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) })

  const handleSave = () => {
    if (!form.label.trim()) return
    const campaign = allCards.find(c => c.id === form.campaignId)
    onSave({ ...form, campaignName: campaign?.name || '' })
  }

  const tc = TACTIC_TYPE_META[form.type] || TACTIC_TYPE_META.other
  const sm = STATUS_META[form.status] || STATUS_META.draft

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DFE1E6]">
            <h3 className="font-semibold text-[#172B4D] text-sm">
              {tactic ? 'Edit Activity' : 'Add Activity'}
            </h3>
            <button onClick={onClose} className="text-[#5E6C84] hover:text-[#172B4D]">
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            {/* Type + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">Type</label>
                <select {...inp('type')} className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF]">
                  {Object.entries(TACTIC_TYPE_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">Status</label>
                <select {...inp('status')} className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF]">
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: tc.bg, color: tc.text }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: tc.dot }} />
                {tc.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.text }}>
                {sm.label}
              </span>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" {...inp('date')}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF]" />
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">Content / Label</label>
              <input type="text" {...inp('label')}
                placeholder="e.g. Trade Show Announcement Post"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF]" />
            </div>

            {/* Linked campaign */}
            <div>
              <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">Linked Campaign</label>
              <select {...inp('campaignId')} className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF]">
                <option value="">— Standalone activity —</option>
                {allCards.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.campaignType})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#DFE1E6]">
            {onDelete
              ? <button onClick={onDelete} className="text-sm text-red-400 hover:text-red-600 transition-colors">Delete</button>
              : <div />}
            <div className="flex gap-2">
              <button onClick={onClose} className="text-sm px-3 py-1.5 border border-[#DFE1E6] rounded-md text-[#5E6C84] hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleSave}
                className="text-sm px-3 py-1.5 bg-[#1A1A2E] text-white rounded-md hover:bg-[#2d2d4e] transition-colors">
                {tactic ? 'Update' : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Day Cell ────────────────────────────────────────────────────────────────

function DayCell({ day, dateStr, isToday, isDragOver, cards, tactics, onOpenCard, onOpenTactic, onAddTactic, onDragStart, onDragOver, onDragLeave, onDrop }) {
  const { isCurrentMonth } = day
  const hasItems = cards.length + tactics.length > 0

  return (
    <div
      className={`border-r border-[#DFE1E6] last:border-r-0 min-h-[110px] p-1.5 relative group flex flex-col transition-colors ${
        isDragOver ? 'bg-[#DEEBFF]' : isToday ? 'bg-[#FFFAE6]' : isCurrentMonth ? 'bg-white' : 'bg-[#F9FAFB]'
      }`}
      onDragOver={e => { e.preventDefault(); onDragOver(dateStr) }}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, dateStr)}
    >
      {/* Date number + add button */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
          isToday ? 'bg-[#FF604B] text-white' : isCurrentMonth ? 'text-[#172B4D]' : 'text-[#C1C7D0]'
        }`}>
          {day.date.getDate()}
        </span>
        <button
          onClick={() => onAddTactic(dateStr)}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center hover:bg-[#DFE1E6] text-[#97A0AF] hover:text-[#5E6C84] transition-all"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Campaign chips */}
      <div className="space-y-0.5 flex-1">
        {cards.map(card => {
          const isStart = card.launchDate === dateStr
          const colors = TAB_COLORS[card._tabKey] || { bg: '#F4F5F7', text: '#5E6C84', bar: '#DFE1E6' }
          return (
            <div
              key={card.id + dateStr}
              draggable={isStart}
              onDragStart={e => isStart && onDragStart(e, 'campaign', { id: card.id })}
              onClick={() => onOpenCard(card)}
              title={`${card.name}${isStart ? '' : ' (continues)'} — click to open`}
              className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity leading-4"
              style={{
                background: isStart ? colors.bg : `${colors.bg}88`,
                color: colors.text,
                borderLeft: `3px solid ${colors.bar}`,
                opacity: isStart ? 1 : 0.65,
                fontWeight: isStart ? 600 : 400,
              }}
            >
              {isStart ? card.name : `↳ ${card.name}`}
            </div>
          )
        })}

        {/* Tactic chips */}
        {tactics.map(tactic => {
          const tc = TACTIC_TYPE_META[tactic.type] || TACTIC_TYPE_META.other
          const isPosted = tactic.status === 'posted'
          return (
            <div
              key={tactic.id}
              draggable
              onDragStart={e => onDragStart(e, 'tactic', { id: tactic.id, date: tactic.date })}
              onClick={() => onOpenTactic(tactic, dateStr)}
              title={`${tc.label}: ${tactic.label}${tactic.campaignName ? ` (${tactic.campaignName})` : ''}`}
              className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity leading-4 flex items-center gap-1"
              style={{ background: tc.bg, color: tc.text, opacity: isPosted ? 0.7 : 1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block" style={{ background: tc.dot }} />
              <span className="truncate flex-1">{tactic.label || tc.label}</span>
              {isPosted && <Check size={9} className="flex-shrink-0 opacity-70" />}
            </div>
          )
        })}

        {/* Empty state prompt */}
        {!hasItems && isCurrentMonth && (
          <button
            onClick={() => onAddTactic(dateStr)}
            className="w-full text-left opacity-0 group-hover:opacity-100 text-xs text-[#C1C7D0] hover:text-[#97A0AF] transition-all italic px-1"
          >
            + activity
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Calendar View ──────────────────────────────────────────────────────

export default function CalendarView({ getAllCards, openCard, onUpdate, tactics, onAddTactic, onUpdateTactic, onDeleteTactic }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [dragOver, setDragOver] = useState(null)
  const [tacticModal, setTacticModal] = useState(null) // null | { date, tactic? }

  const allCards = useMemo(() => getAllCards(), [getAllCards])
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month])
  const todayStr = toDateStr(today)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  const handleDragStart = (e, type, data) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, ...data }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault()
    setDragOver(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.type === 'campaign') {
        const card = allCards.find(c => c.id === data.id)
        if (!card || card.launchDate === targetDateStr) return
        const updates = { launchDate: targetDateStr }
        if (card.endDate && card.launchDate) {
          const src = parseLocalDate(card.launchDate)
          const tgt = parseLocalDate(targetDateStr)
          if (src && tgt) {
            const delta = tgt.getTime() - src.getTime()
            const newEnd = new Date(parseLocalDate(card.endDate).getTime() + delta)
            updates.endDate = toDateStr(newEnd)
          }
        }
        onUpdate(card._tabKey, card._colKey, card.id, updates)
      } else if (data.type === 'tactic') {
        if (data.date !== targetDateStr) {
          onUpdateTactic(data.id, { date: targetDateStr })
        }
      }
    } catch (err) { /* ignore parse errors */ }
  }

  // Index cards and tactics by date
  const cardsByDate = useMemo(() => {
    const map = {}
    calendarDays.forEach(({ date }) => {
      const ds = toDateStr(date)
      map[ds] = allCards.filter(c => campaignOnDate(c, ds))
    })
    return map
  }, [allCards, calendarDays])

  const tacticsByDate = useMemo(() => {
    const map = {}
    tactics.forEach(t => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [tactics])

  const weeks = useMemo(() => {
    const ws = []
    for (let i = 0; i < calendarDays.length; i += 7) ws.push(calendarDays.slice(i, i + 7))
    return ws
  }, [calendarDays])

  return (
    <div className="flex-1 overflow-auto p-4">

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[#DFE1E6] text-[#5E6C84] transition-colors">
            <ChevronLeft size={17} />
          </button>
          <h2 className="text-lg font-bold text-[#172B4D] w-52 text-center tabular-nums">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[#DFE1E6] text-[#5E6C84] transition-colors">
            <ChevronRight size={17} />
          </button>
          <button onClick={goToday}
            className="text-xs px-3 py-1.5 border border-[#DFE1E6] rounded-lg text-[#5E6C84] hover:bg-[#F4F5F7] transition-colors ml-1">
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5E6C84]">
          <span className="font-semibold text-[#172B4D] text-xs uppercase tracking-wider">Campaigns:</span>
          {Object.entries(TAB_COLORS).map(([key, c]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm inline-block border" style={{ background: c.bg, borderColor: c.bar }} />
              {key === 'podcast-webinar' ? 'Webinar / Podcast' : key === 'trade-show' ? 'Trade Show' : 'Paid Ads'}
            </span>
          ))}
          <span className="font-semibold text-[#172B4D] text-xs uppercase tracking-wider ml-2">Activities:</span>
          {Object.entries(TACTIC_TYPE_META).map(([key, m]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: m.dot }} />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Calendar Grid ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DFE1E6] overflow-hidden">

        {/* Day headers */}
        <div className="grid grid-cols-7 bg-[#1A1A2E]">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-white/70 py-2.5 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-[#DFE1E6]">
            {week.map((day) => {
              const dateStr = toDateStr(day.date)
              return (
                <DayCell
                  key={dateStr}
                  day={day}
                  dateStr={dateStr}
                  isToday={dateStr === todayStr}
                  isDragOver={dragOver === dateStr}
                  cards={cardsByDate[dateStr] || []}
                  tactics={tacticsByDate[dateStr] || []}
                  onOpenCard={card => openCard(card, card._tabKey, card._colKey)}
                  onOpenTactic={(tactic, date) => setTacticModal({ date, tactic })}
                  onAddTactic={date => setTacticModal({ date })}
                  onDragStart={handleDragStart}
                  onDragOver={ds => setDragOver(ds)}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={handleDrop}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Tactic Modal ──────────────────────────────────────────────── */}
      {tacticModal && (
        <TacticModal
          date={tacticModal.date}
          tactic={tacticModal.tactic}
          allCards={allCards}
          onSave={(data) => {
            if (tacticModal.tactic) onUpdateTactic(tacticModal.tactic.id, data)
            else onAddTactic(data)
            setTacticModal(null)
          }}
          onDelete={tacticModal.tactic
            ? () => { onDeleteTactic(tacticModal.tactic.id); setTacticModal(null) }
            : null}
          onClose={() => setTacticModal(null)}
        />
      )}
    </div>
  )
}
