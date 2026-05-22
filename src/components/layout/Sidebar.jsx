import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Folder, TableProperties, CalendarDays, DollarSign, Settings2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { RoleBadge } from '../shared/Badge'
import { Avatar } from '../shared/Avatar'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { OrgSwitcher } from './OrgSwitcher'

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group relative
      ${isActive
        ? 'bg-white/10 text-white border-l-2 border-orange pl-[10px]'
        : 'text-white/60 hover:text-white hover:bg-white/5'
      }`
    }
    title={collapsed ? label : undefined}
  >
    <Icon size={18} className="shrink-0" />
    {!collapsed && <span>{label}</span>}
    {collapsed && (
      <span className="absolute left-full ml-2 px-2 py-1 bg-coal text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {label}
      </span>
    )}
  </NavLink>
)

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const collapsed = !sidebarOpen

  return (
    <aside
      className={`
        relative flex flex-col bg-jet border-r border-white/10 transition-all duration-300
        ${collapsed ? 'w-[60px]' : 'w-[240px]'}
      `}
    >
      <div className={`flex items-center gap-2 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-1 h-6 bg-orange rounded-full shrink-0" />
        {!collapsed && (
          <span className="text-xl font-medium text-white tracking-wide">impera</span>
        )}
      </div>

      <OrgSwitcher collapsed={collapsed} />

      <nav className="flex-1 p-3 space-y-1">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/campaigns" icon={Folder} label="Campaigns" collapsed={collapsed} />
        <NavItem to="/content" icon={TableProperties} label="Content" collapsed={collapsed} />
        <NavItem to="/calendar" icon={CalendarDays} label="Calendar" collapsed={collapsed} />
        <NavItem to="/budget" icon={DollarSign} label="Budget" collapsed={collapsed} />
        <NavItem to="/admin" icon={Settings2} label="Admin" collapsed={collapsed} />
      </nav>

      <div className="p-3 border-t border-white/10">
        {user && (
          <div className={`flex items-center gap-2 mb-2 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar user={user} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user.email}
                </p>
                <RoleBadge role={user.role} />
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-jet border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
