import React from 'react'
import { format, parseISO } from 'date-fns'
import { Shield } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

const MOCK_AUDIT = [
  { id: 'a1', user_id: 'u1', action: 'update', record_type: 'tactic', record_id: 't1', old_value: { status: 'Not Started' }, new_value: { status: 'In Progress' }, ip_address: '192.168.1.1', created_at: '2026-05-15T14:00:00Z' },
  { id: 'a2', user_id: 'u2', action: 'insert', record_type: 'campaign', record_id: 'c3', old_value: null, new_value: { name: 'Trade Show Chicago' }, ip_address: '10.0.0.5', created_at: '2026-05-12T09:00:00Z' },
  { id: 'a3', user_id: 'u1', action: 'update', record_type: 'profile', record_id: 'u3', old_value: { role: 'viewer' }, new_value: { role: 'contributor' }, ip_address: '192.168.1.1', created_at: '2026-05-10T11:30:00Z' },
  { id: 'a4', user_id: 'u1', action: 'delete', record_type: 'tactic', record_id: 't99', old_value: { name: 'Old Tactic' }, new_value: null, ip_address: '192.168.1.1', created_at: '2026-05-08T16:00:00Z' },
]

const ACTION_COLORS = {
  insert: 'bg-green-600/20 text-green-400',
  update: 'bg-blue-600/20 text-blue-400',
  delete: 'bg-red-600/20 text-red-400',
}

export function AuditLog() {
  const { isSuperAdmin } = usePermissions()

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Shield size={40} className="text-white/20" />
        <p className="text-white/50 text-sm">Audit log is only accessible to Super Admins.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Audit Log</h3>
        <p className="text-xs text-white/50 mt-1">All platform actions recorded in chronological order.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['Time', 'Action', 'Record Type', 'User', 'IP', 'Details'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_AUDIT.map((entry) => (
              <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                  {format(parseISO(entry.created_at), 'MMM d, h:mm a')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${ACTION_COLORS[entry.action] ?? 'bg-white/10 text-white/60'}`}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70 capitalize">{entry.record_type}</td>
                <td className="px-4 py-3 text-white/60 text-xs font-mono">{entry.user_id}</td>
                <td className="px-4 py-3 text-white/40 text-xs font-mono">{entry.ip_address}</td>
                <td className="px-4 py-3 text-white/50 text-xs max-w-xs truncate">
                  {entry.old_value && <span className="text-red-400/70">{JSON.stringify(entry.old_value)}</span>}
                  {entry.old_value && entry.new_value && <span className="text-white/30 mx-1">→</span>}
                  {entry.new_value && <span className="text-green-400/70">{JSON.stringify(entry.new_value)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
