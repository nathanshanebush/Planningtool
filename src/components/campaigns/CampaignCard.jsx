import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Calendar, ArrowRight, Edit2, Check, X, Pencil } from 'lucide-react'
import { useTactics } from '../../hooks/useTactics'
import { useUpdateCampaign } from '../../hooks/useCampaigns'
import { EditCampaignModal } from './EditCampaignModal'

const statusColors = {
  active: 'bg-green-600/20 text-green-400 border border-green-600/30',
  planning: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  completed: 'bg-white/10 text-white/50 border border-white/10',
  paused: 'bg-amber-600/20 text-amber-400 border border-amber-600/30',
}

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${Math.round(num).toLocaleString()}`
}

function BudgetInline({ label, value, onSave, valueClass = 'text-white' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const start = (e) => {
    e.stopPropagation()
    setDraft(String(Number(value) || 0))
    setEditing(true)
  }
  const cancel = (e) => { e?.stopPropagation(); setEditing(false) }
  const commit = (e) => {
    e?.stopPropagation()
    const n = parseFloat(draft.replace(/[^0-9.]/g, ''))
    if (!isNaN(n)) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-white/40">{label}</span>
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(e); if (e.key === 'Escape') cancel(e) }}
            className="w-20 bg-coal border border-orange/60 text-white text-xs rounded px-1.5 py-0.5 outline-none font-mono"
          />
          <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={11} /></button>
          <button onClick={cancel} className="text-white/40 hover:text-white"><X size={11} /></button>
        </div>
      </div>
    )
  }

  return (
    <button onClick={start} className="flex flex-col gap-0.5 text-left group">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-sm font-mono font-medium group-hover:text-orange transition-colors flex items-center gap-0.5 ${valueClass}`}>
        {fmt(value)}
        <Edit2 size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" />
      </span>
    </button>
  )
}

export function CampaignCard({ campaign }) {
  const navigate = useNavigate()
  const { data: tactics } = useTactics({ campaign_id: campaign.id })
  const updateCampaign = useUpdateCampaign()
  const [showEdit, setShowEdit] = useState(false)

  const total = tactics?.length ?? 0
  const done = (tactics ?? []).filter((t) => ['Approved', 'Published'].includes(t.status)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const budget = Number(campaign.budget) || 0
  const spent = Number(campaign.spend_to_date) || 0
  const remaining = budget - spent
  const budgetPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

  const save = (field, val) => updateCampaign.mutate({ id: campaign.id, [field]: val })

  return (
    <div
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="bg-jet rounded-xl border border-white/10 p-5 cursor-pointer hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-white group-hover:text-white/90 leading-tight">{campaign.name}</h3>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
            className="p-1 text-white/30 hover:text-white rounded transition-colors"
            title="Edit campaign"
          >
            <Pencil size={13} />
          </button>
          <ArrowRight size={16} className="text-white/30 group-hover:text-orange transition-colors" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {campaign.campaign_type && (
          <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">{campaign.campaign_type}</span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[campaign.status] ?? 'bg-white/10 text-white/50'}`}>
          {campaign.status}
        </span>
      </div>

      {campaign.description && (
        <p className="text-sm text-white/50 mb-4 line-clamp-2">{campaign.description}</p>
      )}

      {/* Tactic progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/50 mb-1.5">
          <span>Tactic Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-orange rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-white/40 mt-1">{done} / {total} tactics complete</p>
      </div>

      {/* Budget section */}
      {(budget > 0 || campaign.budget_category) && (
        <div className="border-t border-white/10 pt-3 mb-3">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Budget Utilization</span>
            <span className="font-mono">{budgetPct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <BudgetInline
              label="Allocated"
              value={budget}
              onSave={(v) => save('budget', v)}
            />
            <BudgetInline
              label="Spent"
              value={spent}
              onSave={(v) => save('spend_to_date', v)}
              valueClass="text-amber-400"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-white/40">Remaining</span>
              <span className={`text-sm font-mono font-medium ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {remaining < 0 ? '-' : ''}{fmt(Math.abs(remaining))}
              </span>
            </div>
          </div>
        </div>
      )}

      {(campaign.start_date || campaign.end_date) && (
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar size={12} />
          <span>
            {campaign.start_date ? format(parseISO(campaign.start_date), 'MMM d') : '?'}
            {' → '}
            {campaign.end_date ? format(parseISO(campaign.end_date), 'MMM d, yyyy') : '?'}
          </span>
        </div>
      )}

      <EditCampaignModal
        campaign={campaign}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </div>
  )
}
