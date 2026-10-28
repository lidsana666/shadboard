import { describe, expect, it } from "vitest"

import { INCIDENT_STATUSES, PROJECT_STATUSES } from "@/types/engineering"

import {
  SEED_NOW,
  deployments,
  incidents,
  projects,
  quality,
  services,
  sprints,
  teams,
} from "@/data/engineering"

import { computeDora } from "@/lib/dora"

describe("seed data", () => {
  it("is large and internally consistent", () => {
    expect(deployments.length).toBeGreaterThanOrEqual(200)
    const serviceIds = new Set(services.map((s) => s.id))
    const teamIds = new Set(teams.map((t) => t.id))
    for (const d of deployments) {
      expect(serviceIds.has(d.serviceId)).toBe(true)
      expect(teamIds.has(d.teamId)).toBe(true)
    }
    for (const i of incidents) expect(INCIDENT_STATUSES).toContain(i.status)
    expect(new Set(deployments.map((d) => d.id)).size).toBe(deployments.length)
    expect(new Set(projects.map((p) => p.status))).toEqual(
      new Set(PROJECT_STATUSES)
    )
    expect(quality).toHaveLength(90)
    expect(sprints.filter((s) => s.status === "Active")).toHaveLength(
      teams.length
    )
  })

  it("yields realistic DORA numbers", () => {
    const m = computeDora({
      deployments,
      incidents,
      asOfMs: SEED_NOW,
      days: 30,
    })
    expect(m.deploymentFrequency).toBeGreaterThan(0.3)
    expect(m.changeFailureRate).toBeGreaterThan(2)
    expect(m.changeFailureRate).toBeLessThan(25)
    expect(m.mttrHours).toBeGreaterThan(0.5)
  })
})
