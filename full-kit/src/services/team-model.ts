import type { Tone } from "@/configs/tokens"
import type {
  Deployment,
  DoraMetrics,
  Engineer,
  HealthLevel,
  Incident,
  Project,
  Release,
  Repository,
  Risk,
  Service,
  Sprint,
  Team,
  TeamDoc,
} from "@/types/engineering"
import type { KpiValue } from "./kpi"

import { criticalSeverities, sprintPaceTone } from "@/configs/dashboard"
import { kpiWindowDays, trendWeeks } from "@/configs/kpis"
import { incidentTone, loadTone, teamHealth, teamRoles } from "@/configs/teams"
import { computeDora } from "@/lib/dora"
import { pct, sprintElapsed } from "@/lib/sprint"
import { outcomeTrend, severityTrend } from "@/lib/trends"

import { makeKpis } from "./kpi"

const DAY_MS = 86_400_000

/** The roles a person holds in their team: manager, tech lead, on-call. */
export function dutiesOf(team: Team, personId: string): string[] {
  const out: string[] = []
  if (personId === team.managerId) out.push(teamRoles.manager)
  if (personId === team.leadId) out.push(teamRoles.lead)
  if (personId === team.oncallId) out.push(teamRoles.oncall)
  return out
}

/** Everything the team pages are computed from. Passed in so the builders stay pure. */
export interface TeamSource {
  engineers: readonly Engineer[]
  projects: readonly Project[]
  services: readonly Service[]
  repositories: readonly Repository[]
  deployments: readonly Deployment[]
  incidents: readonly Incident[]
  sprints: readonly Sprint[]
  releases: readonly Release[]
  risks: readonly Risk[]
  docs: readonly TeamDoc[]
  nowMs: number
}

export interface SprintPace {
  elapsed: number
  completion: number
  tone: Tone
}

export interface TeamSummary {
  id: string
  name: string
  department: string
  manager: string
  lead: string
  oncall: string
  members: number
  projects: number
  services: number
  repos: number
  /** Distinct repository languages, sorted. */
  stack: string[]
  capacity: number
  committed: number
  /** Committed points as a percentage of capacity. */
  load: number
  loadTone: Tone
  sprint: string | null
  pace: SprintPace | null
  open: number
  critical: number
  health: HealthLevel
}

export interface Member extends Engineer {
  roles: string[]
}

export interface TeamDetail {
  summary: TeamSummary
  members: Member[]
  projects: (Project & { owner: string })[]
  services: Service[]
  repos: (Repository & { service: string })[]
  releases: (Release & { project: string })[]
  risks: (Risk & { project: string; owner: string })[]
  /** Newest first. */
  sprints: Sprint[]
  /** Oldest first, for the velocity chart. */
  velocity: { sprint: string; committed: number; completed: number }[]
  kpis: KpiValue[]
  outcomes: ReturnType<typeof outcomeTrend>
  severities: ReturnType<typeof severityTrend>
  incidents: (Incident & { service: string; commander: string })[]
  docs: (TeamDoc & { owner: string })[]
}

const nameMap = (rows: readonly { id: string; name: string }[]) =>
  new Map(rows.map((r) => [r.id, r.name]))

const label = (names: Map<string, string>, id: string) => names.get(id) ?? id

const ofTeam = <T extends { teamId: string }>(rows: readonly T[], id: string) =>
  rows.filter((r) => r.teamId === id)

