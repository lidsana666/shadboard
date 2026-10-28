import { beforeEach, describe, expect, it, vi } from "vitest"

import type { can as canType } from "@/lib/rbac"
import type { AccessUser, Action, Resource } from "@/types/rbac"

import { teams } from "@/data/engineering"

import { getTeam, listTeamRows } from "./teams"

const auth = vi.hoisted(() => ({
  user: null as AccessUser | null,
  /** Resources hidden from the test user, on top of what their role lacks. */
  hidden: new Set<string>(),
}))

vi.mock("@/lib/rbac", async (importActual) => {
  const actual = await importActual<{ can: typeof canType }>()
  return {
    ...actual,
    can: (user: AccessUser | null | undefined, a: Action, r: Resource) =>
      !auth.hidden.has(r) && actual.can(user, a, r),
  }
})

vi.mock("./guard", async () => {
  const { ForbiddenError, can } = await import("@/lib/rbac")
  return {
    authorize: async (action: Action, resource: Resource) => {
      if (!auth.user || !can(auth.user, action, resource))
        throw new ForbiddenError(action, resource)
      return auth.user
    },
  }
})

beforeEach(() => {
  auth.user = { id: "u1", roleId: "cto" }
  auth.hidden.clear()
})

describe("listTeamRows", () => {
  it("returns one row per team with consistent figures", async () => {
    const rows = await listTeamRows()
    expect(rows).toHaveLength(teams.length)
    for (const r of rows) {
      expect(r.members).toBeGreaterThan(0)
      expect(r.load).toBe(Math.round((r.committed / r.capacity) * 100))
      expect(r.stack).toEqual([...r.stack].sort())
      expect(new Set(r.stack).size).toBe(r.stack.length)
      expect(r.critical).toBeLessThanOrEqual(r.open)
      expect(r.pace).not.toBeNull()
    }
  })

  it("is deterministic", async () => {
    expect(await listTeamRows()).toEqual(await listTeamRows())
  })

  it("is refused without permission", async () => {
    auth.user = null
    await expect(listTeamRows()).rejects.toThrow()
  })
})

describe("getTeam", () => {
  it("returns null for an unknown id", async () => {
    expect(await getTeam("nope")).toBeNull()
  })

  it("builds every section for a full-access role", async () => {
    const page = await getTeam(teams[0].id)
    expect(page).not.toBeNull()
    const { detail: d, access } = page!
    expect(access).toEqual({
      repositories: true,
      deployments: true,
      incidents: true,
    })
    expect(d.summary.id).toBe(teams[0].id)
    expect(d.members.length).toBe(
      d.summary.members + d.members.filter((m) => !m.active).length
    )
    expect(d.members.some((m) => m.roles.length > 0)).toBe(true)
    expect(d.projects.length).toBeGreaterThan(0)
    expect(d.repos.length).toBe(d.summary.repos)
    expect(d.kpis.length).toBeGreaterThan(0)
    expect(d.outcomes.length).toBeGreaterThan(0)
    expect(d.docs.length).toBeGreaterThan(0)
  })

  it("orders sprints newest first and velocity oldest first", async () => {
    const d = (await getTeam(teams[0].id))!.detail
    const starts = d.sprints.map((s) => s.startDate)
    expect(starts).toEqual([...starts].sort().reverse())
    expect(d.sprints.every((s) => s.status !== "Planned")).toBe(true)
    expect(d.velocity.map((v) => v.sprint)).toEqual(
      d.sprints.map((s) => s.name).reverse()
    )
  })

  it("keeps only this team's records", async () => {
    const d = (await getTeam(teams[1].id))!.detail
    const id = teams[1].id
    expect(d.members.every((m) => m.teamId === id)).toBe(true)
    expect(d.projects.every((p) => p.teamId === id)).toBe(true)
    expect(d.services.every((s) => s.teamId === id)).toBe(true)
    expect(d.incidents.every((i) => i.teamId === id)).toBe(true)
  })

  it("empties exactly the sections the role may not see", async () => {
    auth.hidden = new Set(["repositories", "incidents"])
    const { detail: d, access } = (await getTeam(teams[0].id))!
    expect(access).toEqual({
      repositories: false,
      deployments: true,
      incidents: false,
    })
    expect(d.repos).toEqual([])
    expect(d.incidents).toEqual([])
    expect(d.outcomes.length).toBeGreaterThan(0)
    expect(d.summary.repos).toBe(0)
    expect(d.summary.open).toBe(0)
  })

  it("is refused without a user", async () => {
    auth.user = null
    await expect(getTeam(teams[0].id)).rejects.toThrow()
  })
})
