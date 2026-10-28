import type { Deployment } from "@/types/engineering"

import { deployments } from "@/data/engineering"

import { authorize } from "./guard"

export async function listDeployments(): Promise<readonly Deployment[]> {
  await authorize("view", "deployments")
  return deployments
}
