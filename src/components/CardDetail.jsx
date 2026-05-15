import React, { useState, useEffect, useRef } from 'react'
import { X, Trash2, Plus, ExternalLink, Check, Save, Copy, ChevronDown, ChevronRight, Link2 } from 'lucide-react'
import { OWNERS, SPECIALTIES, TACTIC_CATEGORIES, TRAFFIC_SOURCES, FUNNEL_STEPS } from '../data/tacticCategories'
import { format } from 'date-fns'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-production', label: 'In Production' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'live-active', label: 'Live / Active' },
  { id: 'pending-review', label: 'Pending Review' },
  { id: 'complete', label: 'Complete' },
]

const PLATFORM_OPTIONS = ['Facebook', 'LinkedIn', 'Google Ads', 'YouTube', 'Email / SMS', 'Instagram', 'TikTok', 'Other']
const REVIEW_STATUS_OPTIONS = ['Draft', 'Pending Review', 'Approved', 'Live', 'Completed']
const GOING_OPTIONS = ['Yes', 'No', 'TBD']
const TIER_OPTIONS = ['Connector', 'Advocate', 'Ambassador']

// ── Sub-components ─────────────────────────────────────────────────────────

function Label({ children }) {
  return <label className="block text-xs font-semibold text-[#5E6C84] uppercase tracking-wider mb-1.5">{children}</label>
}

