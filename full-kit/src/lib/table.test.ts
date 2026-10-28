import { describe, expect, it } from "vitest"

import {
  compareValues,
  filterRows,
  nextSort,
  paginate,
  searchRows,
  sortRows,
} from "./table"

const rows = [
  { name: "Beta", n: 10, dept: "A" },
  { name: "alpha", n: 2, dept: "B" },
  { name: "Gamma 2", n: 7, dept: "A" },
  { name: "Gamma 10", n: 7, dept: "B" },
]

describe("nextSort", () => {
  it("cycles asc, desc, none and restarts on a new column", () => {
    const a = nextSort(null, "x")
    expect(a).toEqual({ id: "x", dir: "asc" })
    const b = nextSort(a, "x")
    expect(b).toEqual({ id: "x", dir: "desc" })
    expect(nextSort(b, "x")).toBeNull()
    expect(nextSort(b, "y")).toEqual({ id: "y", dir: "asc" })
  })
})

describe("sortRows", () => {
  it("sorts numbers numerically and text naturally, without mutating", () => {
    expect(sortRows(rows, (r) => r.n, "asc").map((r) => r.n)).toEqual([
      2, 7, 7, 10,
    ])
    expect(sortRows(rows, (r) => r.n, "desc")[0].n).toBe(10)
    expect(sortRows(rows, (r) => r.name, "asc").map((r) => r.name)).toEqual([
      "alpha",
      "Beta",
      "Gamma 2",
      "Gamma 10",
    ])
    expect(rows[0].name).toBe("Beta")
  })

  it("is stable for equal keys", () => {
    const out = sortRows(rows, (r) => r.n, "asc").filter((r) => r.n === 7)
    expect(out.map((r) => r.name)).toEqual(["Gamma 2", "Gamma 10"])
  })

  it("compares mixed values as text", () => {
    expect(compareValues(1, 2)).toBeLessThan(0)
    expect(compareValues("a", "b")).toBeLessThan(0)
  })
})

describe("searchRows and filterRows", () => {
  it("matches case-insensitively on any field and ignores blank queries", () => {
    expect(searchRows(rows, "ALPH", (r) => [r.name])).toHaveLength(1)
    expect(searchRows(rows, "  ", (r) => [r.name])).toHaveLength(4)
    expect(searchRows(rows, "zzz", (r) => [r.name])).toHaveLength(0)
  })

  it("requires every filter to match", () => {
    expect(filterRows(rows, [])).toHaveLength(4)
    expect(filterRows(rows, [{ key: "dept", value: "A" }])).toHaveLength(2)
    expect(
      filterRows(rows, [
        { key: "dept", value: "A" },
        { key: "n", value: "7" },
      ])
    ).toHaveLength(1)
  })
})

describe("paginate", () => {
  it("slices, reports the range and clamps the page", () => {
    const p = paginate(rows, 1, 3)
    expect(p).toMatchObject({ pages: 2, total: 4, from: 4, to: 4, page: 1 })
    expect(p.rows).toHaveLength(1)
    expect(paginate(rows, 9, 3).page).toBe(1)
    expect(paginate(rows, -2, 3).page).toBe(0)
  })

  it("handles an empty list", () => {
    expect(paginate([], 0, 5)).toMatchObject({
      rows: [],
      pages: 1,
      total: 0,
      from: 0,
      to: 0,
    })
  })
})
