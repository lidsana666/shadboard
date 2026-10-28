import type { Sprint } from "@/types/engineering"

const DAY_MS = 86_400_000

/** `part` as a percentage of `whole`; 0 when there is no whole. */
export const pct = (part: number, whole: number) =>
  whole === 0 ? 0 : (part / whole) * 100

/** Share of the sprint's calendar time elapsed at `nowMs`, 0-100. The end date is inclusive. */
export function sprintElapsed(sprint: Sprint, nowMs: number): number {
  const start = new Date(sprint.startDate).getTime()
  const end = new Date(sprint.endDate).getTime() + DAY_MS
  return Math.min(100, Math.max(0, pct(nowMs - start, end - start)))
}
