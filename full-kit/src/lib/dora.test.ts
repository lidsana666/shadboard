import { describe, expect, it } from "vitest"

import type { Deployment, Incident } from "@/types/engineering"

import {
  changeFailureRate,
  computeDora,
  deploymentFrequency,
  leadTimeHours,
  median,
  mttrHours,
  weekStart,
  weeklyCounts,
} from "@/lib/dora"

const DAY = 86_400_000
const ASOF = Date.UTC(2026, 9, 26, 12)

const dep = (over: Partial<Deployment>): Deployment => ({
  id: "d",
  serviceId: "s",
  teamId: "t",
  environment: "Production",
  version: "1.0.0",
  status: "Success",
  startedAt: new Date(ASOF - DAY).toISOString(),
  durationSec: 60,
  leadTimeHours: 10,
  deployedById: "e",
  ...over,
})

const inc = (hoursOpen: number | null): Incident => ({
  id: "i",
  title: "t",
  severity: "SEV-2",
  status: hoursOpen === null ? "Investigating" : "Resolved",
  serviceId: "s",
  teamId: "t",
  commanderId: "e",
  detectedAt: new Date(ASOF - 10 * DAY).toISOString(),
  resolvedAt:
    hoursOpen === null
      ? null
      : new Date(ASOF - 10 * DAY + hoursOpen * 3_600_000).toISOString(),
})

describe("median", () => {
  it("handles empty, odd and even inputs", () => {
    expect(median([])).toBe(0)
    expect(median([5, 1, 3])).toBe(3)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })
})

describe("deployment frequency", () => {
  it("counts only successful production deploys per day", () => {
    const ds = [
      dep({}),
      dep({}),
      dep({ environment: "Staging" }),
      dep({ status: "Failed" }),
    ]
    expect(deploymentFrequency(ds, 2)).toBe(1)
  })
})

describe("lead time", () => {
  it("is the median of successful production deploys", () => {
    const ds = [
      dep({ leadTimeHours: 4 }),
      dep({ leadTimeHours: 20 }),
      dep({ leadTimeHours: 8 }),
      dep({ leadTimeHours: 999, status: "Failed" }),
      dep({ leadTimeHours: 999, environment: "QA" }),
    ]
    expect(leadTimeHours(ds)).toBe(8)
  })
})

describe("change failure rate", () => {
  it("is failed plus rolled back over finished production deploys", () => {
    const ds = [
      dep({}),
      dep({}),
      dep({ status: "Failed" }),
      dep({ status: "Rolled Back" }),
      dep({ status: "In Progress" }),
      dep({ environment: "Staging", status: "Failed" }),
    ]
    expect(changeFailureRate(ds)).toBe(50)
  })

  it("is zero when nothing shipped", () => {
    expect(changeFailureRate([])).toBe(0)
  })
})

describe("MTTR", () => {
  it("averages resolved incidents and ignores open ones", () => {
    expect(mttrHours([inc(2), inc(4), inc(null)])).toBe(3)
    expect(mttrHours([inc(null)])).toBe(0)
  })
})

describe("computeDora", () => {
  it("only measures rows inside the window", () => {
    const old = dep({ startedAt: new Date(ASOF - 40 * DAY).toISOString() })
    const m = computeDora({
      deployments: [dep({}), old],
      incidents: [inc(6)],
      asOfMs: ASOF,
      days: 30,
    })
    expect(m.deploymentFrequency).toBeCloseTo(1 / 30, 2)
    expect(m.changeFailureRate).toBe(0)
    expect(m.mttrHours).toBe(6)
  })
})

describe("weekly bucketing", () => {
  it("starts weeks on Monday", () => {
    expect(weekStart(Date.UTC(2026, 9, 26))).toBe("2026-10-26")
    expect(weekStart(Date.UTC(2026, 10, 1))).toBe("2026-10-26")
  })

  it("returns every week oldest first, including empty ones", () => {
    const rows = [dep({}), dep({})]
    const out = weeklyCounts(rows, (d) => d.startedAt, ASOF, 3)
    expect(out.map((p) => p.date)).toEqual([
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
    ])
    expect(out.map((p) => p.value)).toEqual([0, 2, 0])
  })
})