function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, onBlur, placeholder = '', type = 'text', mono = false }) {
  return (
    <input type={type} value={value || ''} onChange={onChange} onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] ${mono ? 'font-mono' : ''}`}
    />
  )
}

function SelectInput({ value, onChange, options, placeholder = 'Select…' }) {
  return (
    <select value={value || ''} onChange={onChange}
      className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function LinkInput({ value, onChange, onBlur, label }) {
  return (
    <div className="flex items-center gap-2">
      <input type="url" value={value || ''} onChange={onChange} onBlur={onBlur}
        placeholder="https://..."
        className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
      />
      {value && (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-0.5 text-xs text-blue-600 hover:underline">
          <Link2 size={12} /> Open
        </a>
      )}
    </div>
  )
}

function SectionHeader({ title, color = '#1A1A2E', open, onToggle, count }) {
  return (
    <button onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
      style={{ background: color }}>
      <span className="flex items-center gap-2">
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {title}
        {count > 0 && <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-white/80">{count}</span>}
      </span>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CardDetail({ card, onClose, onUpdate, onDelete, onMove, onDuplicate }) {
  const [local, setLocal] = useState(card)
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [duplicated, setDuplicated] = useState(false)
  const [openSections, setOpenSections] = useState({ tracking: false, performance: false, event: false, addetail: false, content: false, affiliate: false, links: false })
  const panelRef = useRef(null)

  useEffect(() => { setLocal(card) }, [card.id])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const save = (field, value) => {
    setLocal(p => ({ ...p, [field]: value }))
    onUpdate(card._tabKey, card._colKey, card.id, { [field]: value })
  }

  const saveMulti = (updates) => {
    setLocal(p => ({ ...p, ...updates }))
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
    const next = (local.trafficSources || []).includes(src)
      ? (local.trafficSources || []).filter(s => s !== src)
      : [...(local.trafficSources || []), src]
    save('trafficSources', next)
  }

  const toggleSpecialty = (sp) => {
    const next = (local.specialty || []).includes(sp)
      ? (local.specialty || []).filter(s => s !== sp)
      : [...(local.specialty || []), sp]
    save('specialty', next)
  }

  const toggleChecklist = (id) => {
    const next = (local.checklist || []).map(i => i.id === id ? { ...i, done: !i.done } : i)
    save('checklist', next)
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const item = { id: `ci-${Date.now()}`, label: newChecklistItem.trim(), done: false }
    save('checklist', [...(local.checklist || []), item])
    setNewChecklistItem('')
  }

  const removeChecklistItem = (id) => save('checklist', (local.checklist || []).filter(i => i.id !== id))

  const addLink = () => {
    if (!newLink.url.trim()) return
    save('links', [...(local.links || []), { ...newLink, id: `link-${Date.now()}` }])
    setNewLink({ label: '', url: '' })
  }

  const removeLink = (id) => save('links', (local.links || []).filter(l => l.id !== id))

  const handleStatusChange = (newCol) => {
    if (newCol === card._colKey) return
    onMove(card._tabKey, card._colKey, card._tabKey, newCol, card.id)
    onClose()
  }

  const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }))

  const roi = Number(local.annualBudget) > 0 && Number(local.revenueEarned) > 0
    ? (Number(local.revenueEarned) / Number(local.annualBudget)).toFixed(2) + '×'
    : '—'

  const checklistDone = (local.checklist || []).filter(i => i.done).length
  const checklistTotal = (local.checklist || []).length

  // Count filled fields per section for badges
  const countFilled = (fields) => fields.filter(f => local[f] !== '' && local[f] != null && local[f] !== undefined && local[f] !== 0).length

  const inp = (field) => ({
    value: local[field] || '',
    onChange: e => setLocal(p => ({ ...p, [field]: e.target.value })),
    onBlur: e => save(field, e.target.value),
  })

  const numInp = (field) => ({
    value: local[field] ?? '',
    onChange: e => setLocal(p => ({ ...p, [field]: e.target.value === '' ? '' : Number(e.target.value) })),
    onBlur: e => save(field, e.target.value === '' ? '' : Number(e.target.value)),
  })

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease-out' }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DFE1E6] bg-[#1A1A2E] flex-shrink-0">
          <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{local.campaignType}</span>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={18} /></button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Campaign Name */}
          <input type="text" value={local.name || ''}
            onChange={e => setLocal(p => ({ ...p, name: e.target.value }))}
            onBlur={e => save('name', e.target.value)}
            className="w-full text-xl font-bold text-[#172B4D] border-0 border-b-2 border-[#DFE1E6] focus:border-[#4C9AFF] outline-none pb-1 bg-transparent"
            placeholder="Campaign name" />

          {/* Status */}
          <div>
            <Label>Status</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLUMNS.map(col => (
                <button key={col.id} onClick={() => handleStatusChange(col.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    card._colKey === col.id ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'border-[#DFE1E6] text-[#5E6C84] hover:border-[#172B4D]'
                  }`}>
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Owner + Launch Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner">
              <SelectInput value={local.owner} onChange={e => save('owner', e.target.value)} options={OWNERS} placeholder="Select owner" />
            </Field>
            <Field label="Launch Date">
              <TextInput type="date" {...inp('launchDate')} />
            </Field>
          </div>

          {/* Tactic + Funnel */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tactic Category">
              <select value={local.tactic || ''} onChange={e => save('tactic', e.target.value)}
                className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]">
                <option value="">Select tactic</option>
                {TACTIC_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Funnel Step">
              <SelectInput value={local.funnelStep} onChange={e => save('funnelStep', e.target.value)} options={FUNNEL_STEPS} placeholder="Select step" />
            </Field>
          </div>

          {/* Traffic Sources */}
          <div>
            <Label>Traffic Sources</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRAFFIC_SOURCES.map(src => (
                <button key={src} onClick={() => toggleSource(src)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    (local.trafficSources || []).includes(src) ? 'bg-[#DEEBFF] text-[#0747A6] border-[#4C9AFF]' : 'border-[#DFE1E6] text-[#5E6C84] hover:border-[#172B4D]'
                  }`}>{src}</button>
              ))}
            </div>
          </div>

          {/* Specialty */}
          <div>
            <Label>Target Specialty</Label>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALTIES.map(sp => (
                <button key={sp} onClick={() => toggleSpecialty(sp)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    (local.specialty || []).includes(sp) ? 'bg-[#E3FCEF] text-[#006644] border-[#57D9A3]' : 'border-[#DFE1E6] text-[#5E6C84] hover:border-[#172B4D]'
                  }`}>{sp}</button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Budget ($)">
              <input type="number" value={local.budget ?? ''} placeholder="0"
                onChange={e => setLocal(p => ({ ...p, budget: e.target.value === '' ? '' : Number(e.target.value) }))}
                onBlur={e => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value)
                  saveMulti({ budget: val, annualBudget: (local.annualBudget !== '' && local.annualBudget > 0) ? local.annualBudget : val * 12 })
                }}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
            </Field>
            <Field label="Annual Budget ($)">
              <input type="number" value={local.annualBudget ?? ''} placeholder="0"
                onChange={e => setLocal(p => ({ ...p, annualBudget: e.target.value === '' ? '' : Number(e.target.value) }))}
                onBlur={e => save('annualBudget', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
            </Field>
            <Field label="Spend to Date ($)">
              <input type="number" value={local.spendToDate ?? ''} placeholder="0"
                onChange={e => setLocal(p => ({ ...p, spendToDate: e.target.value === '' ? '' : Number(e.target.value) }))}
                onBlur={e => save('spendToDate', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
            </Field>
            <Field label="Revenue Earned ($)">
              <input type="number" value={local.revenueEarned ?? ''} placeholder="0"
                onChange={e => setLocal(p => ({ ...p, revenueEarned: e.target.value === '' ? '' : Number(e.target.value) }))}
                onBlur={e => save('revenueEarned', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
            </Field>
          </div>

          {/* ROI */}
          <div className="bg-[#F4F5F7] rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-[#5E6C84]">Estimated ROI</span>
            <span className="font-mono font-bold text-[#172B4D] text-lg">{roi}</span>
          </div>

          {/* End Date + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="End Date">
              <TextInput type="date" {...inp('endDate')} />
            </Field>
            <Field label="Go-Live Date">
              <TextInput type="date" {...inp('goLiveDate')} />
            </Field>
          </div>

          <Field label="Notes / Description">
            <textarea value={local.notes || ''}
              onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))}
              onBlur={e => save('notes', e.target.value)}
              rows={3}
              className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] resize-none"
              placeholder="Add notes..." />
          </Field>

          {/* ── TRACKING section ───────────────────────────────────────── */}
          <SectionHeader title="Tracking" color="#403294" open={openSections.tracking}
            onToggle={() => toggleSection('tracking')}
            count={countFilled(['campaignCode', 'platform', 'reviewer', 'reviewStatus'])} />
          {openSections.tracking && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Campaign Code">
                  <TextInput {...inp('campaignCode')} placeholder="e.g. TS062026-1" />
                </Field>
                <Field label="Platform">
                  <SelectInput value={local.platform} onChange={e => save('platform', e.target.value)} options={PLATFORM_OPTIONS} placeholder="Select platform" />
                </Field>
                <Field label="Reviewer">
                  <TextInput {...inp('reviewer')} placeholder="Name" />
                </Field>
                <Field label="Review Status">
                  <SelectInput value={local.reviewStatus} onChange={e => save('reviewStatus', e.target.value)} options={REVIEW_STATUS_OPTIONS} placeholder="Select status" />
                </Field>
              </div>
            </div>
          )}

          {/* ── PERFORMANCE section ────────────────────────────────────── */}
          <SectionHeader title="Performance Metrics" color="#006644" open={openSections.performance}
            onToggle={() => toggleSection('performance')}
            count={countFilled(['leadsGenerated', 'appointmentsSet', 'sales', 'impressions', 'cpc', 'ctr'])} />
          {openSections.performance && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Leads Generated">
                  <input type="number" placeholder="0" {...numInp('leadsGenerated')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Appts Set">
                  <input type="number" placeholder="0" {...numInp('appointmentsSet')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Sales">
                  <input type="number" placeholder="0" {...numInp('sales')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Impressions">
                  <input type="number" placeholder="0" {...numInp('impressions')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="CPC ($)">
                  <input type="number" placeholder="0.00" step="0.01" {...numInp('cpc')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="CTR (%)">
                  <input type="number" placeholder="0.00" step="0.01" {...numInp('ctr')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Conv. Rate (%)">
                  <input type="number" placeholder="0.00" step="0.01" {...numInp('conversionRate')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Clicks">
                  <input type="number" placeholder="0" {...numInp('clicks')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
              </div>
              <Field label="Performance Notes">
                <textarea value={local.performanceNotes || ''} rows={2} placeholder="Notes on performance..."
                  onChange={e => setLocal(p => ({ ...p, performanceNotes: e.target.value }))}
                  onBlur={e => save('performanceNotes', e.target.value)}
                  className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] resize-none" />
              </Field>
            </div>
          )}

          {/* ── EVENT DETAILS section ──────────────────────────────────── */}
          <SectionHeader title="Event Details" color="#BF2600" open={openSections.event}
            onToggle={() => toggleSection('event')}
            count={countFilled(['location', 'boothNumber', 'going', 'contactName'])} />
          {openSections.event && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location">
                  <TextInput {...inp('location')} placeholder="City, State" />
                </Field>
                <Field label="Booth #">
                  <TextInput {...inp('boothNumber')} placeholder="e.g. 217" />
                </Field>
                <Field label="Going?">
                  <SelectInput value={local.going} onChange={e => save('going', e.target.value)} options={GOING_OPTIONS} placeholder="Yes / No / TBD" />
                </Field>
                <Field label="Est. Participants">
                  <input type="number" placeholder="0" {...numInp('estimatedParticipants')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Travel Date">
                  <TextInput type="date" {...inp('travelDate')} />
                </Field>
                <Field label="Ad Start (Pre-Show)">
                  <TextInput type="date" {...inp('adStartPreShow')} />
                </Field>
                <Field label="Ad Start (Post-Show)">
                  <TextInput type="date" {...inp('adStartPostShow')} />
                </Field>
                <Field label="Email Start Date">
                  <TextInput type="date" {...inp('emailStartDate')} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Contact Name">
                  <TextInput {...inp('contactName')} placeholder="Full name" />
                </Field>
                <Field label="Contact Phone">
                  <TextInput type="tel" {...inp('contactPhone')} placeholder="Phone number" />
                </Field>
              </div>
              <Field label="Contact Email">
                <TextInput type="email" {...inp('contactEmail')} placeholder="email@example.com" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Opt-In Leads">
                  <input type="number" placeholder="0" {...numInp('optInLeads')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
              </div>
            </div>
          )}

          {/* ── AD DETAILS section ─────────────────────────────────────── */}
          <SectionHeader title="Ad Details" color="#008DA6" open={openSections.addetail}
            onToggle={() => toggleSection('addetail')}
            count={countFilled(['primaryCTA', 'keywords', 'targetingNotes'])} />
          {openSections.addetail && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary CTA">
                  <TextInput {...inp('primaryCTA')} placeholder="e.g. Register, Book a Call" />
                </Field>
              </div>
              <Field label="Keywords / Hashtags">
                <textarea value={local.keywords || ''} rows={2} placeholder="Keywords, hashtags..."
                  onChange={e => setLocal(p => ({ ...p, keywords: e.target.value }))}
                  onBlur={e => save('keywords', e.target.value)}
                  className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] resize-none" />
              </Field>
              <Field label="Targeting Notes">
                <textarea value={local.targetingNotes || ''} rows={2} placeholder="Custom audiences, interests, lookalike %..."
                  onChange={e => setLocal(p => ({ ...p, targetingNotes: e.target.value }))}
                  onBlur={e => save('targetingNotes', e.target.value)}
                  className="w-full text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D] resize-none" />
              </Field>
            </div>
          )}

          {/* ── CONTENT / BLOG section ─────────────────────────────────── */}
          <SectionHeader title="Content / Blog" color="#172B4D" open={openSections.content}
            onToggle={() => toggleSection('content')}
            count={countFilled(['writer', 'publishedDate'])} />
          {openSections.content && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Writer">
                  <TextInput {...inp('writer')} placeholder="Writer name" />
                </Field>
                <Field label="Published Date">
                  <TextInput type="date" {...inp('publishedDate')} />
                </Field>
              </div>
            </div>
          )}

          {/* ── AFFILIATE section ──────────────────────────────────────── */}
          <SectionHeader title="Affiliate" color="#FF991F" open={openSections.affiliate}
            onToggle={() => toggleSection('affiliate')}
            count={countFilled(['affiliateCompany', 'affiliateName', 'affiliateCode'])} />
          {openSections.affiliate && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company">
                  <TextInput {...inp('affiliateCompany')} placeholder="Company name" />
                </Field>
                <Field label="Affiliate Name">
                  <TextInput {...inp('affiliateName')} placeholder="Full name" />
                </Field>
                <Field label="Affiliate Email">
                  <TextInput type="email" {...inp('affiliateEmail')} placeholder="email@..." />
                </Field>
                <Field label="Affiliate Code / ID">
                  <TextInput {...inp('affiliateCode')} placeholder="e.g. AFF-001" />
                </Field>
                <Field label="Tier">
                  <SelectInput value={local.affiliateTier} onChange={e => save('affiliateTier', e.target.value)} options={TIER_OPTIONS} placeholder="Select tier" />
                </Field>
                <Field label="Offer Type">
                  <TextInput {...inp('offerType')} placeholder="e.g. Free trial, discount" />
                </Field>
                <Field label="Revenue Attributed ($)">
                  <input type="number" placeholder="0" {...numInp('revenueAttributed')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
                <Field label="Commission Earned ($)">
                  <input type="number" placeholder="0" {...numInp('commissionEarned')}
                    className="w-full font-mono text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]" />
                </Field>
              </div>
            </div>
          )}

          {/* ── LINKS section ──────────────────────────────────────────── */}
          <SectionHeader title="Tracked Links" color="#5E6C84" open={openSections.links}
            onToggle={() => toggleSection('links')}
            count={countFilled(['utmTrackingLink', 'landingPageLink', 'thankYouPageLink', 'retargetingPageLink', 'adCopyLink', 'creativeAssetsLink', 'destinationURL', 'liveAdLink', 'formIntegrationLink'])} />
          {openSections.links && (
            <div className="space-y-3 pl-1">
              {[
                { field: 'landingPageLink', label: 'Landing Page URL' },
                { field: 'thankYouPageLink', label: 'Thank You Page URL' },
                { field: 'retargetingPageLink', label: 'Retargeting Page URL' },
                { field: 'utmTrackingLink', label: 'UTM Tracking Link' },
                { field: 'destinationURL', label: 'Destination URL / Funnel Link' },
                { field: 'adCopyLink', label: 'Ad Copy (Google Doc / Trello)' },
                { field: 'creativeAssetsLink', label: 'Creative Assets Folder' },
                { field: 'liveAdLink', label: 'Live Ad Preview Link' },
                { field: 'formIntegrationLink', label: 'Form / CRM Integration (GHL)' },
              ].map(({ field, label }) => (
                <Field key={field} label={label}>
                  <LinkInput value={local[field]}
                    onChange={e => setLocal(p => ({ ...p, [field]: e.target.value }))}
                    onBlur={e => save(field, e.target.value)} />
                </Field>
              ))}
            </div>
          )}

          {/* ── CHECKLIST ─────────────────────────────────────────────── */}
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
                  <button onClick={() => toggleChecklist(item.id)}
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${item.done ? 'bg-[#36B37E] border-[#36B37E]' : 'border-[#DFE1E6] hover:border-[#36B37E]'}`}>
                    {item.done && <Check size={10} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-[#5E6C84]' : 'text-[#172B4D]'}`}>{item.label}</span>
                  <button onClick={() => removeChecklistItem(item.id)} className="opacity-0 group-hover:opacity-100 text-[#5E6C84] hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#4C9AFF]"
                placeholder="Add item..." />
              <button onClick={addChecklistItem} className="text-sm px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#DFE1E6] text-[#172B4D] rounded-md transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ── ATTACHMENTS ───────────────────────────────────────────── */}
          <div>
            <Label>Attachments / Links</Label>
            <div className="space-y-1 mb-2">
              {(local.links || []).map(link => (
                <div key={link.id} className="flex items-center gap-2 group">
                  <ExternalLink size={13} className="text-[#5E6C84] flex-shrink-0" />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex-1 truncate">
                    {link.label || link.url}
                  </a>
                  <button onClick={() => removeLink(link.id)} className="opacity-0 group-hover:opacity-100 text-[#5E6C84] hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newLink.label} onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))}
                className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#4C9AFF]" placeholder="Label" />
              <input type="url" value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                className="flex-1 text-sm border border-[#DFE1E6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#4C9AFF]" placeholder="https://..." />
              <button onClick={addLink} className="text-sm px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#DFE1E6] text-[#172B4D] rounded-md transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="text-xs text-[#5E6C84] pt-2 border-t border-[#DFE1E6]">
            Created: {local.createdAt ? format(new Date(local.createdAt), 'MMM d, yyyy') : 'Unknown'}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DFE1E6] bg-[#F4F5F7] space-y-2 flex-shrink-0">
          {!deleteConfirm && (
            <div className="flex gap-2">
              <button onClick={saveAll}
                className={`flex items-center justify-center gap-1.5 flex-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${saved ? 'bg-[#36B37E] text-white' : 'bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white'}`}>
                <Save size={14} />
                {saved ? 'Saved!' : 'Save Updates'}
              </button>
              <button onClick={duplicateAsNew}
                className={`flex items-center justify-center gap-1.5 flex-1 text-sm font-medium px-3 py-2 rounded-md border transition-colors ${duplicated ? 'bg-[#36B37E] text-white border-[#36B37E]' : 'bg-white border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]'}`}>
                <Copy size={14} />
                {duplicated ? 'Copied!' : 'Duplicate as New'}
              </button>
            </div>
          )}
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#172B4D] flex-1">Delete this campaign?</span>
              <button onClick={() => { onDelete(card._tabKey, card._colKey, card.id); onClose() }}
                className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(false)}
                className="text-sm px-3 py-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} /> Delete Campaign
            </button>
          )}
        </div>
      </div>
    </>
  )
}
