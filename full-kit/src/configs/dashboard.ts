import type { Tone } from "@/configs/tokens"
import type { IncidentSeverity } from "@/types/engineering"

import { chartSeries, toneColor } from "@/configs/tokens"

/** Everything the executive dashboard says or decides, as data. */
export const dashboardCopy = {
  title: "Engineering overview",
  description:
    "Delivery, reliability and capacity across all teams. Delivery metrics cover the last 30 days.",
  sections: {
    kpis: "Key metrics",
    trends: "Trends",
    panels: "Delivery health",
    activity: "Recent activity",
  },
  comparison: "vs previous 30 days",
  noPermission: {
    deployments: "You do not have access to deployments.",
    incidents: "You do not have access to incidents.",
  },
  empty: {
    deployments: "No deployments recorded yet.",
    incidents: "No incidents recorded.",
    sprints: "No sprints are active.",
    releases: "No upcoming releases.",
    risks: "No open risks.",
    services: "No tier 1 services.",
    teams: "No teams yet.",
    chart: "No data for this period.",
  },
} as const

export const kpiToneLabel: Record<Tone, string | null> = {
  neutral: null,
  info: null,
  success: "On target",
  warning: "Watch",
  danger: "Off target",
}

/** Severities that count as critical in incident charts and team health. */
export const criticalSeverities: readonly IncidentSeverity[] = [
  "SEV-1",
  "SEV-2",
]

/**
 * Sprint pacing: how far completed work may trail elapsed time (percentage
 * points) before the sprint is flagged.
 */
export const sprintPacing = { warnGap: 10, dangerGap: 25 } as const

export function sprintPaceTone(elapsed: number, completion: number): Tone {
  const gap = elapsed - completion
  if (gap <= sprintPacing.warnGap) return "success"
  return gap <= sprintPacing.dangerGap ? "warning" : "danger"
}

/** Availability below the SLO is a warning within `warnMargin` points, otherwise danger. */
export const sloMargin = { warnMargin: 0.1 } as const

export function sloTone(availability: number, target: number): Tone {
  if (availability >= target) return "success"
  return target - availability <= sloMargin.warnMargin ? "warning" : "danger"
}

export interface SeriesDef<K extends string> {
  key: K
  label: string
  color: string
  kind?: "bar" | "line" | "area"
  /** Stack series that share a value. */
  stackId?: string
  /** `right` uses a second value axis (for series with a different unit). */
  axis?: "left" | "right"
}

export interface ChartSpec<K extends string> {
  id: string
  title: string
  description: string
  xKey: K
  xType: "date" | "category"
  /** `vertical` draws horizontal bars with the category on the left. */
  layout?: "horizontal" | "vertical"
  height?: number
  series: SeriesDef<K>[]
}

export const defineChart = <K extends string>(spec: ChartSpec<K>) => spec

export const deliveryChart = defineChart({
  id: "delivery",
  title: "Delivery trend",
  description: "Weekly production deployments and median lead time",
  xKey: "date",
  xType: "date",
  series: [
    {
      key: "deployments",
      label: "Production deployments",
      color: chartSeries[0],
      kind: "bar",
    },
    {
      key: "leadTime",
      label: "Median lead time (h)",
      color: chartSeries[2],
      kind: "line",
      axis: "right",
    },
  ],
})

export const deploymentChart = defineChart({
  id: "deployments",
  title: "Deployment outcomes",
  description: "Weekly deployments by result, all environments",
  xKey: "date",
  xType: "date",
  series: [
    {
      key: "success",
      label: "Succeeded",
      color: toneColor.success,
      kind: "bar",
      stackId: "outcome",
    },
    {
      key: "failed",
      label: "Failed",
      color: toneColor.danger,
      kind: "bar",
      stackId: "outcome",
    },
    {
      key: "rolledBack",
      label: "Rolled back",
      color: toneColor.warning,
      kind: "bar",
      stackId: "outcome",
    },
  ],
})

export const incidentChart = defineChart({
  id: "incidents",
  title: "Incident trend",
  description: "Incidents detected per week, by severity group",
  xKey: "date",
  xType: "date",
  series: [
    {
      key: "critical",
      label: "SEV-1 and SEV-2",
      color: toneColor.danger,
      kind: "area",
      stackId: "sev",
    },
    {
      key: "other",
      label: "SEV-3 and SEV-4",
      color: chartSeries[0],
      kind: "area",
      stackId: "sev",
    },
  ],
})

export const capacityChart = defineChart({
  id: "capacity",
  title: "Team capacity",
  description: "Story points: capacity, committed and completed this sprint",
  xKey: "team",
  xType: "category",
  layout: "vertical",
  height: 340,
  series: [
    { key: "capacity", label: "Capacity", color: chartSeries[3], kind: "bar" },
    {
      key: "committed",
      label: "Committed",
      color: chartSeries[0],
      kind: "bar",
    },
    {
      key: "completed",
      label: "Completed",
      color: chartSeries[1],
      kind: "bar",
    },
  ],
})
