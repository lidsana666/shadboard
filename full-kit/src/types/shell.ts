import type { EnvId } from "@/configs/shell"
import type { Notification } from "@/services/notifications"
import type { DynamicIconNameType } from "@/types"
import type { RoleId } from "@/types/rbac"

export interface ShellCreateAction {
  id: string
  label: string
  iconName: DynamicIconNameType
  href: string
}

/** Everything the application shell needs from the server, already permission-filtered. */
export interface ShellData {
  user: { name: string; email: string }
  role: { id: RoleId; label: string }
  env: EnvId
  createActions: ShellCreateAction[]
  notifications: Notification[]
}
