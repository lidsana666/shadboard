/** Deterministic pseudo-random helpers so seed data is identical on every run. */

/** Reference "now" for all seed data (UTC). */
export const SEED_NOW = Date.UTC(2026, 9, 26, 12, 0, 0)
export const DAY_MS = 86_400_000
export const HOUR_MS = 3_600_000

export function createRng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) =>
    Math.floor(next() * (max - min + 1)) + min
  const pick = <T>(items: readonly T[]): T => items[int(0, items.length - 1)]
  const weighted = <T>(items: readonly (readonly [T, number])[]): T => {
    const total = items.reduce((sum, [, w]) => sum + w, 0)
    let r = next() * total
    for (const [item, w] of items) {
      r -= w
      if (r < 0) return item
    }
    return items[items.length - 1][0]
  }
  return { next, int, pick, weighted }
}

export function isoAt(ms: number): string {
  return new Date(ms).toISOString()
}
