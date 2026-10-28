import type {
  DeploymentStatus,
  HealthLevel,
  IncidentSeverity,
  IncidentStatus,
  ProjectStatus,
  ReleaseStatus,
  RiskLevel,
  ServiceStatus,
  SprintStatus,
} from "@/types/engineering"

/** Visual weight of a status. Colours come from the `--tone-*` CSS variables. */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger"

/** Tailwind class strings must stay literal so the compiler can see them. */
export const toneClass: Record<
  Tone,
  { badge: string; text: string; dot: string; fill: string }
> = {
  neutral: {
    badge: "border-border bg-muted text-muted-foreground",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    fill: "bg-muted-foreground",
  },
  info: {
    badge: "border-tone-info/30 bg-tone-info/10 text-tone-info",
    text: "text-tone-info",
    dot: "bg-tone-info",
    fill: "bg-tone-info",
  },
  success: {
    badge: "border-tone-success/30 bg-tone-success/10 text-tone-success",
    text: "text-tone-success",
    dot: "bg-tone-success",
    fill: "bg-tone-success",
  },
  warning: {
    badge: "border-tone-warning/30 bg-tone-warning/10 text-tone-warning",
    text: "text-tone-warning",
    dot: "bg-tone-warning",
    fill: "bg-tone-warning",
  },
  danger: {
    badge: "border-tone-danger/30 bg-tone-danger/10 text-tone-danger",
    text: "text-tone-danger",
    dot: "bg-tone-danger",
    fill: "bg-tone-danger",
  },
}

/** Status -> tone. The only place status colour decisions are made. */
export const statusTones = {
  projectStatus: {
    Planning: "neutral",
    Ready: "info",
    "In Progress": "info",
    Blocked: "danger",
    Testing: "warning",
    Staging: "warning",
    Released: "success",
    Completed: "success",
    Archived: "neutral",
  },
  health: {
    "On Track": "success",
    "At Risk": "warning",
    "Off Track": "danger",
  },
  deploymentStatus: {
    Success: "success",
    Failed: "danger",
    "Rolled Back": "warning",
    "In Progress": "info",
  },
  severity: {
    "SEV-1": "danger",
    "SEV-2": "warning",
    "SEV-3": "info",
    "SEV-4": "neutral",
  },
  incidentStatus: {
    Detected: "danger",
    Investigating: "warning",
    Identified: "warning",
    Mitigating: "info",
    Resolved: "success",
    Postmortem: "neutral",
  },
  serviceStatus: {
    Operational: "success",
    Degraded: "warning",
    Outage: "danger",
  },
  releaseStatus: {
    Planned: "neutral",
    "Code Freeze": "info",
    "In QA": "warning",
    Approved: "info",
    Released: "success",
    "Rolled Back": "danger",
  },
  sprintStatus: {
    Planned: "neutral",
    Active: "info",
    Completed: "success",
  },
  riskLevel: {
    Low: "neutral",
    Medium: "info",
    High: "warning",
    Critical: "danger",
  },
} as const satisfies {
  projectStatus: Record<ProjectStatus, Tone>
  health: Record<HealthLevel, Tone>
  deploymentStatus: Record<DeploymentStatus, Tone>
  severity: Record<IncidentSeverity, Tone>
  incidentStatus: Record<IncidentStatus, Tone>
  serviceStatus: Record<ServiceStatus, Tone>
  releaseStatus: Record<ReleaseStatus, Tone>
  sprintStatus: Record<SprintStatus, Tone>
  riskLevel: Record<RiskLevel, Tone>
}

export type StatusKind = keyof typeof statusTones
export type StatusValue<K extends StatusKind> = keyof (typeof statusTones)[K]

/** Chart series colours, in order. Defined in globals.css for light and dark. */
export const chartSeries = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const

export const toneColor: Record<Exclude<Tone, "neutral">, string> = {
  info: "hsl(var(--tone-info))",
  success: "hsl(var(--tone-success))",
  warning: "hsl(var(--tone-warning))",
  danger: "hsl(var(--tone-danger))",
}

/** Default corner radius in rem (one of `radii` in themes.ts). */
export const defaultRadius = 0.3

/** Shared layout classes so pages do not invent spacing. */
export const spacing = {
  page: "container grid gap-4 p-4 md:p-6",
  grid: "grid gap-4",
  card: "p-4",
  inline: "flex items-center gap-2",
} as const

/** Stacking order. Values map to Tailwind `z-*` utilities. */
export const layers = {
  base: "z-0",
  sticky: "z-10",
  header: "z-20",
  sidebar: "z-30",
  overlay: "z-50",
} as const
