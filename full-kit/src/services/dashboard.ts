import type { KpiId } from "@/configs/kpis"
import type {
  Deployment,
  Incident,
  Release,
  Risk,
  Service,
  Sprint,
  Team,
  TrendPoint,
} from "@/types/engineering"
import type { KpiInput, KpiValue } from "./kpi"

import {
  SEED_NOW,
  deployments,
  engineers,
  incidents,
  projects,
  quality,
  releases,
  repositories,
  risks,
  services,
  sprints,
  teams,
} from "@/data/engineering"

import {
  activeProjectStatuses,
  kpiWindowDays,
  trendWeeks,
} from "@/configs/kpis"
import { computeDora, median, weekStart, weeklyCounts } from "@/lib/dora"
import { can } from "@/lib/rbac"
import { pct, sprintElapsed } from "@/lib/sprint"
import { outcomeTrend, severityTrend } from "@/lib/trends"

import { authorize } from "./guard"
import { makeKpis } from "./kpi"

export type { KpiValue }

const DAY_MS = 86_400_000
const WINDOW_DAYS = kpiWindowDays
const TREND_WEEKS = trendWeeks

export interface TeamRow {
  id: string
  name: string
  department: string
  engineers: number
  openPrs: number
  capacity: number
  committed: number
  completed: number
  completion: number
  deploymentsLast30d: number
  openIncidents: number
}

export interface SprintHealth {
  teamId: string
  team: string
  name: string
  endDate: string
  committed: number
  completed: number
  added: number
  removed: number
  /** Share of the sprint's calendar time already elapsed, 0-100. */
  elapsed: number
  /** Completed points as a share of committed, 0-100. */
  completion: number
}

export interface RiskRow extends Risk {
  project: string
  owner: string
}

export interface ReleaseRow extends Release {
  project: string
}

export interface DashboardOverview {
  asOf: string
  kpis: KpiValue[]
  deliveryTrend: { date: string; deployments: number; leadTime: number }[]
  deploymentTrend: {
    date: string
    success: number
    failed: number
    rolledBack: number
  }[]
  incidentTrend: { date: string; critical: number; other: number }[]
  teamCapacity: {
    team: string
    capacity: number
    committed: number
    completed: number
  }[]
  sprintHealth: SprintHealth[]
  releases: ReleaseRow[]
  risks: RiskRow[]
  criticalServices: Service[]
  recentDeployments: Deployment[]
  recentIncidents: Incident[]
  teams: TeamRow[]
  /** What the signed-in role may see; panels show a no-permission state otherwise. */
  access: { deployments: boolean; incidents: boolean }
  names: {
    teams: Record<string, string>
    services: Record<string, string>
  }
}

const weekly = <T>(
  rows: readonly T[],
  at: (r: T) => string,
  include?: (r: T) => boolean
): TrendPoint[] => weeklyCounts(rows, at, SEED_NOW, TREND_WEEKS, include)

function buildKpis(): KpiValue[] {
  const now = computeDora({
    deployments,
    incidents,
    asOfMs: SEED_NOW,
    days: WINDOW_DAYS,
  })
  const before = computeDora({
    deployments,
    incidents,
    asOfMs: SEED_NOW - WINDOW_DAYS * DAY_MS,
    days: WINDOW_DAYS,
  })

  const completedSprints = teams.flatMap((t) => {
    const done = sprints
      .filter((s) => s.teamId === t.id && s.status === "Completed")
      .sort((a, b) => b.endDate.localeCompare(a.endDate))
    return done.slice(0, 1)
  })
  const sprintCompletion = pct(
    completedSprints.reduce((n, s) => n + s.completed, 0),
    completedSprints.reduce((n, s) => n + s.committed, 0)
  )

  const recentQuality = quality.slice(-WINDOW_DAYS)
  const priorQuality = quality.slice(-2 * WINDOW_DAYS, -WINDOW_DAYS)
  const rate = (
    rows: typeof quality,
    pass: "buildsPassed" | "testsPassed",
    total: "builds" | "tests"
  ) =>
    pct(
      rows.reduce((n, r) => n + r[pass], 0),
      rows.reduce((n, r) => n + r[total], 0)
    )

  const values: Record<KpiId, KpiInput> = {
    activeProjects: {
      value: projects.filter((p) => activeProjectStatuses.includes(p.status))
        .length,
      previous: null,
    },
    activeEngineers: {
      value: engineers.filter((e) => e.active).length,
      previous: null,
    },
    teams: { value: teams.length, previous: null },
    openPrs: {
      value: repositories.reduce((n, r) => n + r.openPrs, 0),
      previous: null,
    },
    deploymentFrequency: {
      value: now.deploymentFrequency,
      previous: before.deploymentFrequency,
    },
    leadTime: { value: now.leadTimeHours, previous: before.leadTimeHours },
    changeFailureRate: {
      value: now.changeFailureRate,
      previous: before.changeFailureRate,
    },
    mttr: { value: now.mttrHours, previous: before.mttrHours },
    openIncidents: {
      value: incidents.filter((i) => i.resolvedAt === null).length,
      previous: null,
    },
    sprintCompletion: { value: sprintCompletion, previous: null },
    buildSuccess: {
      value: rate(recentQuality, "buildsPassed", "builds"),
      previous: rate(priorQuality, "buildsPassed", "builds"),
    },
    testPass: {
      value: rate(recentQuality, "testsPassed", "tests"),
      previous: rate(priorQuality, "testsPassed", "tests"),
    },
  }

  return makeKpis(values)
}

