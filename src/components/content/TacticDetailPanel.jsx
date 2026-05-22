import React, { useState } from 'react'
import { SidePanel } from '../shared/SidePanel'
import { DropdownField } from '../shared/DropdownField'
import { StatusBadge, PriorityBadge } from '../shared/Badge'
import { CreativeUpload } from './CreativeUpload'
import { usePermissions } from '../../hooks/usePermissions'
import { useUpdateTactic, useDeleteTactic } from '../../hooks/useTactics'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'
import { Button } from '../shared/Button'
import { MessageSquare, Info, Image, Clock, Send } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const TABS = [
  { id: 'details', label: 'Details', icon: Info },
  { id: 'creative', label: 'Creative', icon: Image },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'history', label: 'History', icon: Clock },
]

const MOCK_COMMENTS = [
  { id: 'c1', user: { first_name: 'Alex', last_name: 'Kim' }, body: 'Copy draft ready for review.', created_at: '2026-05-14T10:00:00Z' },
  { id: 'c2', user: { first_name: 'Jordan', last_name: 'Lee' }, body: 'Looks great! Minor edits on the CTA.', created_at: '2026-05-14T15:30:00Z' },
]

const MOCK_HISTORY = [
  { id: 'h1', field: 'status', old: 'Not Started', new: 'In Progress', user: 'Alex Kim', at: '2026-05-12T09:00:00Z' },
  { id: 'h2', field: 'assigned_to', old: '', new: 'Jordan Lee', user: 'Admin', at: '2026-05-10T14:00:00Z' },
]

function DetailsTab({ tactic, canEdit, onUpdate }) {
  const fields = [
    { key: 'tactic_type', label: 'Tactic Type', dropdown: 'Tactic Type' },
    { key: 'platform', label: 'Platform', dropdown: 'Platform' },
    { key: 'traffic_source', label: 'Traffic Source', dropdown: 'Traffic Source' },
    { key: 'funnel_step', label: 'Funnel Step', dropdown: 'Funnel Step' },
    { key: 'content_pillar', label: 'Content Pillar', dropdown: 'Content Pillar' },
    { key: 'status', label: 'Status', dropdown: 'Asset Status' },
    { key: 'priority', label: 'Priority', dropdown: 'Priority' },
  ]

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="text-xs text-white/50 font-medium block mb-1">Tactic Name</label>
        <p className="text-white font-semibold text-lg">{tactic.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label, dropdown }) => (
          canEdit ? (
            <DropdownField
              key={key}
              label={label}
              value={tactic[key]}
              options={MOCK_DROPDOWNS[dropdown]}
              onChange={(v) => onUpdate({ id: tactic.id, [key]: v })}
            />
          ) : (
            <div key={key}>
              <label className="text-xs text-white/50 font-medium block mb-1">{label}</label>
              <p className="text-white text-sm">{tactic[key] ?? '—'}</p>
            </div>
          )
        ))}
        <div>
          <label className="text-xs text-white/50 font-medium block mb-1">Due Date</label>
          {canEdit ? (
            <input
              type="date"
              value={tactic.due_date ?? ''}
              onChange={(e) => onUpdate({ id: tactic.id, due_date: e.target.value })}
              className="w-full bg-coal border border-white/10 text-white rounded-md px-3 py-2 text-sm outline-none focus:border-orange/60"
            />
          ) : (
            <p className="text-white text-sm">{tactic.due_date ? format(parseISO(tactic.due_date), 'MMM d, yyyy') : '—'}</p>
          )}
        </div>
      </div>
      {(canEdit || tactic.copy_notes) && (
        <div>
          <label className="text-xs text-white/50 font-medium block mb-1">Copy Notes</label>
          {canEdit ? (
            <textarea
              defaultValue={tactic.copy_notes ?? ''}
              onBlur={(e) => onUpdate({ id: tactic.id, copy_notes: e.target.value })}
              rows={4}
              placeholder="Add copy notes, context, or instructions…"
              className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-md px-3 py-2 text-sm outline-none focus:border-orange/60 resize-none"
            />
          ) : (
            <p className="text-white/70 text-sm whitespace-pre-wrap">{tactic.copy_notes || '—'}</p>
          )}
        </div>
      )}

      <ROISection tactic={tactic} canEdit={canEdit} onUpdate={onUpdate} />
    </div>
  )
}

function ROINumberInput({ label, field, value, canEdit, tacticId, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? 0))

  const commit = () => {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed) && parsed !== value) {
      onUpdate({ id: tacticId, [field]: parsed })
    }
    setEditing(false)
  }

  return (
    <div>
      <label className="text-xs text-white/50 font-medium block mb-1">{label}</label>
      {canEdit && editing ? (
        <input
          autoFocus
          type="number"
          min="0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          className="w-full bg-coal border border-orange/60 text-white rounded-md px-3 py-1.5 text-sm outline-none"
        />
      ) : (
        <p
          className={`text-white text-sm px-3 py-1.5 rounded-md border border-transparent ${canEdit ? 'cursor-pointer hover:border-white/20 hover:bg-white/5' : ''}`}
          onClick={() => canEdit && setEditing(true)}
        >
          {field === 'revenue_generated' ? `$${(value ?? 0).toLocaleString()}` : (value ?? 0).toLocaleString()}
        </p>
      )}
    </div>
  )
}

