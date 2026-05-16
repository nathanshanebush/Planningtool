import React, { useState } from 'react'
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Button } from '../shared/Button'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'

function OptionRow({ option, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(option)

  const commit = () => {
    onEdit(draft)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 py-2 px-3 hover:bg-white/5 rounded-lg group">
      <GripVertical size={14} className="text-white/20 cursor-grab shrink-0" />
      {editing ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            className="flex-1 bg-coal border border-orange/60 text-white text-sm rounded px-2 py-0.5 outline-none"
          />
          <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white"><X size={14} /></button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-white/80">{option}</span>
          <button onClick={() => setEditing(true)} className="text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  )
}

function DropdownSection({ name, options: initOptions }) {
  const [expanded, setExpanded] = useState(false)
  const [options, setOptions] = useState(initOptions)
  const [newLabel, setNewLabel] = useState('')

  const addOption = () => {
    if (!newLabel.trim()) return
    setOptions((prev) => [...prev, newLabel.trim()])
    setNewLabel('')
  }

  const deleteOption = (idx) => setOptions((prev) => prev.filter((_, i) => i !== idx))
  const editOption = (idx, val) => setOptions((prev) => prev.map((o, i) => i === idx ? val : o))

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-white/50" /> : <ChevronRight size={16} className="text-white/50" />}
          <span className="text-sm font-semibold text-white">{name}</span>
          <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{options.length} options</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-2 py-2 space-y-0.5">
          {options.map((opt, idx) => (
            <OptionRow
              key={`${opt}-${idx}`}
              option={opt}
              onDelete={() => deleteOption(idx)}
              onEdit={(val) => editOption(idx, val)}
            />
          ))}
          <div className="flex items-center gap-2 mt-2 px-3">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addOption() }}
              placeholder="Add new option…"
              className="flex-1 bg-coal border border-white/10 text-white placeholder-white/30 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-orange/60"
            />
            <Button size="sm" variant="ghost" onClick={addOption} disabled={!newLabel.trim()}>
              <Plus size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownManager() {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Dropdown Manager</h3>
        <p className="text-xs text-white/50 mt-1">Manage all dropdown options used across the platform.</p>
      </div>
      <div className="space-y-3">
        {Object.entries(MOCK_DROPDOWNS).map(([name, options]) => (
          <DropdownSection key={name} name={name} options={options} />
        ))}
      </div>
    </div>
  )
}
