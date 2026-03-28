import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROLE_HIERARCHY } from '../../lib/utils'
import { FullPageSkeleton } from '../ui/Skeleton'

export function ProtectedRoute({ children, requiredRole = 'viewer' }) {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return <FullPageSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && ROLE_HIERARCHY[profile?.role] < ROLE_HIERARCHY[requiredRole]) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <FullPageSkeleton />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
