import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { FullPageSkeleton } from '../ui/Skeleton'
import type { Role } from '../../types/models'

const ROLE_LEVEL: Record<Role, number> = { admin: 4, cashier: 3, leader: 2, viewer: 1 }

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
}

export function ProtectedRoute({ children, requiredRole = 'viewer' }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return <FullPageSkeleton />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const userLevel = ROLE_LEVEL[profile?.role ?? 'viewer']
  const required = ROLE_LEVEL[requiredRole]

  if (userLevel < required) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
