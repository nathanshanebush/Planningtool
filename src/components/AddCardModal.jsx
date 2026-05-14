import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import {
  TACTIC_CATEGORIES, TRAFFIC_SOURCES, FUNNEL_STEPS,
  OWNERS, SPECIALTIES, COLUMNS
} from '../data/tacticCategories.js'
import { REPURPOSING_CHECKLIST } from '../data/seedData.js'

const CAMPAIGN_TYPE_MAP = {
  'podcast-webinar': 'Podcast / Webinar',
  'trade-show': 'Trade Show',
  'paid-ads': 'Paid Ads / Digital',
}

const DEFAULT_TACTIC_MAP = {
  'podcast-webinar': 'Broadcast Media',
  'trade-show': 'Tradeshows / Events',
  'paid-ads': 'Digital & Online Marketing',
}

export default function AddCardModal({ boardKey, columnId, onClose, onAdd }) {
  const [form, setForm] = useState({
    id: 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    name: '',
    campaignType: CAMPAIGN_TYPE_MAP[boardKey] || '',
    tactic: DEFAULT_TACTIC_MAP[boardKey] || '',
    trafficSources: [],
    funnelStep: '',
    budget: 0,
    annualBudget: 0,
    spendToDate: 0,
    revenueEarned: 0,
    specialty: ['General'],
    launchDate: '',
    endDate: '',
    owner: '',
    notes: '',
    checklist: [],
    links: [],
    status: columnId,
    createdAt: new Date().toISOString(),
  })

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

  function handleAdd() {
    if (!form.name.trim()) return
    onAdd(form)
  }

  const colTitle = COLUMNS.find(c => c.id === columnId)?.title || columnId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-snap-border">
          <div>
            <h2 className="font-bold text-snap-primary">Add New Campaign</h2>
            <p className="text-xs text-snap-muted mt-0.5">Adding to: {colTitle}</p>
          </div>
          <button onClick={onClose} className="text-snap-muted hover:text-snap-primary p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Campaign Name *</label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              placeholder="Enter campaign name..."
            />
          </div>

          {/* Tactic */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Tactic Category</label>
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
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Traffic Sources</label>
            <div className="flex flex-wrap gap-2">
              {TRAFFIC_SOURCES.map(src => {
                const selected = form.trafficSources.includes(src)
                return (
                  <button
                    key={src}
                    onClick={() => toggleTrafficSource(src)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      selected
                        ? 'bg-snap-dark text-white border-snap-dark font-medium'
                        : 'border-snap-border text-snap-muted hover:border-snap-primary'
                    }`}
                  >
                    {src}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Owner + Funnel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Owner</label>
              <select
                value={form.owner}
                onChange={e => set('owner', e.target.value)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              >
                <option value="">Select...</option>
                {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Funnel Step</label>
              <select
                value={form.funnelStep}
                onChange={e => set('funnelStep', e.target.value)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              >
                <option value="">Select...</option>
                {FUNNEL_STEPS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Monthly Budget ($)</label>
              <input
                type="number"
                value={form.budget}
                onChange={e => set('budget', parseFloat(e.target.value) || 0)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Launch Date</label>
              <input
                type="date"
                value={form.launchDate}
                onChange={e => set('launchDate', e.target.value)}
                className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-snap-muted uppercase tracking-wide mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full border border-snap-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-snap-orange/30 resize-none"
              placeholder="Optional notes..."
            />
          </div>

          {/* Add checklist option for podcast */}
          {boardKey === 'podcast-webinar' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add-checklist"
                onChange={e => {
                  if (e.target.checked) {
                    set('checklist', REPURPOSING_CHECKLIST.map(item => ({
                      ...item,
                      id: item.id + '-' + Date.now() + Math.random(),
                    })))
                  } else {
                    set('checklist', [])
                  }
                }}
                className="rounded"
              />
              <label htmlFor="add-checklist" className="text-sm text-snap-muted cursor-pointer">
                Include repurposing checklist
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-snap-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-snap-muted hover:text-snap-primary border border-snap-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!form.name.trim()}
            className="flex items-center gap-1.5 bg-snap-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add Campaign
          </button>
        </div>
      </div>
    </div>
  )
}