function ROISection({ tactic, canEdit, onUpdate }) {
  const budget = tactic.budget || 0
  const leads = tactic.leads_generated || 0
  const revenue = tactic.revenue_generated || 0

  const costPerLead = leads > 0 ? budget / leads : null
  const roi = budget > 0 ? ((revenue - budget) / budget) * 100 : revenue > 0 ? 100 : null

  return (
    <div className="border-t border-white/10 pt-4">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">ROI &amp; Results</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <ROINumberInput label="Appt. Booked" field="appointments_booked" value={tactic.appointments_booked} canEdit={canEdit} tacticId={tactic.id} onUpdate={onUpdate} />
        <ROINumberInput label="Leads Generated" field="leads_generated" value={tactic.leads_generated} canEdit={canEdit} tacticId={tactic.id} onUpdate={onUpdate} />
        <ROINumberInput label="Sales Closed" field="sales_count" value={tactic.sales_count} canEdit={canEdit} tacticId={tactic.id} onUpdate={onUpdate} />
        <ROINumberInput label="Revenue Generated" field="revenue_generated" value={tactic.revenue_generated} canEdit={canEdit} tacticId={tactic.id} onUpdate={onUpdate} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-jet border border-white/10 rounded-full px-3 py-1">
          <span className="text-xs text-white/50">Cost/Lead</span>
          <span className="text-xs font-semibold text-white">
            {costPerLead !== null ? `$${costPerLead.toFixed(2)}` : '—'}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 bg-jet border rounded-full px-3 py-1 ${roi === null ? 'border-white/10' : roi > 0 ? 'border-green-500/30' : roi < 0 ? 'border-red-500/30' : 'border-white/10'}`}>
          <span className="text-xs text-white/50">ROI</span>
          <span className={`text-xs font-semibold ${roi === null ? 'text-white/40' : roi > 0 ? 'text-green-400' : roi < 0 ? 'text-red-400' : 'text-white/40'}`}>
            {roi !== null ? `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function CommentsTab({ canComment }) {
  const [text, setText] = useState('')
  const [comments, setComments] = useState(MOCK_COMMENTS)

  const submit = () => {
    if (!text.trim()) return
    setComments((prev) => [...prev, {
      id: `c${Date.now()}`,
      user: { first_name: 'You', last_name: '' },
      body: text,
      created_at: new Date().toISOString(),
    }])
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {c.user.first_name[0]}{c.user.last_name?.[0] ?? ''}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-white">{c.user.first_name} {c.user.last_name}</span>
                <span className="text-xs text-white/40">{format(parseISO(c.created_at), 'MMM d, h:mm a')}</span>
              </div>
              <p className="text-sm text-white/80">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
      {canComment && (
        <div className="p-4 border-t border-white/10 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Add a comment…"
            className="flex-1 bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
          />
          <button onClick={submit} className="p-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors">
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function HistoryTab({ canEdit }) {
  if (!canEdit) return (
    <div className="p-6 text-white/40 text-sm text-center">
      History is only visible to editors and above.
    </div>
  )
  return (
    <div className="p-6 space-y-3">
      {MOCK_HISTORY.map((h) => (
        <div key={h.id} className="flex gap-3 text-sm">
          <div className="w-2 h-2 mt-1.5 rounded-full bg-orange shrink-0" />
          <div>
            <p className="text-white">
              <span className="font-medium">{h.user}</span> changed <span className="text-white/70">{h.field}</span>
              {h.old && <> from <span className="text-white/50">&quot;{h.old}&quot;</span></>}
              {' '}to <span className="text-green-400">&quot;{h.new}&quot;</span>
            </p>
            <p className="text-white/40 text-xs mt-0.5">{format(parseISO(h.at), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TacticDetailPanel({ tactic, open, onClose }) {
  const [tab, setTab] = useState('details')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { canEdit, canComment } = usePermissions()
  const updateTactic = useUpdateTactic()
  const deleteTactic = useDeleteTactic()

  const handleUpdate = (data) => updateTactic.mutate(data)

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await deleteTactic.mutateAsync(tactic.id)
    setConfirmDelete(false)
    onClose()
  }

  return (
    <SidePanel open={open} onClose={onClose} title={tactic?.name ?? 'Tactic Detail'}>
      {tactic && (
        <>
          <div className="flex border-b border-white/10 px-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors -mb-px
                  ${tab === id ? 'border-orange text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'details' && <DetailsTab tactic={tactic} canEdit={canEdit} onUpdate={handleUpdate} />}
            {tab === 'creative' && <CreativeUpload tacticId={tactic.id} />}
            {tab === 'comments' && <CommentsTab canComment={canComment} />}
            {tab === 'history' && <HistoryTab canEdit={canEdit} />}
          </div>

          {canEdit && (
            <div className="border-t border-white/10 px-6 py-4 shrink-0">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleteTactic.isPending}
                className="w-full justify-center"
              >
                {deleteTactic.isPending
                  ? 'Deleting…'
                  : confirmDelete
                    ? 'Click again to confirm'
                    : 'Delete Tactic'}
              </Button>
            </div>
          )}
        </>
      )}
    </SidePanel>
  )
}
