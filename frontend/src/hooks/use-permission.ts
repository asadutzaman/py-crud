import { useAuth } from '@/contexts/auth-context'

const EMPTY_PERMISSION = { canView: false, canCreate: false, canEdit: false, canDelete: false }

export function usePermission(menuKey: string) {
  const { permissions } = useAuth()
  const perm = permissions[menuKey]
  if (!perm) return EMPTY_PERMISSION
  return {
    canView: perm.can_view,
    canCreate: perm.can_create,
    canEdit: perm.can_edit,
    canDelete: perm.can_delete,
  }
}
