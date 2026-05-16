import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { PageLoader } from '../shared/LoadingSpinner'

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuthStore()

  if (loading) return <PageLoader />

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user) {
    const levels = { viewer: 1, contributor: 2, editor: 3, admin: 4, super_admin: 5 }
    const userLevel = levels[user.role] ?? 0
    const requiredLevel = levels[requiredRole] ?? 0
    if (userLevel < requiredLevel) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
