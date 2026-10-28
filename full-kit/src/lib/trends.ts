import type { Deployment, Incident } from "@/types/engineering"

import { criticalSeverities } from "@/configs/dashboard"

import { weeklyCounts } from "./dora"

/** Weekly deployments by result (all environments), oldest week first. */
export function outcomeTrend(
  deployments: readonly Deployment[],
  asOfMs: number,
  weeks: number
) {
  const by = (status: Deployment["status"]) =>
    weeklyCounts(
      deployments,
      (d) => d.startedAt,
      asOfMs,
      weeks,
      (d) => d.status === status
    )
  const failed = by("Failed")
  const rolledBack = by("Rolled Back")
  return by("Success").map((p, i) => ({
    date: p.date,
    success: p.value,
    failed: failed[i].value,
    rolledBack: rolledBack[i].value,
  }))
}

/** Weekly incidents split into critical and other severities, oldest week first. */
export function severityTrend(
  incidents: readonly Incident[],
  asOfMs: number,
  weeks: number
) {
  const at = (i: Incident) => i.detectedAt
  const critical = weeklyCounts(incidents, at, asOfMs, weeks, (i) =>
    criticalSeverities.includes(i.severity)
  )
  return weeklyCounts(incidents, at, asOfMs, weeks).map((p, i) => ({
    date: p.date,
    critical: critical[i].value,
    other: p.value - critical[i].value,
  }))
}
