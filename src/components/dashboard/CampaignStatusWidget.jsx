import React from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useTactics } from '../../hooks/useTactics'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export function CampaignStatusWidget() {
  const { data: campaigns, isLoading } = useCampaigns()
  const { data: tactics } = useTactics()

  if (isLoading) return (
    <div className="bg-jet rounded-xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Campaign Status</h3>
      <div className="flex justify-center py-6"><LoadingSpinner /></div>
    </div>
  )

  return (
    <div className="bg-jet rounded-xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Campaign Status</h3>
      <div className="space-y-4">
        {(campaigns ?? []).map((campaign) => {
          const campaignTactics = (tactics ?? []).filter((t) => t.campaign_id === campaign.id)
          const total = campaignTactics.length
          const done = campaignTactics.filter((t) => ['Approved', 'Published'].includes(t.status)).length
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <div key={campaign.id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-white font-medium truncate">{campaign.name}</p>
                <span className="text-xs text-white/50 shrink-0 ml-2">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-white/40 mt-1">{done} / {total} tactics complete</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
