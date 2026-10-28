import { cache } from "react"
import { getTeam } from "@/services/teams"

import type { TeamPage } from "@/services/teams"

import { ForbiddenError } from "@/lib/rbac"

export type Loaded =
  | { state: "ok"; page: TeamPage }
  | { state: "missing" }
  | { state: "forbidden" }

/**
 * Loads a team once per request. The layout and the page both call it: the
 * layout needs the result to answer 404 before any streaming starts.
 */
export const loadTeam = cache(async (id: string): Promise<Loaded> => {
  try {
    const page = await getTeam(id)
    return page ? { state: "ok", page } : { state: "missing" }
  } catch (error) {
    if (error instanceof ForbiddenError) return { state: "forbidden" }
    throw error
  }
})
