import React, { useState } from 'react'
import {
  X, Trash2, Save, Plus, ExternalLink, Check, Square,
  Calendar, DollarSign, User, Tag, Globe, ListChecks
} from 'lucide-react'
import {
  TACTIC_CATEGORIES, TRAFFIC_SOURCES, FUNNEL_STEPS,
  OWNERS, SPECIALTIES, COLUMNS, TACTIC_COLORS, TRAFFIC_SOURCE_COLORS
} from '../data/tacticCategories.js'
import { REPURPOSING_CHECKLIST } from '../data/seedData.js'

function formatCurrency(val) {
  if (val === '' || val === null || val === undefined) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export default function CardModal({ card, boardKey, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...card })
  const [newLink, setNewLink] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTrafficSource(src) {
    const current = form.trafficSources || []
    if (current.includes(src)) {
      set('trafficSources', current.filter(s => s !== src))
    } else {
      set('trafficSources', [...current, src])
    }
  }

  function toggleSpecialty(sp) {
    const current = form.specialty || []
    if (current.includes(sp)) {
      set('specialty', current.filter(s => s !== sp))
    } else {
      set('specialty', [...current, sp])
    }
  }

  function toggleChecklistItem(id) {
    set('checklist', form.checklist.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ))
  }

  function addLink() {
    if (!newLink.trim()) return
    set('links', [...(form.links || []), { id: Date.now().toString(), url: newLink.trim() }])
    setNewLink('')
  }

  function removeLink(id) {
    set('links', (form.links || []).filter(l => l.id !== id))
  }

  function addRepurposingChecklist() {
    const existing = form.checklist || []
    const newItems = REPURPOSING_CHECKLIST.map(item => ({
      ...item,
      id: item.id + '-' + Date.now() + Math.random(),
      done: false,
    }))
    set('checklist', [...existing, ...newItems])
  }

  function handleSave() {
    onSave(form)
  }

  const checklistDone = (form.checklist || []).filter(i => i.done).length
  const checklistTotal = (form.checklist || []).length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-xl overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-snap-border px-6 py-4 flex items-start justify-between z-10">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="text-lg font-bold text-snap-primary w-full border-b border-transparent hover:border-snap-border focus:border-snap-orange focus:outline-none pb-1"
              placeholder="Campaign name"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-snap-orange text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Save size={14} />
              Save
            </button>
            <button onClick={onClose} className="text-snap-muted hover:text-snap-primary p-1.5 rounded-lg hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
            >
              {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
            </select>
          </div>

          {/* Tactic */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
              <Tag size={12} className="inline mr-1" />Tactic Category
            </label>
            <select
              value={form.tactic}
              onChange={e => set('tactic', e.target.value)}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
            >
              <option value="">Select tactic...</option>
              {TACTIC_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Traffic Sources */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
              <Globe size={12} className="inline mr-1" />Traffic Sources
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAFFIC_SOURCES.map(src => {
                const selected = (form.trafficSources || []).includes(src)
                const c = TRAFFIC_SOURCE_COLORS[src] || { bg: '#F4F5F7', text: '#5E6C84' }
                return (
                  <button
                    key={src}
                    onClick={() => toggleTrafficSource(src)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      selected
                        ? 'border-current font-medium'
                        : 'border-snap-border text-snap-muted hover:border-snap-primary'
                    }`}
                    style={selected ? { backgroundColor: c.bg, color: c.text } : {}}
                  >
                    {src}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Funnel Step */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">Funnel Step</label>
            <select
              value={form.funnelStep}
              onChange={e => set('funnelStep', e.target.value)}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
            >
              <option value="">Select funnel step...</option>
              {FUNNEL_STEPS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
              <User size={12} className="inline mr-1" />Owner
            </label>
            <select
              value={form.owner}
              onChange={e => set('owner', e.target.value)}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
            >
              <option value="">Select owner...</option>
              {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">Specialty</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(sp => {
                const selected = (form.specialty || []).includes(sp)
                return (
                  <button
                    key={sp}
                    onClick={() => toggleSpecialty(sp)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      selected
                        ? 'bg-snap-dark text-white border-snap-dark font-medium'
                        : 'border-snap-border text-snap-muted hover:border-snap-primary'
                    }`}
                  >
                    {sp}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
                <Calendar size={12} className="inline mr-1" />Launch Date
              </label>
              <input
                type="date"
                value={form.launchDate}
                onChange={e => set('launchDate', e.target.value)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
                <Calendar size={12} className="inline mr-1" />End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
                <DollarSign size={12} className="inline mr-1" />Monthly Budget
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={e => set('budget', parseFloat(e.target.value) || 0)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
                <DollarSign size={12} className="inline mr-1" />Annual Budget
              </label>
              <input
                type="number"
                value={form.annualBudget}
                onChange={e => set('annualBudget', parseFloat(e.target.value) || 0)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 font-mono"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">Spend to Date</label>
              <input
                type="number"
                value={form.spendToDate}
                onChange={e => set('spendToDate', parseFloat(e.target.value) || 0)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">Revenue Earned</label>
              <input
                type="number"
                value={form.revenueEarned}
                onChange={e => set('revenueEarned', parseFloat(e.target.value) || 0)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 font-mono"
                placeholder="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 resize-none"
              placeholder="Add notes..."
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1.5">
              <ExternalLink size={12} className="inline mr-1" />Links
            </label>
            <div className="space-y-1.5 mb-2">
              {(form.links || []).map(link => (
                <div key={link.id} className="flex items-center gap-2 bg-snap-bg rounded-lg px-2 py-1.5">
                  <ExternalLink size={12} className="text-snap-muted shrink-0" />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex-1 truncate">
                    {link.url}
                  </a>
                  <button onClick={() => removeLink(link.id)} className="text-snap-muted hover:text-snap-danger ml-1">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                placeholder="https://..."
                className="flex-1 border border-snap-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              />
              <button
                onClick={addLink}
                className="bg-snap-dark text-white px-3 py-1.5 rounded-lg text-sm hover:bg-snap-primary transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-snap-muted uppercase tracking-wide">
                <ListChecks size={12} className="inline mr-1" />
                Repurposing Checklist
                {(form.checklist || []).length > 0 && (
                  <span className="ml-2 font-mono text-snap-primary">{checklistDone}/{checklistTotal}</span>
                )}
              </label>
              {(form.checklist || []).length === 0 && (
                <button
                  onClick={addRepurposingChecklist}
                  className="text-xs text-snap-orange hover:underline flex items-center gap-1"
                >
                  <Plus size={10} />Add checklist
                </button>
              )}
            </div>

            {(form.checklist || []).length > 0 && (
              <>
                {/* Progress bar */}
                <div className="w-full bg-snap-border rounded-full h-1.5 mb-3">
                  <div
                    className="bg-snap-success h-1.5 rounded-full transition-all"
                    style={{ width: checklistTotal > 0 ? `${(checklistDone / checklistTotal) * 100}%` : '0%' }}
                  />
                </div>
                <div className="space-y-1">
                  {form.checklist.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className="flex items-start gap-2 w-full text-left hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors group"
                    >
                      {item.done
                        ? <Check size={14} className="text-snap-success mt-0.5 shrink-0" />
                        : <Square size={14} className="text-snap-border mt-0.5 shrink-0 group-hover:text-snap-muted" />
                      }
                      <span className={`text-sm ${item.done ? 'line-through text-snap-muted' : 'text-snap-primary'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-snap-border">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-snap-danger hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Delete campaign
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-snap-danger font-medium">Are you sure?</span>
                <button
                  onClick={() => onDelete(card.id)}
                  className="bg-snap-danger text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-snap-muted hover:text-snap-primary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
