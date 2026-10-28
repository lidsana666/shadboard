import { describe, expect, it } from "vitest"

import { sloTone, sprintPaceTone } from "@/configs/dashboard"

import { formatMetric, formatSeconds, percentChange } from "./format"

describe("format", () => {
  it("formats metrics with fixed digits", () => {
    expect(formatMetric(1234.5, 1)).toBe("1,234.5")
    expect(formatMetric(3, 2)).toBe("3.00")
  })

  it("computes percent change and refuses unusable baselines", () => {
    expect(percentChange(110, 100)).toBeCloseTo(10)
    expect(percentChange(50, 100)).toBeCloseTo(-50)
    expect(percentChange(5, null)).toBeNull()
    expect(percentChange(5, 0)).toBeNull()
  })

  it("formats durations", () => {
    expect(formatSeconds(125)).toBe("2m 05s")
    expect(formatSeconds(3700)).toBe("1h 01m")
  })
})

describe("dashboard rules", () => {
  it("flags sprint pacing by gap", () => {
    expect(sprintPaceTone(50, 45)).toBe("success")
    expect(sprintPaceTone(50, 35)).toBe("warning")
    expect(sprintPaceTone(60, 20)).toBe("danger")
  })

  it("flags availability against SLO", () => {
    expect(sloTone(99.95, 99.9)).toBe("success")
    expect(sloTone(99.85, 99.9)).toBe("warning")
    expect(sloTone(99.0, 99.9)).toBe("danger")
  })
})
