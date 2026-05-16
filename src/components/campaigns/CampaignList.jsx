import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { CampaignCard } from './CampaignCard'
import { useCampaigns, useCreateCampaign } from '../../hooks/useCampaigns'
import { Button } from '../shared/Button'
import { Modal } from '../shared/Modal'
import { DropdownField } from '../shared/DropdownField'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { EmptyState } from '../shared/EmptyState'
import { usePermissions } from '../../hooks/usePermissions'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'

function CreateCampaignModal({ open, onClose }) {
  const createCampaign = useCreateCampaign()
  const [form, setForm] = useState({ name: '', campaign_type: '', description: '', start_date: '', end_date: '' })

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createCampaign.mutateAsync(form)
    onClose()
    setForm({ name: '', campaign_type: '', description: '', start_date: '', end_date: '' })
  }

  return (
    <Modal open={open} onClose={onClose} title="New Campaign">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/60 block mb-1.5">Campaign Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Q3 Podcast Launch"
            className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
          />
        </div>
        <DropdownField
          label="Campaign Type"
          value={form.campaign_type}
          options={MOCK_DROPDOWNS['Campaign Type']}
          onChange={set('campaign_type')}
        />
        <div>
          <label className="text-xs font-medium text-white/60 block mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">Start Date</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full bg-coal border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">End Date</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="w-full bg-coal border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={createCampaign.isPending}>
            {createCampaign.isPending ? 'Creating…' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function CampaignList() {
  const { data: campaigns, isLoading } = useCampaigns()
  const { canEdit } = usePermissions()
  const [showCreate, setShowCreate] = useState(false)

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">All Campaigns</h2>
          <p className="text-white/50 text-sm mt-0.5">{campaigns?.length ?? 0} campaigns total</p>
        </div>
        {canEdit && (
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Campaign
          </Button>
        )}
      </div>

      {campaigns?.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create your first campaign to get started."
          action={canEdit && <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Campaign</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns?.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}

      <CreateCampaignModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
