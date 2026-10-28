import type { AccessUser, Action, Resource } from "@/types/rbac"

import { rolePermissions } from "@/configs/rbac"

export class ForbiddenError extends Error {
  constructor(action: Action, resource: Resource) {
    super(`Forbidden: ${action} on ${resource}`)
    this.name = "ForbiddenError"
  }
}

/** True when `user`'s role grants `action` on `resource`. No user means no access. */
export function can(
  user: AccessUser | null | undefined,
  action: Action,
  resource: Resource
): boolean {
  if (!user) return false
  return (
    rolePermissions[user.roleId].grants[resource]?.includes(action) ?? false
  )
}

export function assertCan(
  user: AccessUser | null | undefined,
  action: Action,
  resource: Resource
): asserts user is AccessUser {
  if (!can(user, action, resource)) throw new ForbiddenError(action, resource)
}

export function roleLabel(user: AccessUser): string {
  return rolePermissions[user.roleId].label
}
