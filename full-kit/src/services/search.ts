import type { Resource } from "@/types/rbac"

import {
  engineers,
  incidents,
  projects,
  repositories,
  services,
  teams,
} from "@/data/engineering"

import { can } from "@/lib/rbac"

import { authorize } from "./guard"

export interface SearchHit {
  id: string
  kind: "Project" | "Service" | "Team" | "Engineer" | "Repository" | "Incident"
  title: string
  subtitle: string
  href: string
}

const LIMIT = 8

/** Entity search for the command palette. Only entities the role may view are searched. */
export async function searchEntities(query: string): Promise<SearchHit[]> {
  const user = await authorize("view", "dashboard")
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const match = (...fields: string[]) =>
    fields.some((f) => f.toLowerCase().includes(q))
  const allowed = (r: Resource) => can(user, "view", r)

  const hits: SearchHit[] = [
    ...(allowed("projects")
      ? projects
          .filter((p) => match(p.name, p.key))
          .map<SearchHit>((p) => ({
            id: p.id,
            kind: "Project",
            title: p.name,
            subtitle: `${p.key} · ${p.status}`,
            href: "/dashboards/engineering",
          }))
      : []),
    ...(allowed("services")
      ? services
          .filter((s) => match(s.name))
          .map<SearchHit>((s) => ({
            id: s.id,
            kind: "Service",
            title: s.name,
            subtitle: `${s.tier} · ${s.status}`,
            href: "/dashboards/engineering",
          }))
      : []),
    ...(allowed("organization")
      ? [
          ...teams
            .filter((t) => match(t.name, t.department))
            .map<SearchHit>((t) => ({
              id: t.id,
              kind: "Team",
              title: t.name,
              subtitle: t.department,
              href: `/engineering/teams/${t.id}`,
            })),
          ...engineers
            .filter((e) => match(e.name, e.email))
            .map<SearchHit>((e) => ({
              id: e.id,
              kind: "Engineer",
              title: e.name,
              subtitle: e.title,
              href: "/dashboards/engineering",
            })),
        ]
      : []),
    ...(allowed("repositories")
      ? repositories
          .filter((r) => match(r.name))
          .map<SearchHit>((r) => ({
            id: r.id,
            kind: "Repository",
            title: r.name,
            subtitle: r.language,
            href: "/dashboards/engineering",
          }))
      : []),
    ...(allowed("incidents")
      ? incidents
          .filter((i) => match(i.id, i.title))
          .map<SearchHit>((i) => ({
            id: i.id,
            kind: "Incident",
            title: i.title,
            subtitle: `${i.id} · ${i.severity} · ${i.status}`,
            href: "/dashboards/engineering",
          }))
      : []),
  ]
  return hits.slice(0, LIMIT * 2)
}
