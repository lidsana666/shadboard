export const PROJECT_STATUSES = [
  "Planning",
  "Ready",
  "In Progress",
  "Blocked",
  "Testing",
  "Staging",
  "Released",
  "Completed",
  "Archived",
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const HEALTH_LEVELS = ["On Track", "At Risk", "Off Track"] as const
export type HealthLevel = (typeof HEALTH_LEVELS)[number]

export const ENVIRONMENTS = [
  "Development",
  "QA",
  "Staging",
  "Production",
] as const
export type Environment = (typeof ENVIRONMENTS)[number]

export const DEPLOYMENT_STATUSES = [
  "Success",
  "Failed",
  "Rolled Back",
  "In Progress",
] as const
export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number]

export const INCIDENT_SEVERITIES = ["SEV-1", "SEV-2", "SEV-3", "SEV-4"] as const
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number]

/** Ordered workflow. An incident may only move forward one step at a time. */
export const INCIDENT_STATUSES = [
  "Detected",
  "Investigating",
  "Identified",
  "Mitigating",
  "Resolved",
  "Postmortem",
] as const
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number]

export const SERVICE_STATUSES = ["Operational", "Degraded", "Outage"] as const
export type ServiceStatus = (typeof SERVICE_STATUSES)[number]

export const SERVICE_TIERS = ["Tier 1", "Tier 2", "Tier 3"] as const
export type ServiceTier = (typeof SERVICE_TIERS)[number]

export const RELEASE_STATUSES = [
  "Planned",
  "Code Freeze",
  "In QA",
  "Approved",
  "Released",
  "Rolled Back",
] as const
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number]

export const SPRINT_STATUSES = ["Planned", "Active", "Completed"] as const
export type SprintStatus = (typeof SPRINT_STATUSES)[number]

export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

export interface Team {
  id: string
  name: string
  department: string
  leadId: string
  /** Sprint capacity in story points. */
  capacity: number
}

export interface Engineer {
  id: string
  name: string
  email: string
  title: string
  teamId: string
  location: string
  active: boolean
}

export interface Project {
  id: string
  key: string
  name: string
  status: ProjectStatus
  health: HealthLevel
  teamId: string
  ownerId: string
  /** 0-100 */
  progress: number
  startDate: string
  targetDate: string
}

export interface Service {
  id: string
  name: string
  tier: ServiceTier
  status: ServiceStatus
  teamId: string
  /** Rolling 30-day availability percentage. */
  availability: number
  /** Availability objective percentage. */
  sloTarget: number
}

export interface Repository {
  id: string
  name: string
  serviceId: string
  teamId: string
  language: string
  openPrs: number
  coverage: number
}

export interface Deployment {
  id: string
  serviceId: string
  teamId: string
  environment: Environment
  version: string
  status: DeploymentStatus
  startedAt: string
  durationSec: number
  /** Hours from first commit to production-ready build. */
  leadTimeHours: number
  deployedById: string
}

export interface Incident {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  serviceId: string
  teamId: string
  commanderId: string
  detectedAt: string
  /** Set once the incident reaches Resolved. */
  resolvedAt: string | null
}

export interface Release {
  id: string
  name: string
  version: string
  status: ReleaseStatus
  projectId: string
  targetDate: string
  /** 0-100 checklist completion. */
  readiness: number
}

export interface Sprint {
  id: string
  name: string
  teamId: string
  status: SprintStatus
  startDate: string
  endDate: string
  committed: number
  completed: number
  added: number
  removed: number
}

export interface Risk {
  id: string
  title: string
  level: RiskLevel
  projectId: string
  ownerId: string
  openedAt: string
}

/** Daily CI health sample. */
export interface QualityDay {
  date: string
  builds: number
  buildsPassed: number
  tests: number
  testsPassed: number
}

export interface DoraMetrics {
  /** Production deployments per day. */
  deploymentFrequency: number
  /** Median hours. */
  leadTimeHours: number
  /** Percentage of production deployments that failed or were rolled back. */
  changeFailureRate: number
  /** Mean hours to resolve. */
  mttrHours: number
}

export interface TrendPoint {
  /** ISO date (day) or ISO week start. */
  date: string
  value: number
}
