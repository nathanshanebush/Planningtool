import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/content': 'Content',
  '/admin': 'Admin Panel',
  '/admin/dropdowns': 'Dropdown Manager',
  '/admin/users': 'User Manager',
  '/admin/audit': 'Audit Log',
}

export function AppLayout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Impera'

  return (
    <div className="flex h-screen bg-coal overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
