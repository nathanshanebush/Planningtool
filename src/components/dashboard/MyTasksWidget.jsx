import React from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { useTactics } from '../../hooks/useTactics'
import useAuthStore from '../../store/authStore'
import { StatusBadge } from '../shared/Badge'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { EmptyState } from '../shared/EmptyState'

export function MyTasksWidget() {
  const { user } = useAuthStore()
  const { data: tactics, isLoading } = useTactics()

  const myTasks = (tactics ?? [])
    .filter((t) => t.assigned_to === user?.id || t.assigned_to === 'user1')
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
    .slice(0, 5)

  return (
    <div className="bg-jet rounded-xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">My Tasks</h3>
      {isLoading ? (
        <div className="flex justify-center py-6"><LoadingSpinner /></div>
      ) : myTasks.length === 0 ? (
        <EmptyState title="No tasks assigned" description="You're all caught up!" />
      ) : (
        <ul className="space-y-3">
          {myTasks.map((t) => {
            const overdue = t.due_date && isPast(parseISO(t.due_date)) && t.status !== 'Approved' && t.status !== 'Published'
            return (
              <li key={t.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.name}</p>
                  <p className={`text-xs mt-0.5 ${overdue ? 'text-red-400' : 'text-white/50'}`}>
                    {t.due_date ? format(parseISO(t.due_date), 'MMM d') : 'No due date'}
                    {overdue && ' · Overdue'}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
