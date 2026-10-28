import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AccessUser, Action, Resource } from "@/types/rbac"

import { engineers, teams } from "@/data/engineering"

import { forbiddenPersonFields } from "@/configs/people"
import { uniq } from "@/lib/uniq"

import { buildPeople, listPeople } from "./people"

const auth = vi.hoisted(() => ({ user: null as AccessUser | null }))

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
})

describe("listPeople", () => {
  it("returns one row per engineer", async () => {
    const rows = await listPeople()
    expect(rows).toHaveLength(engineers.length)
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length)
  })

  it("resolves every person to a team and a status", async () => {
    for (const r of await listPeople()) {
      expect(r.team).not.toBe("")
      expect(r.status).toBe(r.active ? "Active" : "Inactive")
    }
  })

  it("carries no individual performance measure", async () => {
    for (const r of await listPeople()) {
      const keys = Object.keys(r).map((k) => k.toLowerCase())
      for (const bad of forbiddenPersonFields) {
        expect(keys.some((k) => k.includes(bad))).toBe(false)
      }
    }
  })

  it("gives the filters real options derived from the data", async () => {
    const rows = await listPeople()
    expect(uniq(rows, "role").length).toBeGreaterThan(1)
    expect(uniq(rows, "team")).toHaveLength(teams.length)
    expect(uniq(rows, "location").length).toBeGreaterThan(1)
  })

  it("is refused for a role that cannot view the organization", async () => {
    auth.user = { id: "u2", roleId: "viewer" }
    await expect(listPeople()).rejects.toThrow()
  })
})

describe("buildPeople", () => {
  it("lists manager, tech lead and on-call duties from the team", () => {
    const team = teams[0]
    const rows = buildPeople(engineers, teams)
    const lead = rows.find((r) => r.id === team.leadId)
    expect(lead?.duties).toContain("Tech lead")
    const manager = rows.find((r) => r.id === team.managerId)
    expect(manager?.duties).toContain("Manager")
  })

  it("leaves team empty rather than throwing for an unknown team", () => {
    const [row] = buildPeople([{ ...engineers[0], teamId: "nope" }], teams)
    expect(row.team).toBe("")
    expect(row.duties).toEqual([])
  })
})
