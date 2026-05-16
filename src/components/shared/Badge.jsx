import React from 'react'

const statusColors = {
  'Not Started': 'bg-gray-600 text-white',
  'In Progress': 'bg-blue-600 text-white',
  'Needs Review': 'bg-amber-500 text-white',
  'Approved': 'bg-green-600 text-white',
  'Published': 'bg-teal-600 text-white',
  'On Hold': 'bg-red-500 text-white',
}

const roleColors = {
  viewer: 'bg-gray-600 text-white',
  contributor: 'bg-blue-600 text-white',
  editor: 'bg-green-600 text-white',
  admin: 'bg-orange text-white',
  super_admin: 'bg-purple-600 text-white',
}

const priorityColors = {
  Low: 'bg-gray-600 text-white',
  Medium: 'bg-blue-600 text-white',
  High: 'bg-amber-500 text-white',
  Urgent: 'bg-red-500 text-white',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] ?? 'bg-gray-600 text-white'}`}>
      {status}
    </span>
  )
}

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColors[role] ?? 'bg-gray-600 text-white'}`}>
      {role?.replace('_', ' ')}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority] ?? 'bg-gray-600 text-white'}`}>
      {priority}
    </span>
  )
}

export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-jet text-white ${className}`}>
      {children}
    </span>
  )
}
