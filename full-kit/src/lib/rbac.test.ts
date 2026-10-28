import { describe, expect, it } from "vitest"

import type { RoleId } from "@/types/rbac"
import { ACTIONS, RESOURCES, ROLE_IDS } from "@/types/rbac"

import { rolePermissions } from "@/configs/rbac"
import { ForbiddenError, assertCan, can } from "@/lib/rbac"

const as = (roleId: RoleId) => ({ id: "u1", roleId })

describe("can()", () => {
  it("denies everything without a user", () => {
    expect(can(null, "view", "dashboard")).toBe(false)
    expect(can(undefined, "view", "dashboard")).toBe(false)
  })

  it("gives super admin every action on every resource", () => {
    for (const r of RESOURCES)
      for (const a of ACTIONS) expect(can(as("super_admin"), a, r)).toBe(true)
  })

  it("lets only role administrators manage users, roles and settings", () => {
    for (const roleId of ROLE_IDS) {
      const admin = roleId === "super_admin" || roleId === "org_admin"
      expect(can(as(roleId), "manage_users", "users")).toBe(admin)
      expect(can(as(roleId), "manage_roles", "roles")).toBe(admin)
      expect(can(as(roleId), "manage_settings", "settings")).toBe(admin)
    }
  })

  it("keeps the viewer read-only on the baseline resources", () => {
    const v = as("viewer")
    expect(can(v, "view", "dashboard")).toBe(true)
    expect(can(v, "view", "projects")).toBe(true)
    expect(can(v, "view", "incidents")).toBe(false)
    expect(can(v, "view", "users")).toBe(false)
    for (const r of RESOURCES)
      for (const a of ACTIONS)
        if (a !== "view") expect(can(v, a, r)).toBe(false)
  })

  it("grants deploy only to devops, sre and super admin", () => {
    const deployers = ROLE_IDS.filter((id) =>
      can(as(id), "deploy", "deployments")
    )
    expect(deployers).toEqual(["super_admin", "devops", "sre"])
  })

  it("lets qa approve releases but not edit projects", () => {
    expect(can(as("qa"), "approve", "releases")).toBe(true)
    expect(can(as("qa"), "edit", "projects")).toBe(false)
  })

  it("restricts security approvals to security leadership", () => {
    expect(can(as("security"), "approve", "security")).toBe(true)
    expect(can(as("engineer"), "view", "security")).toBe(false)
  })

  it("defines every role, with only known resources and actions", () => {
    expect(Object.keys(rolePermissions).sort()).toEqual([...ROLE_IDS].sort())
    for (const def of Object.values(rolePermissions))
      for (const [resource, actions] of Object.entries(def.grants)) {
        expect(RESOURCES).toContain(resource)
        for (const a of actions) expect(ACTIONS).toContain(a)
      }
  })
})

describe("assertCan()", () => {
  it("throws ForbiddenError when denied and passes when allowed", () => {
    expect(() => assertCan(as("viewer"), "delete", "projects")).toThrow(
      ForbiddenError
    )
    expect(() => assertCan(as("cto"), "view", "dashboard")).not.toThrow()
    expect(() => assertCan(null, "view", "dashboard")).toThrow(ForbiddenError)
  })
})
