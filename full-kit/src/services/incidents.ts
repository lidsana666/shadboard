import type { Incident } from "@/types/engineering"

import { incidents } from "@/data/engineering"

import { authorize } from "./guard"

export async function listIncidents(): Promise<readonly Incident[]> {
  await authorize("view", "incidents")
  return incidents
}
