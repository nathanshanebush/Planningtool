import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { UserPlus } from 'lucide-react'
import { Button } from '../shared/Button'
import { RoleBadge } from '../shared/Badge'
import { InviteUserModal } from './InviteUserModal'
import { usePermissions } from '../../hooks/usePermissions'

const MOCK_USERS = [
  { id: 'u1', first_name: 'Jordan', last_name: 'Lee', email: 'jordan@example.com', role: 'super_admin', status: 'active', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', first_name: 'Alex', last_name: 'Kim', email: 'alex@example.com', role: 'editor', status: 'active', created_at: '2026-02-10T00:00:00Z' },
  { id: 'u3', first_name: 'Morgan', last_name: 'Taylor', email: 'morgan@example.com', role: 'contributor', status: 'active', created_at: '2026-03-15T00:00:00Z' },
  { id: 'u4', first_name: 'Casey', last_name: 'Rivera', email: 'casey@example.com', role: 'viewer', status: 'deactivated', created_at: '2026-04-01T00:00:00Z' },
]

const ROLE_OPTIONS_BY_ROLE = {
  admin: ['viewer', 'contributor', 'editor'],
  super_admin: ['viewer', 'contributor', 'editor', 'admin', 'super_admin'],
}

export function UserManager() {
  const { role, isSuperAdmin } = usePermissions()
  const [users, setUsers] = useState(MOCK_USERS)
  const [showInvite, setShowInvite] = useState(false)

  const updateRole = (id, newRole) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u))
  const toggleStatus = (id) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === 'active' ? 'deactivated' : 'active' } : u))

  const availableRoles = ROLE_OPTIONS_BY_ROLE[role] ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Users ({users.length})</h3>
        <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
          <UserPlus size={14} /> Invite User
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Date Added', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-white/60">{u.email}</td>
                <td className="px-4 py-3">
                  {isSuperAdmin || (role === 'admin' && u.role !== 'admin' && u.role !== 'super_admin') ? (
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="bg-coal border border-white/10 text-white text-xs rounded px-2 py-1 outline-none"
                    >
                      {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <RoleBadge role={u.role} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.status === 'active' ? 'bg-green-600/20 text-green-400' :
                    u.status === 'deactivated' ? 'bg-red-600/20 text-red-400' :
                    'bg-amber-600/20 text-amber-400'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs">
                  {format(parseISO(u.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant={u.status === 'active' ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => toggleStatus(u.id)}
                  >
                    {u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteUserModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  )
}