function buildSprintHealth(): SprintHealth[] {
  return sprints
    .filter((s) => s.status === "Active")
    .map((s: Sprint) => {
      return {
        teamId: s.teamId,
        team: teams.find((t) => t.id === s.teamId)?.name ?? s.teamId,
        name: s.name,
        endDate: s.endDate,
        committed: s.committed,
        completed: s.completed,
        added: s.added,
        removed: s.removed,
        elapsed: sprintElapsed(s, SEED_NOW),
        completion: pct(s.completed, s.committed),
      }
    })
}

function buildTeams(): TeamRow[] {
  const from = SEED_NOW - WINDOW_DAYS * DAY_MS
  return teams.map((t: Team) => {
    const active = sprints.find(
      (s) => s.teamId === t.id && s.status === "Active"
    )
    const teamRepos = repositories.filter((r) => r.teamId === t.id)
    return {
      id: t.id,
      name: t.name,
      department: t.department,
      engineers: engineers.filter((e) => e.teamId === t.id && e.active).length,
      openPrs: teamRepos.reduce((n, r) => n + r.openPrs, 0),
      capacity: t.capacity,
      committed: active?.committed ?? 0,
      completed: active?.completed ?? 0,
      completion: pct(active?.completed ?? 0, active?.committed ?? 0),
      deploymentsLast30d: deployments.filter(
        (d) => d.teamId === t.id && new Date(d.startedAt).getTime() >= from
      ).length,
      openIncidents: incidents.filter(
        (i) => i.teamId === t.id && i.resolvedAt === null
      ).length,
    }
  })
}

const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const

/** Everything the executive dashboard shows, in one guarded call. */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const user = await authorize("view", "dashboard")

  const teamName = Object.fromEntries(teams.map((t) => [t.id, t.name]))
  const serviceName = Object.fromEntries(services.map((s) => [s.id, s.name]))
  const projectName = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  const engineerName = Object.fromEntries(engineers.map((e) => [e.id, e.name]))
  const canSeeDeploys = can(user, "view", "deployments")
  const canSeeIncidents = can(user, "view", "incidents")

  const leadTimesByWeek = new Map<string, number[]>()
  for (const d of deployments) {
    if (d.environment !== "Production" || d.status !== "Success") continue
    const key = weekStart(new Date(d.startedAt).getTime())
    leadTimesByWeek.set(key, [
      ...(leadTimesByWeek.get(key) ?? []),
      d.leadTimeHours,
    ])
  }

  const prodSuccess = weekly(
    deployments,
    (d) => d.startedAt,
    (d) => d.environment === "Production" && d.status === "Success"
  )

  return {
    asOf: new Date(SEED_NOW).toISOString(),
    kpis: buildKpis(),
    deliveryTrend: prodSuccess.map((p) => ({
      date: p.date,
      deployments: p.value,
      leadTime: Math.round(median(leadTimesByWeek.get(p.date) ?? []) * 10) / 10,
    })),
    deploymentTrend: outcomeTrend(deployments, SEED_NOW, TREND_WEEKS),
    incidentTrend: severityTrend(incidents, SEED_NOW, TREND_WEEKS),
    teamCapacity: buildTeams().map((t) => ({
      team: t.name,
      capacity: t.capacity,
      committed: t.committed,
      completed: t.completed,
    })),
    sprintHealth: buildSprintHealth(),
    releases: releases
      .filter((r) => r.status !== "Released")
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
      .map((r) => ({ ...r, project: projectName[r.projectId] ?? r.projectId })),
    risks: [...risks]
      .sort((a, b) => RISK_ORDER[a.level] - RISK_ORDER[b.level])
      .slice(0, 5)
      .map((r) => ({
        ...r,
        project: projectName[r.projectId] ?? r.projectId,
        owner: engineerName[r.ownerId] ?? r.ownerId,
      })),
    criticalServices: services
      .filter((s) => s.tier === "Tier 1")
      .sort((a, b) => a.availability - b.availability),
    recentDeployments: canSeeDeploys ? deployments.slice(0, 8) : [],
    recentIncidents: canSeeIncidents ? incidents.slice(0, 6) : [],
    teams: buildTeams(),
    access: { deployments: canSeeDeploys, incidents: canSeeIncidents },
    names: { teams: teamName, services: serviceName },
  }
}
