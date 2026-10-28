import type { Service } from "@/types/engineering"

import { incidents } from "./incidents"
import { serviceSeeds } from "./service-seeds"

const OPEN = new Set(["Detected", "Investigating", "Identified", "Mitigating"])

/** Service health is derived from open incidents so the two never disagree. */
export const services: readonly Service[] = serviceSeeds.map((seed) => {
  const open = incidents.filter(
    (i) => i.serviceId === seed.id && OPEN.has(i.status)
  )
  const status = open.some((i) => i.severity === "SEV-1")
    ? "Outage"
    : open.length > 0
      ? "Degraded"
      : "Operational"
  return { ...seed, status }
})
