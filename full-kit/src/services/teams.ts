import type { Team } from "@/types/engineering"
import type { TeamDetail, TeamSource, TeamSummary } from "./team-model"

import {
  SEED_NOW,
  deployments,
  engineers,
  incidents,
  projects,
  releases,
  repositories,
  risks,
  services,
  sprints,
  teamDocs,
  teams,
} from "@/data/engineering"

import { can } from "@/lib/rbac"

import { authorize } from "./guard"
import { detail, summarize } from "./team-model"

export async function listTeams(): Promise<readonly Team[]> {
  await authorize("view", "organization")
  return teams
}

const source: TeamSource = {
  engineers,
  projects,
  services,
  repositories,
  deployments,
  incidents,
  sprints,
  releases,
  risks,
  docs: teamDocs,
  nowMs: SEED_NOW,
}

/** One summary row per team, for the list page. */
export async function listTeamRows(): Promise<TeamSummary[]> {
  await authorize("view", "organization")
  return teams.map((t) => summarize(t, source))
}

export interface TeamPage {
  detail: TeamDetail
  /** Sections the signed-in role may not see are emptied and flagged here. */
  access: { repositories: boolean; deployments: boolean; incidents: boolean }
}

/** A team with everything its detail page shows, or null for an unknown id. */
export async function getTeam(id: string): Promise<TeamPage | null> {
  const user = await authorize("view", "organization")
  const team = teams.find((t) => t.id === id)
  if (!team) return null

  const access = {
    repositories: can(user, "view", "repositories"),
    deployments: can(user, "view", "deployments"),
    incidents: can(user, "view", "incidents"),
  }
  const scoped: TeamSource = {
    ...source,
    repositories: access.repositories ? repositories : [],
    deployments: access.deployments ? deployments : [],
    incidents: access.incidents ? incidents : [],
  }
  return { detail: detail(team, scoped), access }
}
