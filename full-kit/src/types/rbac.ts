export const ROLE_IDS = [
  "super_admin",
  "org_admin",
  "cto",
  "vp_engineering",
  "engineering_director",
  "engineering_manager",
  "tech_lead",
  "engineer",
  "qa",
  "devops",
  "sre",
  "security",
  "viewer",
] as const
export type RoleId = (typeof ROLE_IDS)[number]

export const ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "deploy",
  "manage_users",
  "manage_roles",
  "manage_settings",
] as const
export type Action = (typeof ACTIONS)[number]

export const RESOURCES = [
  "dashboard",
  "organization",
  "projects",
  "sprints",
  "releases",
  "deployments",
  "services",
  "repositories",
  "incidents",
  "security",
  "users",
  "roles",
  "settings",
  "audit",
] as const
export type Resource = (typeof RESOURCES)[number]

/** Minimal identity needed for authorization decisions. */
export interface AccessUser {
  id: string
  roleId: RoleId
}
