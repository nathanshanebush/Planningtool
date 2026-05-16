import React, { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { DropdownField } from '../shared/DropdownField'
import { usePermissions } from '../../hooks/usePermissions'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const ROLE_OPTIONS_BY_LEVEL = {
  admin: ['viewer', 'contributor', 'editor'],
  super_admin: ['viewer', 'contributor', 'editor', 'admin', 'super_admin'],
}

export function InviteUserModal({ open, onClose }) {
  const { role } = usePermissions()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: 'viewer' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const availableRoles = ROLE_OPTIONS_BY_LEVEL[role] ?? ['viewer']

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))
  const setStr = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 600))
        setSuccess(true)
        return
      }
      const { error: err } = await supabase.functions.invoke('invite-user', { body: form })
      if (err) throw err
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? 'Failed to invite user.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({ first_name: '', last_name: '', email: '', role: 'viewer' })
    setSuccess(false)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Invite User">
      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <p className="text-white font-medium">Invitation sent!</p>
          <p className="text-white/50 text-sm mt-1">{form.email} will receive an email to set up their account.</p>
          <Button variant="primary" className="mt-4 mx-auto" onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">First Name *</label>
              <input required value={form.first_name} onChange={setStr('first_name')} placeholder="Alex"
                className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Last Name</label>
              <input value={form.last_name} onChange={setStr('last_name')} placeholder="Kim"
                className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">Email *</label>
            <input required type="email" value={form.email} onChange={setStr('email')} placeholder="alex@company.com"
              className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange/60" />
          </div>
          <DropdownField label="Role" value={form.role} options={availableRoles} onChange={set('role')} />
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
