import React, { useState, useEffect, useRef } from 'react'
import { X, Trash2, Plus, ExternalLink, Check, Save, Copy } from 'lucide-react'
import { OWNERS, SPECIALTIES, TACTIC_CATEGORIES, TRAFFIC_SOURCES, FUNNEL_STEPS } from '../data/tacticCategories'
import { REPURPOSING_CHECKLIST } from '../data/seedData'
import { format, parseISO } from 'date-fns'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-production', label: 'In Production' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'live-active', label: 'Live / Active' },
  { id: 'pending-review', label: 'Pending Review' },
  { id: 'complete', label: 'Complete' },
]

export default function CardDetail({ card, onClose, onUpdate, onDelete, onMove, onDuplicate }) {
  const [local, setLocal] = useState(card)
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [duplicated, setDuplicated] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => { setLocal(card) }, [card])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const save = (field, value) => {
    const updated = { ...local, [field]: value }
    setLocal(updated)
    onUpdate(card._tabKey, card._colKey, card.id, { [field]: value })
  }

  const saveMulti = (updates) => {
    const updated = { ...local, ...updates }
    setLocal(updated)
    onUpdate(card._tabKey, card._colKey, card.id, updates)
  }

  const saveAll = () => {
    onUpdate(card._tabKey, card._colKey, card.id, local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const duplicateAsNew = () => {
    if (onDuplicate) {
      onDuplicate(card._tabKey, local)
      setDuplicated(true)
      setTimeout(() => setDuplicated(false), 2000)
    }
  }

  const toggleSource = (src) => {
    const sources = local.trafficSources || []
    const next = sources.includes(src) ? sources.filter(s => s !== src) : [...sources, src]
    save('trafficSources', next)
  }

  const toggleSpecialty = (sp) => {
    const specs = local.specialty || []
    const next = specs.includes(sp) ? specs.filter(s => s !== sp) : [...specs, sp]
    save('specialty', next)
  }

  const toggleChecklist = (id) => {
    const next = (local.checklist || []).map(i => i.id === id ? { ...i, done: !i.done } : i)
    save('checklist', next)
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const item = { id: `ci-${Date.now()}`, label: newChecklistItem.trim(), done: false }
    const next = [...(local.checklist || []), item]
    save('checklist', next)
    setNewChecklistItem('')
  }

  const removeChecklistItem = (id) => {
    const next = (local.checklist || []).filter(i => i.id !== id)
    save('checklist', next)
  }

  const addLink = () => {
    if (!newLink.url.trim()) return
    const next = [...(local.links || []), { ...newLink, id: `link-${Date.now()}` }]
    save('links', next)
    setNewLink({ label: '', url: '' })
  }

  const removeLink = (id) => {
    const next = (local.links || []).filter(l => l.id !== id)
    save('links', next)
  }

  const handleStatusChange = (newCol) => {
    if (newCol === card._colKey) return
    onMove(card._tabKey, card._colKey, card._tabKey, newCol, card.id)
    onClose()
  }

  const roi = local.annualBudget > 0 && local.revenueEarned > 0
    ? (local.revenueEarned / local.annualBudget).toFixed(1) + '×'
    : '—'

  const checklistDone = (local.checklist || []).filter(i => i.done).length
  const checklistTotal = (local.checklist || []).length

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DFE1E6] bg-[#1A1A2E]">
          <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{local.campaignType}</span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Campaign Name */}
          <div>
            <input
              type="text"
              value={local.name}
              onChange={e => setLocal(p => ({ ...p, name: e.target.value }))}
              onBlur={e => save('name', e.target.value)}
              className="w-full text-xl font-bold text-[#172B4D] border-0 border-b-2 border-[#DFE1E6] focus:border-[#4C9AFF] outline-none pb-1 bg-transparent"
              placeholder="Campaign name"
            />
          </div>

          {/* Status / Move */}
          <div>
            <Label>Status</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLUMNS.map(col => (
                <button
                  key={col.id}
                  onClick={() => handleStatusChange(col.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    local.status === col.id || card._colKey === col.id
                      ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                      : 'border-[#DFE1E6] text-[#5E6C84] hover:border-[#172B4D]'
                  }`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Owner + Launch Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Owner</Label>
              <select
                value={local.owner || ''}
                onChange={e => save('owner', e.target.value)}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
              >
                <option value="">Select owner</option>
                {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <Label>Launch Date</Label>
              <input
                type="date"
                value={local.launchDate || ''}
                onChange={e => save('launchDate', e.target.value)}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
              />
            </div>
          </div>

          {/* Tactic + Funnel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tactic Category</Label>
              <select
                value={local.tactic || ''}
                onChange={e => save('tactic', e.target.value)}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
              >
                <option value="">Select tactic</option>
                {TACTIC_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Funnel Step</Label>
              <select
                value={local.funnelStep || ''}
                onChange={e => save('funnelStep', e.target.value)}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
              >
                <option value="">Select step</option>
                {FUNNEL_STEPS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Traffic Sources */}
          <div>
            <Label>Traffic Sources</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRAFFIC_SOURCES.map(src => (
                <button
                  key={src}
                  onClick={() => toggleSource(src)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    (local.trafficSources || []).includes(src)
                      ? 'bg-[#DEEBFF] text-[#0747A6] border-[#4C9AFF]'
                      : 'border-[#DFE1E6] text-[#5E6C84] hover:border-[#172B4D]'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Target Specialty */}
          <div>
            <Label>Target Specialty</Label>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALTIES.map(sp => (
                <button
                  key={sp}
                  onClick={() => toggleSpecialty(sp)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    (local.specialty || []).includes(sp)
                      ? 'bg-[#E3FCEF] text-[#006644] border-[#57D9A3]'
                      : 'border-[#DFE1E6] text-[#5E6C84] hover:border-[#172B4D]'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Monthly Budget ($)</Label>
              <input
                type="number"
                value={local.budget || ''}
                onChange={e => setLocal(p => ({ ...p, budget: Number(e.target.value) }))}
                onBlur={e => {
                  const val = Number(e.target.value)
                  saveMulti({ budget: val, annualBudget: local.annualBudget || val * 12 })
                }}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Annual Budget ($)</Label>
              <input
                type="number"
                value={local.annualBudget || ''}
                onChange={e => setLocal(p => ({ ...p, annualBudget: Number(e.target.value) }))}
                onBlur={e => save('annualBudget', Number(e.target.value))}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Spend to Date ($)</Label>
              <input
                type="number"
                value={local.spendToDate || ''}
                onChange={e => setLocal(p => ({ ...p, spendToDate: Number(e.target.value) }))}
                onBlur={e => save('spendToDate', Number(e.target.value))}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Revenue Earned ($)</Label>
              <input
                type="number"
                value={local.revenueEarned || ''}
                onChange={e => setLocal(p => ({ ...p, revenueEarned: Number(e.target.value) }))}
                onBlur={e => save('revenueEarned', Number(e.target.value))}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Estimated ROI */}
          <div className="bg-[#F4F5F7] rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-[#5E6C84]">Estimated ROI</span>
            <span className="font-mono font-bold text-[#172B4D] text-lg">{roi}</span>
          </div>

          {/* End Date */}
          <div>
            <Label>End Date (optional)</Label>
            <input
              type="date"
              value={local.endDate || ''}
              onChange={e => save('endDate', e.target.value)}
              className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes / Description</Label>
            <textarea
              value={local.notes || ''}
              onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))}
              onBlur={e => save('notes', e.target.value)}
              rows={3}
              className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] resize-none"
              placeholder="Add notes..."
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Checklist {checklistTotal > 0 && <span className="text-[#5E6C84] font-normal ml-1">({checklistDone}/{checklistTotal})</span>}</Label>
            </div>
            {checklistTotal > 0 && (
              <div className="mb-1.5 h-1.5 bg-[#DFE1E6] rounded-full overflow-hidden">
                <div className="h-full bg-[#36B37E] rounded-full transition-all" style={{ width: `${(checklistDone / checklistTotal) * 100}%` }} />
              </div>
            )}
            <div className="space-y-1">
              {(local.checklist || []).map(item => (
                <div key={item.id} className="flex items-center gap-2 group py-0.5">
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${item.done ? 'bg-[#36B37E] border-[#36B37E]' : 'border-[#DFE1E6] hover:border-[#36B37E]'}`}
                  >
                    {item.done && <Check size={10} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-[#5E6C84]' : 'text-[#172B4D]'}`}>{item.label}</span>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#5E6C84] hover:text-red-500 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={e => setNewChecklistItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#4C9AFF]"
                placeholder="Add item..."
              />
              <button
                onClick={addChecklistItem}
                className="text-sm px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#DFE1E6] text-[#172B4D] rounded-md transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
            <Label>Attachments / Links</Label>
            <div className="space-y-1 mb-2">
              {(local.links || []).map(link => (
                <div key={link.id} className="flex items-center gap-2 group">
                  <ExternalLink size={13} className="text-[#5E6C84] flex-shrink-0" />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex-1 truncate">
                    {link.label || link.url}
                  </a>
                  <button onClick={() => removeLink(link.id)} className="opacity-0 group-hover:opacity-100 text-[#5E6C84] hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLink.label}
                onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))}
                className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#4C9AFF]"
                placeholder="Label"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#4C9AFF]"
                placeholder="https://..."
              />
              <button onClick={addLink} className="text-sm px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#DFE1E6] text-[#172B4D] rounded-md transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Created at */}
          <div className="text-xs text-[#5E6C84] pt-2 border-t border-[#DFE1E6]">
            Created: {local.createdAt ? format(new Date(local.createdAt), 'MMM d, yyyy') : 'Unknown'}
          </div>
        </div>

        {/* Footer: Save + Duplicate + Delete */}
        <div className="px-5 py-3 border-t border-[#DFE1E6] bg-[#F4F5F7] space-y-2">
          {/* Save & Duplicate buttons */}
          {!deleteConfirm && (
            <div className="flex gap-2">
              <button
                onClick={saveAll}
                className={`flex items-center justify-center gap-1.5 flex-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  saved
                    ? 'bg-[#36B37E] text-white'
                    : 'bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white'
                }`}
              >
                <Save size={14} />
                {saved ? 'Saved!' : 'Save Updates'}
              </button>
              <button
                onClick={duplicateAsNew}
                className={`flex items-center justify-center gap-1.5 flex-1 text-sm font-medium px-3 py-2 rounded-md border transition-colors ${
                  duplicated
                    ? 'bg-[#36B37E] text-white border-[#36B37E]'
                    : 'bg-white border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]'
                }`}
              >
                <Copy size={14} />
                {duplicated ? 'Copied!' : 'Duplicate as New'}
              </button>
            </div>
          )}

          {/* Delete */}
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#172B4D] flex-1">Delete this campaign?</span>
              <button onClick={() => { onDelete(card._tabKey, card._colKey, card.id); onClose() }} className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="text-sm px-3 py-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
              Delete Campaign
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function Label({ children }) {
  return <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">{children}</label>
}
