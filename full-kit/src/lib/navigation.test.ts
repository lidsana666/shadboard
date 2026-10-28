import { describe, expect, it } from "vitest"

import { navigationsData } from "@/data/navigations"

import { resolveEnv } from "@/configs/shell"
import { findNavEntry, flattenNav, stripLocale } from "@/lib/navigation"

describe("navigation", () => {
  const entries = flattenNav(navigationsData)

  it("flattens every linkable item with a unique href per entry", () => {
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.every((e) => e.href.startsWith("/"))).toBe(true)
  })

  it("exposes the engineering dashboard", () => {
    expect(findNavEntry(entries, "/dashboards/engineering")?.title).toBe(
      "Dashboard"
    )
  })

  it("returns undefined for unlisted pages", () => {
    expect(findNavEntry(entries, "/nope/nothing")).toBeUndefined()
  })

  it("strips the locale segment", () => {
    expect(stripLocale("/en/apps/chat")).toBe("/apps/chat")
  })
})

describe("resolveEnv", () => {
  it("accepts known environments and defaults otherwise", () => {
    expect(resolveEnv("production")).toBe("production")
    expect(resolveEnv("staging")).toBe("staging")
    expect(resolveEnv(undefined)).toBe("development")
    expect(resolveEnv("bogus")).toBe("development")
  })
})
