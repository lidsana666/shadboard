import type { Tone } from "@/configs/tokens"
import type { HealthLevel } from "@/types/engineering"

import { defineChart } from "@/configs/dashboard"
import { chartSeries } from "@/configs/tokens"

/** Everything the team pages say or decide, as data. */
export const teamsCopy = {
  list: {
    title: "Teams",
    description:
      "Ownership, capacity and delivery health for every engineering team.",
    caption: "Engineering teams",
    search: "Search teams, people or stack",
    searchLabel: "Search teams",
    empty: "No teams match the current search and filters.",
    none: "No teams yet.",
  },
  detail: {
    back: "All teams",
    tabs: "Team sections",
    notAllowed: {
      repositories: "You do not have access to repositories.",
      deployments: "You do not have access to deployments.",
      incidents: "You do not have access to incidents.",
    },
    empty: {
      members: "This team has no members.",
      projects: "This team owns no projects.",
      services: "This team owns no services.",
      repositories: "This team owns no repositories.",
      roadmap: "Nothing is scheduled on the roadmap.",
      releases: "No releases are planned for this team's projects.",
      sprints: "This team has no sprints yet.",
      incidents: "This team has no incidents on record.",
      docs: "No documentation has been written for this team.",
      chart: "No data for this period.",
    },
  },
} as const

export const teamTabs = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "repositories", label: "Repositories" },
  { id: "roadmap", label: "Roadmap" },
  { id: "sprint", label: "Sprint" },
  { id: "performance", label: "Performance" },
  { id: "incidents", label: "Incidents" },
  { id: "docs", label: "Documentation" },
] as const
export type TeamTabId = (typeof teamTabs)[number]["id"]

export interface ColumnDef {
  id: string
  header: string
  align?: "end"
  /** Title of the mobile card; never hidden. */
  primary?: boolean
  sortable?: boolean
}

export const teamColumns = [
  { id: "name", header: "Team", primary: true, sortable: true },
  { id: "lead", header: "Lead", sortable: true },
  { id: "manager", header: "EM", sortable: true },
  { id: "members", header: "Members", align: "end", sortable: true },
  { id: "projects", header: "Projects", align: "end", sortable: true },
  { id: "services", header: "Services", align: "end", sortable: true },
  { id: "repos", header: "Repos", align: "end", sortable: true },
  { id: "stack", header: "Stack" },
  { id: "capacity", header: "Capacity", sortable: true },
  { id: "sprint", header: "Sprint", sortable: true },
  { id: "health", header: "Health", sortable: true },
  { id: "oncall", header: "On-call", sortable: true },
] as const satisfies readonly ColumnDef[]
export type TeamColId = (typeof teamColumns)[number]["id"]

/** Labels for the roles a member can hold in their team. */
export const teamRoles = {
  manager: "Manager",
  lead: "Tech lead",
  oncall: "On-call",
} as const

/** Rows per page on the teams list. */
export const teamPageSize = 5

/** Filters on the list: row field and label. Options come from the data. */
export const teamFilters = [
  { key: "department", label: "Department" },
  { key: "health", label: "Health" },
] as const

/** Languages shown in the stack column before collapsing to a count. */
export const stackShown = 3

/**
 * Sprint load (committed points as a share of team capacity). Above `warnAbove`
 * the team is stretched; above `dangerAbove` it is over-committed.
 */
export const capacityLoad = { warnAbove: 95, dangerAbove: 105 } as const

export function loadTone(load: number): Tone {
  if (load > capacityLoad.dangerAbove) return "danger"
  return load > capacityLoad.warnAbove ? "warning" : "success"
}

export function incidentTone(open: number, critical: number): Tone {
  if (critical > 0) return "danger"
  return open > 0 ? "warning" : "success"
}

const toneRank: Record<Tone, number> = {
  neutral: 0,
  info: 0,
  success: 0,
  warning: 1,
  danger: 2,
}

const healthByRank: readonly HealthLevel[] = [
  "On Track",
  "At Risk",
  "Off Track",
]

/** Sort order of health levels, best first. */
export const healthRank = (level: HealthLevel): number =>
  healthByRank.indexOf(level)

/** A team is as healthy as its worst signal (sprint pace, load, open incidents). */
export function teamHealth(tones: readonly Tone[]): HealthLevel {
  const worst = Math.max(0, ...tones.map((t) => toneRank[t]))
  return healthByRank[worst]
}

export const velocityChart = defineChart({
  id: "team-velocity",
  title: "Sprint velocity",
  description: "Story points committed and completed in recent sprints",
  xKey: "sprint",
  xType: "category",
  series: [
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
