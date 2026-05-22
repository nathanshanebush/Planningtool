import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { DropdownField } from '../shared/DropdownField'
import { useUpdateCampaign, useDeleteCampaign } from '../../hooks/useCampaigns'
import { MOCK_DROPDOWNS } from '../../hooks/useDropdowns'

const STATUS_OPTIONS = ['planning', 'active', 'paused', 'completed']

export function EditCampaignModal({ campaign, open, onClose }) {
  const navigate = useNavigate()
  const updateCampaign = useUpdateCampaign()
  const deleteCampaign = useDeleteCampaign()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [form, setForm] = useState({
    name: '',
    campaign_type: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    budget: '',
    spend_to_date: '',
  })

  // Pre-fill when campaign changes / modal opens
  useEffect(() => {
    if (campaign && open) {
      setForm({
        name: campaign.name ?? '',
        campaign_type: campaign.campaign_type ?? '',
        description: campaign.description ?? '',
        start_date: campaign.start_date ?? '',
        end_date: campaign.end_date ?? '',
        status: campaign.status ?? 'planning',
        budget: campaign.budget != null ? String(campaign.budget) : '',
        spend_to_date: campaign.spend_to_date != null ? String(campaign.spend_to_date) : '',
      })
      setConfirmDelete(false)
    }
  }, [campaign, open])

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateCampaign.mutateAsync({
      id: campaign.id,
      name: form.name,
      campaign_type: form.campaign_type,
      description: form.description,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
      budget: form.budget !== '' ? parseFloat(form.budget) : null,
      spend_to_date: form.spend_to_date !== '' ? parseFloat(form.spend_to_date) : null,
    })
    onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await deleteCampaign.mutateAsync(campaign.id)
    onClose()
    navigate('/campaigns')
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Campaign" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-white/60 block mb-1.5">Campaign Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Campaign name"
            className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
          />
        </div>

        {/* Campaign Type + Status */}
        <div className="grid grid-cols-2 gap-3">
          <DropdownField
            label="Campaign Type"
            value={form.campaign_type}
            options={MOCK_DROPDOWNS['Campaign Type']}
            onChange={set('campaign_type')}
          />
          <DropdownField
            label="Status"
            value={form.status}
            options={STATUS_OPTIONS}
            onChange={set('status')}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-white/60 block mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60 resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full bg-coal border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="w-full bg-coal border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">Budget ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="0"
              className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">Spend to Date ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.spend_to_date}
              onChange={(e) => setForm((f) => ({ ...f, spend_to_date: e.target.value }))}
              placeholder="0"
              className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <Button
            variant="danger"
            type="button"
            onClick={handleDelete}
            disabled={deleteCampaign.isPending}
          >
            {confirmDelete
              ? (deleteCampaign.isPending ? 'Deleting…' : 'Click again to confirm')
              : 'Delete Campaign'}
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={updateCampaign.isPending}>
              {updateCampaign.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
