import type { AccessUser, Action, Resource } from "@/types/rbac"

import { getSession } from "@/lib/auth"
import { assertCan, can } from "@/lib/rbac"

import { resolveRole } from "./accounts"

export class UnauthenticatedError extends Error {
  constructor() {
    super("Unauthenticated")
    this.name = "UnauthenticatedError"
  }
}

/** The signed-in user with their role, or null when there is no session. */
export async function getAccessUser(): Promise<AccessUser | null> {
  const session = await getSession()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    roleId: await resolveRole(session.user.email),
  }
}

/** Server-side guard: throws unless the signed-in user may do `action` on `resource`. */
export async function authorize(
  action: Action,
  resource: Resource
): Promise<AccessUser> {
  const user = await getAccessUser()
  if (!user) throw new UnauthenticatedError()
  assertCan(user, action, resource)
  return user
}

export { can }
