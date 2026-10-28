import type { QualityDay } from "@/types/engineering"

import { DAY_MS, SEED_NOW, createRng } from "./prng"

const rng = createRng(6006)
const DAYS = 90

/** Daily CI samples, oldest first. */
export const quality: readonly QualityDay[] = Array.from(
  { length: DAYS },
  (_, i) => {
    const ms = SEED_NOW - (DAYS - 1 - i) * DAY_MS
    const weekend = [0, 6].includes(new Date(ms).getUTCDay())
    const builds = weekend ? rng.int(8, 20) : rng.int(55, 95)
    const tests = weekend ? rng.int(900, 1500) : rng.int(4200, 5200)
    return {
      date: new Date(ms).toISOString().slice(0, 10),
      builds,
      buildsPassed: Math.round(builds * (0.9 + rng.next() * 0.08)),
      tests,
      testsPassed: Math.round(tests * (0.97 + rng.next() * 0.027)),
    }
  }
)
