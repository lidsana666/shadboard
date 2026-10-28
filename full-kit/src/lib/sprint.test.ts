import { describe, expect, it } from "vitest"

import type { Sprint } from "@/types/engineering"

import { pct, sprintElapsed } from "./sprint"

const sprint = (startDate: string, endDate: string): Sprint => ({
  id: "s",
  teamId: "t",
  name: "S1",
  status: "Active",
  startDate,
  endDate,
  committed: 10,
  completed: 5,
  added: 0,
  removed: 0,
})

describe("pct", () => {
  it("is a percentage and 0 for an empty whole", () => {
    expect(pct(1, 4)).toBe(25)
    expect(pct(3, 0)).toBe(0)
  })
})

describe("sprintElapsed", () => {
  const s = sprint("2026-10-01", "2026-10-10")
  it("clamps before the start and after the end", () => {
    expect(sprintElapsed(s, Date.parse("2026-09-01"))).toBe(0)
    expect(sprintElapsed(s, Date.parse("2026-12-01"))).toBe(100)
  })
  it("counts the end date as inclusive", () => {
    expect(sprintElapsed(s, Date.parse("2026-10-06"))).toBe(50)
  })
})
