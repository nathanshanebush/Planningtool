import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag, Kanban, TableProperties, Edit2, Check, X, Pencil, Plus, Target } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useCampaign, useUpdateCampaign } from '../../hooks/useCampaigns'
import { useTactics, useCreateTactic } from '../../hooks/useTactics'
import { KanbanView } from '../content/KanbanView'
import { Button } from '../shared/Button'
import { Modal } from '../shared/Modal'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { EditCampaignModal } from './EditCampaignModal'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${Math.round(num).toLocaleString()}`
}

function BudgetCell({ label, value, onSave, valueClass = 'text-white' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const start = () => { setDraft(String(Number(value) || 0)); setEditing(true) }
  const cancel = () => setEditing(false)
  const commit = () => {
    const n = parseFloat(draft.replace(/[^0-9.]/g, ''))
    if (!isNaN(n)) onSave(n)
    setEditing(false)
  }

  return (
    <div className="bg-coal rounded-lg p-3 flex flex-col gap-1">
      <span className="text-xs text-white/40">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
            className="w-24 bg-jet border border-orange/60 text-white text-sm rounded px-2 py-0.5 outline-none font-mono"
          />
          <button onClick={commit} className="text-green-400"><Check size={13} /></button>
          <button onClick={cancel} className="text-white/40"><X size={13} /></button>
        </div>
      ) : (
        <button onClick={start} className={`text-sm font-mono font-semibold group flex items-center gap-1 ${valueClass} hover:text-orange transition-colors`}>
          {fmt(value)}
          <Edit2 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>
      )}
    </div>
  )
}

const TACTIC_FORM_DEFAULT = {
  name: '',
  tactic_type: '',
  platform: '',
  priority: 'Medium',
  status: 'Not Started',
  due_date: '',
  copy_notes: '',
}

function AddTacticModal({ open, onClose, campaignId }) {
  const createTactic = useCreateTactic()
  const [form, setForm] = useState(TACTIC_FORM_DEFAULT)
  const [error, setError] = useState('')

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Tactic name is required.'); return }
    setError('')
    await createTactic.mutateAsync({
      campaign_id: campaignId,
      name: form.name.trim(),
      tactic_type: form.tactic_type || null,
      platform: form.platform || null,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      copy_notes: form.copy_notes || null,
    })
    setForm(TACTIC_FORM_DEFAULT)
    onClose()
  }

  const labelCls = 'block text-xs font-medium text-white/50 mb-1'
  const inputCls = 'w-full bg-coal border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange/60 placeholder-white/20'

  return (
    <Modal open={open} onClose={onClose} title="Add Tactic">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div>
          <label className={labelCls}>Tactic Name *</label>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Instagram Story Series"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Tactic Type</label>
            <select value={form.tactic_type} onChange={(e) => set('tactic_type', e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {MOCK_DROPDOWNS['Tactic Type'].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Platform</label>
            <select value={form.platform} onChange={(e) => set('platform', e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {MOCK_DROPDOWNS['Platform'].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Priority</label>
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputCls}>
              {MOCK_DROPDOWNS['Priority'].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
              {MOCK_DROPDOWNS['Asset Status'].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Due Date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => set('due_date', e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            value={form.copy_notes}
            onChange={(e) => set('copy_notes', e.target.value)}
            placeholder="Optional notes…"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit" disabled={createTactic.isPending}>
            {createTactic.isPending ? 'Adding…' : 'Add Tactic'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: campaign, isLoading } = useCampaign(id)
  const { data: tactics } = useTactics({ campaign_id: id })
  const updateCampaign = useUpdateCampaign()
  const [tacticView, setTacticView] = useState('kanban')
  const [showAddTactic, setShowAddTactic] = useState(false)

  const save = (field, val) => updateCampaign.mutate({ id, [field]: val })
  const [showEdit, setShowEdit] = useState(false)

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>
  if (!campaign) return <div className="text-white/50 text-center py-16">Campaign not found.</div>

  return (
    <div>
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} /> Back to Campaigns
      </button>

      {/* Campaign header card */}
      <div className="bg-jet rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{campaign.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {campaign.target_market && (
                <div className="flex items-center gap-1.5">
                  <Target size={13} className="text-violet-400" />
                  <span className="text-xs font-medium text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 rounded-full">
                    {campaign.target_market}
                  </span>
                </div>
              )}
              {campaign.campaign_type && (
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Tag size={14} />
                  <span>{campaign.campaign_type}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                campaign.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-white/10 text-white/60'
              }`}
            >
              {campaign.status}
            </span>
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
              title="Edit campaign"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>
        {campaign.description && (
          <p className="text-white/60 text-sm mb-4">{campaign.description}</p>
        )}
        {(campaign.start_date || campaign.end_date) && (
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Calendar size={14} />
            <span>
              {campaign.start_date ? format(parseISO(campaign.start_date), 'MMM d, yyyy') : '—'}
              {' → '}
              {campaign.end_date ? format(parseISO(campaign.end_date), 'MMM d, yyyy') : '—'}
            </span>
          </div>
        )}

        {/* Budget bar */}
        {(() => {
          const budget = Number(campaign.budget) || 0
          const spent = Number(campaign.spend_to_date) || 0
          const remaining = budget - spent
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
          return (
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Budget</p>
                <span className="text-xs text-white/30 font-mono">{pct.toFixed(0)}% utilized</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <BudgetCell label="Allocated" value={budget} onSave={(v) => save('budget', v)} />
                <BudgetCell label="Spent to Date" value={spent} onSave={(v) => save('spend_to_date', v)} valueClass="text-amber-400" />
                <div className="bg-coal rounded-lg p-3 flex flex-col gap-1">
                  <span className="text-xs text-white/40">Remaining</span>
                  <span className={`text-sm font-mono font-semibold ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {remaining < 0 ? '-' : ''}{fmt(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Tactics section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Tactics <span className="text-white/40 font-normal text-sm">({tactics?.length ?? 0})</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-jet border border-white/10 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setTacticView('kanban')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors
                  ${tacticView === 'kanban' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Kanban size={12} /> Kanban
              </button>
              <button
                onClick={() => setTacticView('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors
                  ${tacticView === 'table' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <TableProperties size={12} /> Table
              </button>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/content')}>
              Open in Content Board
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddTactic(true)}>
              <Plus size={13} className="inline -mt-0.5 mr-1" />
              Add Tactic
            </Button>
          </div>
        </div>

        {tacticView === 'kanban' ? (
          <div className="bg-jet rounded-xl border border-white/10 p-4">
            <KanbanView campaignId={id} />
          </div>
        ) : (
          (tactics?.length ?? 0) === 0 ? (
            <div className="bg-jet rounded-xl border border-white/10 p-8 text-center">
              <p className="text-white/50">No tactics yet for this campaign.</p>
            </div>
          ) : (
            <div className="bg-jet rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Tactic', 'Type', 'Platform', 'Assigned To', 'Due Date', 'Status', 'Priority'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-white/50 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tactics?.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-white/60">{t.tactic_type ?? '—'}</td>
                      <td className="px-4 py-3 text-white/60">{t.platform ?? '—'}</td>
                      <td className="px-4 py-3 text-white/60">{t.assigned_to ?? '—'}</td>
                      <td className="px-4 py-3 text-white/60">
                        {t.due_date ? format(parseISO(t.due_date), 'MMM d') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">{t.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded">{t.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <EditCampaignModal
        campaign={campaign}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />

      <AddTacticModal
        open={showAddTactic}
        onClose={() => setShowAddTactic(false)}
        campaignId={id}
      />
    </div>
  )
}
