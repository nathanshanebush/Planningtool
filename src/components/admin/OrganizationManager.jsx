import React, { useState } from 'react'
import { Shield, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from '../../hooks/useOrganizations'

const PLAN_BADGE = {
  starter: 'bg-white/10 text-white/60',
  pro: 'bg-orange/20 text-orange',
  enterprise: 'bg-purple-500/20 text-purple-300',
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function PlanBadge({ plan }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PLAN_BADGE[plan] ?? PLAN_BADGE.starter}`}>
      {plan}
    </span>
  )
}

function NewOrgModal({ onClose }) {
  const create = useCreateOrganization()
  const [form, setForm] = useState({ name: '', slug: '', owner_email: '', plan: 'starter' })

  function handleNameChange(e) {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: slugify(name) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await create.mutateAsync({ ...form, status: 'active' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-coal border border-white/15 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-lg">New Organization</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1 font-medium uppercase tracking-wide">Name</label>
            <input
              autoFocus
              required
              value={form.name}
              onChange={handleNameChange}
              placeholder="Acme Marketing"
              className="w-full px-3 py-2 bg-jet border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 font-medium uppercase tracking-wide">Slug</label>
            <input
              required
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="acme-marketing"
              className="w-full px-3 py-2 bg-jet border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange/50 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 font-medium uppercase tracking-wide">Owner Email</label>
            <input
              type="email"
              required
              value={form.owner_email}
              onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))}
              placeholder="admin@acme.com"
              className="w-full px-3 py-2 bg-jet border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 font-medium uppercase tracking-wide">Plan</label>
            <select
              value={form.plan}
              onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
              className="w-full px-3 py-2 bg-jet border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange/50 text-sm"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 py-2 text-sm bg-orange text-white rounded-lg hover:bg-orange/90 disabled:opacity-50 transition-colors font-medium"
            >
              {create.isPending ? 'Creating…' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditableRow({ org }) {
  const update = useUpdateOrganization()
  const deleteOrg = useDeleteOrganization()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({ name: org.name, owner_email: org.owner_email, plan: org.plan, status: org.status })

  async function handleSave() {
    await update.mutateAsync({ id: org.id, ...form })
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await deleteOrg.mutateAsync(org.id)
  }

  async function toggleStatus() {
    const next = org.status === 'active' ? 'suspended' : 'active'
    await update.mutateAsync({ id: org.id, status: next })
  }

  if (editing) {
    return (
      <tr className="border-b border-white/5 bg-white/3">
        <td className="px-4 py-3">
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-2 py-1 bg-jet border border-white/15 rounded text-white text-sm focus:outline-none focus:border-orange/50"
          />
        </td>
        <td className="px-4 py-3">
          <input
            value={form.owner_email}
            onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))}
            className="w-full px-2 py-1 bg-jet border border-white/15 rounded text-white text-sm focus:outline-none focus:border-orange/50"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={form.plan}
            onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
            className="px-2 py-1 bg-jet border border-white/15 rounded text-white text-sm focus:outline-none"
          >
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </td>
        <td className="px-4 py-3 text-white/50 text-sm">{org.status}</td>
        <td className="px-4 py-3 text-white/50 text-sm text-center">{org.user_count}</td>
        <td className="px-4 py-3 text-white/50 text-sm text-center">{org.campaign_count}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={update.isPending} className="p-1 text-orange hover:text-orange/80 transition-colors">
              <Check size={15} />
            </button>
            <button onClick={() => setEditing(false)} className="p-1 text-white/40 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors group">
      <td className="px-4 py-3">
        <button
          onClick={() => setEditing(true)}
          className="text-white text-sm font-medium hover:text-orange transition-colors flex items-center gap-1.5 group/name"
        >
          {org.name}
          <Pencil size={12} className="opacity-0 group-hover/name:opacity-60 transition-opacity" />
        </button>
      </td>
      <td className="px-4 py-3 text-white/50 text-sm">{org.owner_email}</td>
      <td className="px-4 py-3"><PlanBadge plan={org.plan} /></td>
      <td className="px-4 py-3">
        <button
          onClick={toggleStatus}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            org.status === 'active'
              ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
              : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
          }`}
        >
          {org.status}
        </button>
      </td>
      <td className="px-4 py-3 text-white/50 text-sm text-center">{org.user_count}</td>
      <td className="px-4 py-3 text-white/50 text-sm text-center">{org.campaign_count}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <>
              <button
                onClick={handleDelete}
                disabled={deleteOrg.isPending}
                className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs text-white/40 hover:text-white rounded transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export function OrganizationManager() {
  const { isSuperAdmin } = usePermissions()
  const { data: orgs = [], isLoading } = useOrganizations()
  const [showModal, setShowModal] = useState(false)

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Shield size={48} className="text-white/20" />
        <p className="text-white font-medium">Access Denied</p>
        <p className="text-white/50 text-sm">Only super admins can manage organizations.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Organizations</h3>
          <p className="text-white/40 text-sm mt-0.5">{orgs.length} organization{orgs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-orange text-white text-sm font-medium rounded-lg hover:bg-orange/90 transition-colors"
        >
          <Plus size={14} />
          New Organization
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-white/30 text-sm">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wide">Org Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wide">Owner Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wide">Users</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wide">Campaigns</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <EditableRow key={org.id} org={org} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <NewOrgModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
