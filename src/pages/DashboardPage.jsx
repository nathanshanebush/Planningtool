import React from 'react'
import { AlertTriangle, Paperclip } from 'lucide-react'
import { MyTasksWidget } from '../components/dashboard/MyTasksWidget'
import { CampaignStatusWidget } from '../components/dashboard/CampaignStatusWidget'
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget'
import { useTactics } from '../hooks/useTactics'
import useAuthStore from '../store/authStore'

function NeedsReviewWidget() {
  const { data: tactics } = useTactics()
  const items = (tactics ?? []).filter((t) => t.status === 'Needs Review').slice(0, 4)
  return (
    <div className="bg-jet rounded-xl border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Needs Review</h3>
        {items.length > 0 && (
          <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-white/40 text-sm">Nothing needs review right now.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.id} className="text-sm text-white bg-white/5 px-3 py-2 rounded-lg truncate">
              {t.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CreativeNeededWidget() {
  const { data: tactics } = useTactics()
  const needsCreative = (tactics ?? []).filter((t) => ['Not Started', 'In Progress'].includes(t.status)).slice(0, 4)
  return (
    <div className="bg-jet rounded-xl border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip size={16} className="text-white/60" />
        <h3 className="text-sm font-semibold text-white">Creative Still Needed</h3>
        {needsCreative.length > 0 && (
          <span className="ml-auto bg-jet border border-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {needsCreative.length}
          </span>
        )}
      </div>
      {needsCreative.length === 0 ? (
        <p className="text-white/40 text-sm">All creatives uploaded.</p>
      ) : (
        <ul className="space-y-2">
          {needsCreative.map((t) => (
            <li key={t.id} className="text-sm text-white/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
              <span className="truncate">{t.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
        </h2>
        <p className="text-white/50 text-sm mt-1">Here's what's happening with your campaigns.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MyTasksWidget />
        <NeedsReviewWidget />
        <CreativeNeededWidget />
        <CampaignStatusWidget />
        <div className="lg:col-span-2">
          <RecentActivityWidget />
        </div>
      </div>
    </div>
  )
}
