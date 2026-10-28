import {
  SEED_NOW,
  deployments,
  incidents,
  releases,
  sprints,
} from "@/data/engineering"

import { can } from "@/lib/rbac"

import { authorize } from "./guard"

export const NOTIFICATION_CATEGORIES = [
  "Deployment",
  "Incident",
  "Approval",
  "Sprint",
  "Security",
  "System",
] as const
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

export interface Notification {
  id: string
  category: NotificationCategory
  title: string
  detail: string
  at: string
  /** Seeded read state; the client overlays its own. */
  read: boolean
}

/** Notifications derived from live domain data, filtered to what the role may see. */
export async function listNotifications(): Promise<Notification[]> {
  const user = await authorize("view", "dashboard")
  const out: Notification[] = []

  if (can(user, "view", "deployments")) {
    for (const d of deployments
      .filter((x) => x.status === "Failed")
      .slice(0, 2)) {
      out.push({
        id: `n-${d.id}`,
        category: "Deployment",
        title: `Deployment ${d.id} failed`,
        detail: `${d.environment} · v${d.version}`,
        at: d.startedAt,
        read: false,
      })
    }
  }
  if (can(user, "view", "incidents")) {
    for (const i of incidents
      .filter((x) => x.resolvedAt === null)
      .slice(0, 2)) {
      out.push({
        id: `n-${i.id}`,
        category: "Incident",
        title: `${i.severity} ${i.title}`,
        detail: `${i.id} · ${i.status}`,
        at: i.detectedAt,
        read: false,
      })
    }
  }
  if (can(user, "approve", "releases")) {
    for (const r of releases.filter(
      (x) => x.status === "In QA" || x.status === "Code Freeze"
    )) {
      out.push({
        id: `n-${r.id}`,
        category: "Approval",
        title: `${r.name} awaits approval`,
        detail: `v${r.version} · ${r.readiness}% ready`,
        at: new Date(SEED_NOW - 3 * 3_600_000).toISOString(),
        read: true,
      })
    }
  }
  const ending = sprints.find((s) => s.status === "Active")
  if (ending) {
    out.push({
      id: `n-${ending.id}`,
      category: "Sprint",
      title: `${ending.name} ends ${ending.endDate}`,
      detail: `${ending.completed}/${ending.committed} points done`,
      at: new Date(SEED_NOW - 26 * 3_600_000).toISOString(),
      read: true,
    })
  }
  if (can(user, "view", "security")) {
    out.push({
      id: "n-sec-1",
      category: "Security",
      title: "Dependency advisory affects 2 services",
      detail: "Review in the security queue",
      at: new Date(SEED_NOW - 5 * 3_600_000).toISOString(),
      read: false,
    })
  }
  out.push({
    id: "n-sys-1",
    category: "System",
    title: "Scheduled maintenance Sunday 02:00 UTC",
    detail: "CI runners will restart",
    at: new Date(SEED_NOW - 30 * 3_600_000).toISOString(),
    read: true,
  })
  return out.sort((a, b) => b.at.localeCompare(a.at))
}
