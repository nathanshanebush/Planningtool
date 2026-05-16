import React, { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { Avatar } from '../shared/Avatar'
import useAuthStore from '../../store/authStore'

export function TopBar({ title }) {
  const { user } = useAuthStore()
  const [showUser, setShowUser] = useState(false)

  return (
    <header className="h-[60px] bg-jet border-b border-white/10 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <Search size={18} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange rounded-full" />
        </button>
        <div className="relative">
          <button onClick={() => setShowUser(!showUser)} className="focus:outline-none">
            <Avatar user={user} size="sm" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-coal border border-white/10 rounded-lg shadow-xl z-50 p-2">
              {user && (
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user.email}
                  </p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
              )}
              <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded">
                Profile Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
