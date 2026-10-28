import type { ShellData } from "@/types/shell"

import { rolePermissions } from "@/configs/rbac"
import { createActions, resolveEnv } from "@/configs/shell"
import { getSession } from "@/lib/auth"
import { can } from "@/lib/rbac"

import { resolveRole } from "./accounts"
import { listNotifications } from "./notifications"

/** Header/sidebar data for the signed-in user, or null when there is no session. */
export async function getShellData(): Promise<ShellData | null> {
  const session = await getSession()
  const sessionUser = session?.user
  if (!sessionUser?.id) return null

  const roleId = await resolveRole(sessionUser.email)
  const access = { id: sessionUser.id, roleId }

  return {
    user: {
      name: sessionUser.name ?? sessionUser.email ?? "",
      email: sessionUser.email ?? "",
    },
    role: { id: roleId, label: rolePermissions[roleId].label },
    env: resolveEnv(process.env.NEXT_PUBLIC_APP_ENV),
    createActions: createActions
      .filter((a) => can(access, a.action, a.resource))
      .map(({ id, label, iconName, href }) => ({ id, label, iconName, href })),
    notifications: await listNotifications(),
  }
}
