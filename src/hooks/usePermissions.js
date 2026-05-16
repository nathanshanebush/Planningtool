import useAuthStore from '../store/authStore'
import { canEdit, canAdmin, canUpload, canComment, isSuperAdmin, ROLE_LEVELS } from '../lib/permissions'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'viewer'

  return {
    role,
    canEdit: canEdit(role),
    canAdmin: canAdmin(role),
    canUpload: canUpload(role),
    canComment: canComment(role),
    isSuperAdmin: isSuperAdmin(role),
    roleLevel: ROLE_LEVELS[role] ?? 0,
  }
}
