import type { Sprint } from "@/types/engineering"

import { createRng } from "./prng"
import { teams } from "./teams"

const rng = createRng(5005)

/** Two completed two-week sprints and one active sprint per team. */
export const sprints: readonly Sprint[] = teams.flatMap((team, t) => {
  const n = 40 + t
  const make = (
    seq: number,
    status: Sprint["status"],
    startDate: string,
    endDate: string,
    ratio: readonly [number, number]
  ): Sprint => {
    const committed = Math.round(team.capacity * (0.82 + rng.next() * 0.16))
    const added = rng.int(0, 6)
    const removed = rng.int(0, 4)
    return {
      id: `spr-${team.id.replace("team-", "")}-${seq}`,
      name: `Sprint ${seq}`,
      teamId: team.id,
      status,
      startDate,
      endDate,
      committed,
      completed: Math.round(
        committed * (ratio[0] + rng.next() * (ratio[1] - ratio[0]))
      ),
      added,
      removed,
    }
  }
  return [
    make(n - 2, "Completed", "2026-09-21", "2026-10-04", [0.72, 1]),
    make(n - 1, "Completed", "2026-10-05", "2026-10-18", [0.72, 1]),
    make(n, "Active", "2026-10-19", "2026-11-01", [0.3, 0.62]),
  ]
})
