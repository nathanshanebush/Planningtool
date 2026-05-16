import React from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Calendar, ArrowRight } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { useTactics } from '../../hooks/useTactics'

const statusColors = {
  active: 'bg-green-600/20 text-green-400 border border-green-600/30',
  planning: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  completed: 'bg-white/10 text-white/50 border border-white/10',
  paused: 'bg-amber-600/20 text-amber-400 border border-amber-600/30',
}

export function CampaignCard({ campaign }) {
  const navigate = useNavigate()
  const { data: tactics } = useTactics({ campaign_id: campaign.id })
  const total = tactics?.length ?? 0
  const done = (tactics ?? []).filter((t) => ['Approved', 'Published'].includes(t.status)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="bg-jet rounded-xl border border-white/10 p-5 cursor-pointer hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-white group-hover:text-white/90 leading-tight">{campaign.name}</h3>
        <ArrowRight size={16} className="text-white/30 group-hover:text-orange transition-colors shrink-0 mt-0.5" />
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

      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/50 mb-1.5">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-orange rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-white/40 mt-1">{done} / {total} tactics complete</p>
      </div>

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
    </div>
  )
}
