import { describe, expect, it } from "vitest"

import { forbiddenPersonFields, peopleColumns, peopleFilters } from "./people"

describe("people config", () => {
  it("has exactly one primary column", () => {
    expect(
      peopleColumns.filter((c) => "primary" in c && c.primary)
    ).toHaveLength(1)
  })

  it("filters by role, team and location", () => {
    expect(peopleFilters.map((f) => f.key)).toEqual([
      "role",
      "team",
      "location",
    ])
  })

  it("shows no individual performance column", () => {
    for (const c of peopleColumns) {
      for (const bad of forbiddenPersonFields) {
        expect(c.id.toLowerCase()).not.toContain(bad)
        expect(c.header.toLowerCase()).not.toContain(bad)
      }
    }
  })
})
