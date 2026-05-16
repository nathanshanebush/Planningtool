import React, { useState } from 'react'
import { DropdownManager } from './DropdownManager'
import { UserManager } from './UserManager'
import { AuditLog } from './AuditLog'
import { usePermissions } from '../../hooks/usePermissions'
import { Shield } from 'lucide-react'

const TABS = [
  { id: 'dropdowns', label: 'Dropdowns' },
  { id: 'users', label: 'Users' },
  { id: 'audit', label: 'Audit Log', superAdminOnly: true },
]

export function AdminPanel() {
  const { canAdmin, isSuperAdmin } = usePermissions()
  const [tab, setTab] = useState('dropdowns')

  if (!canAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Shield size={48} className="text-white/20" />
        <p className="text-white font-medium">Access Restricted</p>
        <p className="text-white/50 text-sm">You need Admin permissions to view this page.</p>
      </div>
    )
  }

  const visibleTabs = TABS.filter((t) => !t.superAdminOnly || isSuperAdmin)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
        <p className="text-white/50 text-sm mt-1">Manage users, dropdown options, and system settings.</p>
      </div>

      <div className="flex border-b border-white/10 mb-6 gap-1">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t.id ? 'border-orange text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dropdowns' && <DropdownManager />}
      {tab === 'users' && <UserManager />}
      {tab === 'audit' && <AuditLog />}
    </div>
  )
}
