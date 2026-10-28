import type { Tone } from "@/configs/tokens"
import type { NotificationCategory } from "@/services/notifications"
import type { SearchHit } from "@/services/search"
import type { DynamicIconNameType } from "@/types"
import type { Action, Resource } from "@/types/rbac"

export const appName = "Engineering Platform"

export const ENV_IDS = ["development", "staging", "production"] as const
export type EnvId = (typeof ENV_IDS)[number]

/** Environment indicator shown in the header. */
export const environments: Readonly<
  Record<EnvId, { label: string; tone: Tone }>
> = {
  development: { label: "Development", tone: "info" },
  staging: { label: "Staging", tone: "warning" },
  production: { label: "Production", tone: "danger" },
}

export function resolveEnv(value: string | undefined): EnvId {
  return ENV_IDS.find((id) => id === value) ?? "development"
}

export interface CreateActionDefinition {
  id: string
  label: string
  iconName: DynamicIconNameType
  /** Destination must be a working page; extend this list as modules ship. */
  href: string
  action: Action
  resource: Resource
}

/** Entries in the header Create menu. Shown only when `can(user, action, resource)`. */
export const createActions: readonly CreateActionDefinition[] = [
  {
    id: "task",
    label: "New task",
    iconName: "ListTodo",
    href: "/apps/kanban",
    action: "create",
    resource: "projects",
  },
  {
    id: "event",
    label: "New event",
    iconName: "CalendarPlus",
    href: "/apps/calendar",
    action: "create",
    resource: "sprints",
  },
]

export const notificationCategoryMeta: Readonly<
  Record<NotificationCategory, { iconName: DynamicIconNameType; tone: Tone }>
> = {
  Deployment: { iconName: "Rocket", tone: "danger" },
  Incident: { iconName: "Siren", tone: "danger" },
  Approval: { iconName: "BadgeCheck", tone: "info" },
  Sprint: { iconName: "Timer", tone: "neutral" },
  Security: { iconName: "ShieldAlert", tone: "warning" },
  System: { iconName: "Settings", tone: "neutral" },
}

export const searchKindIcons: Readonly<
  Record<SearchHit["kind"], DynamicIconNameType>
> = {
  Project: "FolderKanban",
  Service: "Server",
  Team: "Users",
  Engineer: "User",
  Repository: "GitBranch",
  Incident: "Siren",
}

export const shellLimits = {
  recents: 5,
  searchMinChars: 2,
  searchDebounceMs: 200,
} as const

export const shellStorageKeys = {
  favorites: "shell:favorites",
  recents: "shell:recents",
  readNotifications: "shell:read-notifications",
} as const
