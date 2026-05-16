import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag, Kanban, TableProperties } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useCampaign } from '../../hooks/useCampaigns'
import { useTactics } from '../../hooks/useTactics'
import { KanbanView } from '../content/KanbanView'
import { Button } from '../shared/Button'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: campaign, isLoading } = useCampaign(id)
  const { data: tactics } = useTactics({ campaign_id: id })
  const [tacticView, setTacticView] = useState('kanban')

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
            {campaign.campaign_type && (
              <div className="flex items-center gap-1.5 mt-2 text-white/50 text-sm">
                <Tag size={14} />
                <span>{campaign.campaign_type}</span>
              </div>
            )}
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              campaign.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-white/10 text-white/60'
            }`}
          >
            {campaign.status}
          </span>
        </div>
        {campaign.description && (
          <p className="text-white/60 text-sm mb-4">{campaign.description}</p>
        )}
        {(campaign.start_date || campaign.end_date) && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Calendar size={14} />
            <span>
              {campaign.start_date ? format(parseISO(campaign.start_date), 'MMM d, yyyy') : '—'}
              {' → '}
              {campaign.end_date ? format(parseISO(campaign.end_date), 'MMM d, yyyy') : '—'}
            </span>
          </div>
        )}
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
    </div>
  )
}