export function summarize(team: Team, src: TeamSource): TeamSummary {
  const people = nameMap(src.engineers)
  const repos = ofTeam(src.repositories, team.id)
  const sprint = src.sprints.find(
    (s) => s.teamId === team.id && s.status === "Active"
  )
  const open = ofTeam(src.incidents, team.id).filter(
    (i) => i.resolvedAt === null
  )
  const critical = open.filter((i) =>
    criticalSeverities.includes(i.severity)
  ).length
  const committed = sprint?.committed ?? 0
  const load = Math.round(pct(committed, team.capacity))
  const pace: SprintPace | null = sprint
    ? (() => {
        const elapsed = sprintElapsed(sprint, src.nowMs)
        const completion = pct(sprint.completed, sprint.committed)
        return {
          elapsed,
          completion,
          tone: sprintPaceTone(elapsed, completion),
        }
      })()
    : null
  const tone = loadTone(load)

  return {
    id: team.id,
    name: team.name,
    department: team.department,
    manager: label(people, team.managerId),
    lead: label(people, team.leadId),
    oncall: label(people, team.oncallId),
    members: ofTeam(src.engineers, team.id).filter((e) => e.active).length,
    projects: ofTeam(src.projects, team.id).length,
    services: ofTeam(src.services, team.id).length,
    repos: repos.length,
    stack: [...new Set(repos.map((r) => r.language))].sort(),
    capacity: team.capacity,
    committed,
    load,
    loadTone: tone,
    sprint: sprint?.name ?? null,
    pace,
    open: open.length,
    critical,
    health: teamHealth([
      pace?.tone ?? "success",
      tone,
      incidentTone(open.length, critical),
    ]),
  }
}

function buildKpis(
  team: Team,
  src: TeamSource,
  deployments: Deployment[],
  incidents: Incident[]
): KpiValue[] {
  const dora = (asOfMs: number): DoraMetrics =>
    computeDora({ deployments, incidents, asOfMs, days: kpiWindowDays })
  const now = dora(src.nowMs)
  const before = dora(src.nowMs - kpiWindowDays * DAY_MS)
  return makeKpis({
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
    openPrs: {
      value: ofTeam(src.repositories, team.id).reduce(
        (n, r) => n + r.openPrs,
        0
      ),
      previous: null,
    },
  })
}

export function detail(team: Team, src: TeamSource): TeamDetail {
  const people = nameMap(src.engineers)
  const projects = ofTeam(src.projects, team.id)
  const projectNames = nameMap(projects)
  const projectIds = new Set(projects.map((p) => p.id))
  const services = ofTeam(src.services, team.id)
  const serviceNames = nameMap(src.services)
  const deployments = ofTeam(src.deployments, team.id)
  const incidents = ofTeam(src.incidents, team.id)
  const sprints = ofTeam(src.sprints, team.id)
    .filter((s) => s.status !== "Planned")
    .sort((a, b) => b.startDate.localeCompare(a.startDate))

  return {
    summary: summarize(team, src),
    members: ofTeam(src.engineers, team.id).map((e) => ({
      ...e,
      roles: dutiesOf(team, e.id),
    })),
    projects: projects.map((p) => ({ ...p, owner: label(people, p.ownerId) })),
    services,
    repos: ofTeam(src.repositories, team.id).map((r) => ({
      ...r,
      service: label(serviceNames, r.serviceId),
    })),
    releases: src.releases
      .filter((r) => projectIds.has(r.projectId))
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
      .map((r) => ({ ...r, project: label(projectNames, r.projectId) })),
    risks: src.risks
      .filter((r) => projectIds.has(r.projectId))
      .map((r) => ({
        ...r,
        project: label(projectNames, r.projectId),
        owner: label(people, r.ownerId),
      })),
    sprints,
    velocity: [...sprints].reverse().map((s) => ({
      sprint: s.name,
      committed: s.committed,
      completed: s.completed,
    })),
    kpis: buildKpis(team, src, deployments, incidents),
    outcomes:
      deployments.length > 0
        ? outcomeTrend(deployments, src.nowMs, trendWeeks)
        : [],
    severities:
      incidents.length > 0
        ? severityTrend(incidents, src.nowMs, trendWeeks)
        : [],
    incidents: [...incidents]
      .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
      .map((i) => ({
        ...i,
        service: label(serviceNames, i.serviceId),
        commander: label(people, i.commanderId),
      })),
    docs: ofTeam(src.docs, team.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((d) => ({ ...d, owner: label(people, d.ownerId) })),
  }
}
