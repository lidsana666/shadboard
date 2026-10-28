import type { Action, Resource, RoleId } from "@/types/rbac"

type Grants = Partial<Record<Resource, readonly Action[]>>

export interface RoleDefinition {
  label: string
  grants: Grants
}

const R = ["view"] as const
const RW = ["view", "create", "edit"] as const
const RWA = ["view", "create", "edit", "approve"] as const
const CRUD = ["view", "create", "edit", "delete"] as const

/** Resources every signed-in role can read (the read-only baseline). */
const baseline: Grants = {
  dashboard: R,
  projects: R,
  sprints: R,
  releases: R,
  services: R,
}

const withBase = (extra: Grants): Grants => ({ ...baseline, ...extra })

/** Executive leadership: broad visibility plus approval authority. */
const leadership = withBase({
  organization: R,
  deployments: R,
  repositories: R,
  incidents: R,
  security: R,
  audit: R,
  users: R,
  projects: RWA,
  sprints: R,
  releases: RWA,
})

/**
 * Role -> resource -> actions. This is the only place permissions are defined;
 * `can()` in `lib/rbac.ts` reads it and nothing else.
 */
export const rolePermissions: Readonly<Record<RoleId, RoleDefinition>> = {
  super_admin: {
    label: "Super Admin",
    grants: Object.fromEntries(
      (
        [
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
      ).map((r) => [
        r,
        [
          "view",
          "create",
          "edit",
          "delete",
          "approve",
          "deploy",
          "manage_users",
          "manage_roles",
          "manage_settings",
        ] as const,
      ])
    ),
  },
  org_admin: {
    label: "Organization Admin",
    grants: withBase({
      organization: CRUD,
      users: ["view", "create", "edit", "delete", "manage_users"],
      roles: ["view", "edit", "manage_roles"],
      settings: ["view", "edit", "manage_settings"],
      audit: R,
      deployments: R,
      repositories: R,
      incidents: R,
      security: R,
    }),
  },
  cto: {
    label: "CTO",
    grants: {
      ...leadership,
      deployments: ["view", "approve"],
      incidents: ["view", "edit"],
      security: ["view", "approve"],
      organization: ["view", "edit"],
    },
  },
  vp_engineering: {
    label: "VP Engineering",
    grants: {
      ...leadership,
      deployments: ["view", "approve"],
      incidents: ["view", "edit"],
    },
  },
  engineering_director: {
    label: "Engineering Director",
    grants: {
      ...leadership,
      deployments: ["view", "approve"],
      incidents: R,
      users: [],
      audit: [],
    },
  },
  engineering_manager: {
    label: "Engineering Manager",
    grants: withBase({
      projects: RW,
      sprints: RW,
      releases: RW,
      deployments: R,
      repositories: R,
      incidents: RW,
      organization: R,
    }),
  },
  tech_lead: {
    label: "Tech Lead",
    grants: withBase({
      projects: RW,
      sprints: RW,
      releases: ["view", "create", "edit", "approve"],
      deployments: R,
      repositories: RW,
      incidents: RW,
    }),
  },
  engineer: {
    label: "Engineer",
    grants: withBase({
      deployments: R,
      repositories: R,
      incidents: ["view", "create"],
    }),
  },
  qa: {
    label: "QA",
    grants: withBase({
      releases: ["view", "approve"],
      deployments: R,
      repositories: R,
      incidents: ["view", "create"],
    }),
  },
  devops: {
    label: "DevOps",
    grants: withBase({
      releases: RW,
      deployments: ["view", "create", "edit", "deploy"],
      repositories: RW,
      incidents: RW,
      security: R,
    }),
  },
  sre: {
    label: "SRE",
    grants: withBase({
      deployments: ["view", "deploy"],
      repositories: R,
      incidents: CRUD,
      services: RW,
      security: R,
    }),
  },
  security: {
    label: "Security",
    grants: withBase({
      deployments: R,
      repositories: R,
      incidents: RW,
      security: ["view", "create", "edit", "delete", "approve"],
      audit: R,
    }),
  },
  viewer: {
    label: "Viewer",
    grants: baseline,
  },
}

/** Role assigned when an account has no explicit mapping: least privilege. */
export const fallbackRole: RoleId = "viewer"
