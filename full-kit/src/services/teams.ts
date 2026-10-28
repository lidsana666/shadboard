import type { Team } from "@/types/engineering"

import { teams } from "@/data/engineering"

import { authorize } from "./guard"

export async function listTeams(): Promise<readonly Team[]> {
  await authorize("view", "organization")
  return teams
}
