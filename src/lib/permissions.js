export const ROLE_LEVELS = {
  viewer: 1,
  contributor: 2,
  editor: 3,
  admin: 4,
  super_admin: 5,
}

const level = (role) => ROLE_LEVELS[role] ?? 0

export const canEdit = (role) => level(role) >= ROLE_LEVELS.editor
export const canAdmin = (role) => level(role) >= ROLE_LEVELS.admin
export const canUpload = (role) => level(role) >= ROLE_LEVELS.contributor
export const canComment = (role) => level(role) >= ROLE_LEVELS.contributor
export const isSuperAdmin = (role) => role === 'super_admin'
