import React from 'react'

function getInitials(firstName, lastName, email) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-teal-600', 'bg-pink-600']

function colorFor(str) {
  return colors[(str?.charCodeAt(0) ?? 0) % colors.length]
}

export function Avatar({ user, size = 'md' }) {
  const initials = getInitials(user?.first_name, user?.last_name, user?.email)
  const color = colorFor(user?.first_name ?? user?.email)
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }

  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}>
      {initials}
    </div>
  )
}
