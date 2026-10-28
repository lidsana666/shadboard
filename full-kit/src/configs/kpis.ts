import type { Tone } from "@/configs/tokens"
import type { ProjectStatus } from "@/types/engineering"

export type KpiId =
  | "activeProjects"
  | "activeEngineers"
  | "teams"
  | "openPrs"
  | "deploymentFrequency"
  | "leadTime"
  | "changeFailureRate"
  | "mttr"
  | "openIncidents"
  | "sprintCompletion"
  | "buildSuccess"
  | "testPass"

export interface KpiDefinition {
  id: KpiId
  label: string
  unit: "" | "/day" | "h" | "%"
  /** Which direction is good. `none` means informational: no tone is derived. */
  better: "higher" | "lower" | "none"
  /** Target value (omitted for informational KPIs). */
  target?: number
  /** Distance past the target at which the tone turns from warning to danger. */
  critical?: number
  /** Digits shown after the decimal point. */
  digits: number
}

/** Projects that count as "active" on the dashboard. */
export const activeProjectStatuses: readonly ProjectStatus[] = [
  "In Progress",
  "Testing",
  "Staging",
  "Blocked",
]

/** KPI presentation and targets. `target` and `critical` drive tone; nothing else does. */
export const kpiDefinitions: readonly KpiDefinition[] = [
  {
    id: "activeProjects",
    label: "Active Projects",
    unit: "",
    better: "none",
    digits: 0,
  },
  {
    id: "activeEngineers",
    label: "Active Engineers",
    unit: "",
    better: "none",
    digits: 0,
  },
  { id: "teams", label: "Teams", unit: "", better: "none", digits: 0 },
  {
    id: "openPrs",
    label: "Open PRs",
    unit: "",
    better: "lower",
    target: 80,
    critical: 60,
    digits: 0,
  },
  {
    id: "deploymentFrequency",
    label: "Deployment Frequency",
    unit: "/day",
    better: "higher",
    target: 1,
    critical: 0.5,
    digits: 2,
  },
  {
    id: "leadTime",
    label: "Lead Time",
    unit: "h",
    better: "lower",
    target: 24,
    critical: 24,
    digits: 1,
  },
  {
    id: "changeFailureRate",
    label: "Change Failure Rate",
    unit: "%",
    better: "lower",
    target: 10,
    critical: 10,
    digits: 1,
  },
  {
    id: "mttr",
    label: "MTTR",
    unit: "h",
    better: "lower",
    target: 8,
    critical: 12,
    digits: 1,
  },
  {
    id: "openIncidents",
    label: "Open Incidents",
    unit: "",
    better: "lower",
    target: 2,
    critical: 2,
    digits: 0,
  },
  {
    id: "sprintCompletion",
    label: "Sprint Completion",
    unit: "%",
    better: "higher",
    target: 85,
    critical: 15,
    digits: 0,
  },
  {
    id: "buildSuccess",
    label: "Build Success Rate",
    unit: "%",
    better: "higher",
    target: 95,
    critical: 5,
    digits: 1,
  },
  {
    id: "testPass",
    label: "Test Pass Rate",
    unit: "%",
    better: "higher",
    target: 98,
    critical: 2,
    digits: 1,
  },
]

/** Tone for a KPI value: success within target, warning within `critical` of it, else danger. */
export function kpiTone(def: KpiDefinition, value: number): Tone {
  if (def.better === "none" || def.target === undefined) return "neutral"
  const gap = def.better === "higher" ? def.target - value : value - def.target
  if (gap <= 0) return "success"
  return gap <= (def.critical ?? 0) ? "warning" : "danger"
}
