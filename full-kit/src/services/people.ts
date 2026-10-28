import type { Engineer, Team } from "@/types/engineering"

import { engineers, teams } from "@/data/engineering"

import { authorize } from "./guard"
import { dutiesOf } from "./team-model"

/** One directory row. Descriptive only: no per-person performance measures. */
export interface PersonRow {
  id: string
  name: string
  email: string
  /** Job title, shown as "Role". */
  role: string
  teamId: string
  team: string
  /** Roles held in the team (manager, tech lead, on-call). */
  duties: string[]
  location: string
  active: boolean
  status: "Active" | "Inactive"
}

/** Pure join of engineers to their team. Unknown teams show an empty name. */
export function buildPeople(
  people: readonly Engineer[],
  allTeams: readonly Team[]
): PersonRow[] {
  const byId = new Map(allTeams.map((t) => [t.id, t]))
  return people.map((e) => {
    const team = byId.get(e.teamId)
    return {
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.title,
      teamId: e.teamId,
      team: team?.name ?? "",
      duties: team ? dutiesOf(team, e.id) : [],
      location: e.location,
      active: e.active,
      status: e.active ? "Active" : "Inactive",
    }
  })
}

/** Every engineer, for the directory. Needs `view` on organization. */
export async function listPeople(): Promise<PersonRow[]> {
  await authorize("view", "organization")
  return buildPeople(engineers, teams)
}
