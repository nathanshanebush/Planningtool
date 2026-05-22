import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Plus, Building2, X } from 'lucide-react'
import { useOrganizations, useCreateOrganization } from '../../hooks/useOrganizations'
import { usePermissions } from '../../hooks/usePermissions'
import useAuthStore from '../../store/authStore'

export function OrgSwitcher({ collapsed }) {
  const { isSuperAdmin } = usePermissions()
  const { currentOrgId, setCurrentOrgId } = useAuthStore()
  const { data: orgs = [] } = useOrganizations()
  const createOrg = useCreateOrganization()

  const [open, setOpen] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setShowNewForm(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isSuperAdmin) return null

  const currentOrg = orgs.find(o => o.id === currentOrgId) ?? orgs[0]

  function handleSelect(id) {
    setCurrentOrgId(id)
    setOpen(false)
    setShowNewForm(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    await createOrg.mutateAsync({ name: newName.trim(), slug, owner_email: newEmail.trim(), plan: 'starter', status: 'active' })
    setNewName('')
    setNewEmail('')
    setShowNewForm(false)
    setOpen(false)
  }

  return (
    <div className="relative px-3 py-2" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(o => !o); setShowNewForm(false) }}
        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/80 hover:text-white border border-white/10 ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? currentOrg?.name : undefined}
      >
        <Building2 size={14} className="shrink-0 text-orange" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left font-medium">{currentOrg?.name ?? 'Select Org'}</span>
            <ChevronDown size={13} className="shrink-0 text-white/40" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-coal border border-white/15 rounded-lg shadow-xl overflow-hidden">
          <div className="py-1">
            {orgs.map(org => (
              <button
                key={org.id}
                onClick={() => handleSelect(org.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/8 transition-colors text-left"
              >
                <Check size={13} className={`shrink-0 ${org.id === currentOrgId ? 'text-orange' : 'opacity-0'}`} />
                <span className={`flex-1 truncate ${org.id === currentOrgId ? 'text-white font-medium' : 'text-white/60 hover:text-white'}`}>
                  {org.name}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10">
            {!showNewForm ? (
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Plus size={13} />
                New Organization
              </button>
            ) : (
              <form onSubmit={handleCreate} className="p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/50 font-medium uppercase tracking-wide">New Org</span>
                  <button type="button" onClick={() => setShowNewForm(false)} className="text-white/30 hover:text-white/70">
                    <X size={13} />
                  </button>
                </div>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Organization name"
                  className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-orange/50"
                />
                <input
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Owner email"
                  type="email"
                  className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-orange/50"
                />
                <button
                  type="submit"
                  disabled={!newName.trim() || createOrg.isPending}
                  className="w-full py-1.5 text-sm bg-orange text-white rounded hover:bg-orange/90 disabled:opacity-50 transition-colors font-medium"
                >
                  {createOrg.isPending ? 'Creating…' : 'Create'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
