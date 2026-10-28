import type { RoleId } from "@/types/rbac"

import { accountRoles } from "@/data/engineering"

import { fallbackRole } from "@/configs/rbac"

/** Role for a sign-in email; unknown accounts get the least-privileged role. */
export async function resolveRole(
  email: string | null | undefined
): Promise<RoleId> {
  if (!email) return fallbackRole
  return accountRoles[email.toLowerCase()] ?? fallbackRole
}
