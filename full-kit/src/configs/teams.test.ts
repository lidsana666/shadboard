import { describe, expect, it } from "vitest"

import {
  capacityLoad,
  healthRank,
  incidentTone,
  loadTone,
  teamHealth,
} from "./teams"

describe("loadTone", () => {
  it("is calm up to the warn threshold, then warns, then flags danger", () => {
    expect(loadTone(capacityLoad.warnAbove)).toBe("success")
    expect(loadTone(capacityLoad.warnAbove + 1)).toBe("warning")
    expect(loadTone(capacityLoad.dangerAbove)).toBe("warning")
    expect(loadTone(capacityLoad.dangerAbove + 1)).toBe("danger")
  })
})

describe("incidentTone", () => {
  it("prioritises critical over merely open incidents", () => {
    expect(incidentTone(0, 0)).toBe("success")
    expect(incidentTone(2, 0)).toBe("warning")
    expect(incidentTone(2, 1)).toBe("danger")
  })
})

describe("teamHealth", () => {
  it("is as bad as the worst signal", () => {
    expect(teamHealth([])).toBe("On Track")
    expect(teamHealth(["success", "info", "neutral"])).toBe("On Track")
    expect(teamHealth(["success", "warning"])).toBe("At Risk")
    expect(teamHealth(["warning", "danger", "success"])).toBe("Off Track")
  })
})

describe("healthRank", () => {
  it("orders best first", () => {
    expect(healthRank("On Track")).toBeLessThan(healthRank("At Risk"))
    expect(healthRank("At Risk")).toBeLessThan(healthRank("Off Track"))
  })
})
