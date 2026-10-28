import type {
  Deployment,
  DoraMetrics,
  Incident,
  TrendPoint,
} from "@/types/engineering"

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000

const ms = (iso: string) => new Date(iso).getTime()

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const round = (n: number, digits = 1) => {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

/** Finished production deployments: the population DORA is measured on. */
export function productionDeploys(
  deployments: readonly Deployment[]
): Deployment[] {
  return deployments.filter(
    (d) => d.environment === "Production" && d.status !== "In Progress"
  )
}

/** Deployments (any status) whose start falls in [from, to). */
export function inWindow<T>(
  rows: readonly T[],
  at: (row: T) => string,
  fromMs: number,
  toMs: number
): T[] {
  return rows.filter((r) => {
    const t = ms(at(r))
    return t >= fromMs && t < toMs
  })
}

export function deploymentFrequency(
  deployments: readonly Deployment[],
  days: number
): number {
  const successful = productionDeploys(deployments).filter(
    (d) => d.status === "Success"
  )
  return round(successful.length / days, 2)
}

export function leadTimeHours(deployments: readonly Deployment[]): number {
  return round(
    median(
      productionDeploys(deployments)
        .filter((d) => d.status === "Success")
        .map((d) => d.leadTimeHours)
    )
  )
}

/** Percentage of finished production deployments that failed or were rolled back. */
export function changeFailureRate(deployments: readonly Deployment[]): number {
  const prod = productionDeploys(deployments)
  if (prod.length === 0) return 0
  const bad = prod.filter((d) => d.status !== "Success").length
  return round((bad / prod.length) * 100)
}

/** Mean hours from detection to resolution across resolved incidents. */
export function mttrHours(incidents: readonly Incident[]): number {
  const durations = incidents.flatMap((i) =>
    i.resolvedAt ? [(ms(i.resolvedAt) - ms(i.detectedAt)) / HOUR_MS] : []
  )
  if (durations.length === 0) return 0
  return round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

export interface DoraInput {
  deployments: readonly Deployment[]
  incidents: readonly Incident[]
  /** Window end (exclusive) as epoch ms. */
  asOfMs: number
  days: number
}

/** DORA metrics for the window [asOf - days, asOf). */
export function computeDora({
  deployments,
  incidents,
  asOfMs,
  days,
}: DoraInput): DoraMetrics {
  const from = asOfMs - days * DAY_MS
  const ds = inWindow(deployments, (d) => d.startedAt, from, asOfMs)
  const is = inWindow(incidents, (i) => i.detectedAt, from, asOfMs)
  return {
    deploymentFrequency: deploymentFrequency(ds, days),
    leadTimeHours: leadTimeHours(ds),
    changeFailureRate: changeFailureRate(ds),
    mttrHours: mttrHours(is),
  }
}

/** Start of the UTC week (Monday) containing `t`, as an ISO date. */
export function weekStart(t: number): string {
  const d = new Date(t)
  const dow = (d.getUTCDay() + 6) % 7
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow)
  )
    .toISOString()
    .slice(0, 10)
}

/** Buckets rows into the `weeks` most recent weeks ending at `asOfMs`, oldest first. */
export function weeklyCounts<T>(
  rows: readonly T[],
  at: (row: T) => string,
  asOfMs: number,
  weeks: number,
  include: (row: T) => boolean = () => true
): TrendPoint[] {
  const starts = Array.from({ length: weeks }, (_, i) =>
    weekStart(asOfMs - (weeks - 1 - i) * 7 * DAY_MS)
  )
  const counts = new Map(starts.map((s) => [s, 0]))
  for (const row of rows) {
    if (!include(row)) continue
    const key = weekStart(ms(at(row)))
    const current = counts.get(key)
    if (current !== undefined) counts.set(key, current + 1)
  }
  return starts.map((date) => ({ date, value: counts.get(date) ?? 0 }))
}
