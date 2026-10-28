import { expect, it } from "vitest"

import { uniq } from "@/lib/uniq"

it("returns sorted distinct values of a key", () => {
  const rows = [{ k: "b" }, { k: "a" }, { k: "b" }]
  expect(uniq(rows, "k")).toEqual(["a", "b"])
})
