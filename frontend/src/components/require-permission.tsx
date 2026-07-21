import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/contexts/auth-context'
import { usePermission } from '@/hooks/use-permission'

export function RequirePermission({ menuKey, children }: { menuKey: string; children: ReactNode }) {
  const { user } = useAuth()
  const { canView } = usePermission(menuKey)

  if (!canView) {
    const fallback = user?.permissions.find((p) => p.can_view)
    return <Navigate to={fallback ? fallback.path : '/login'} replace />
  }

  return <>{children}</>
}
