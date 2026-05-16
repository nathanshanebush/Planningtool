import React from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
        <Inbox size={24} className="text-white/30" />
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        {description && <p className="text-white/50 text-sm mt-1">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
