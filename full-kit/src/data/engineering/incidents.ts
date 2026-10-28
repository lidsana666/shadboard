import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/types/engineering"

import { DAY_MS, HOUR_MS, SEED_NOW, createRng, isoAt } from "./prng"
import { serviceSeeds } from "./service-seeds"

const TITLES = [
  "Elevated error rate",
  "Increased p99 latency",
  "Partial outage after deploy",
  "Queue backlog growing",
  "Certificate nearing expiry",
  "Database connection pool exhausted",
  "Cache hit ratio dropped",
  "Intermittent timeouts from upstream",
] as const

const DURATION_HOURS: Record<IncidentSeverity, readonly [number, number]> = {
  "SEV-1": [1, 6],
  "SEV-2": [1, 8],
  "SEV-3": [2, 24],
  "SEV-4": [4, 48],
}

/** Currently open incidents, newest first: severity, stage, hours since detection. */
const OPEN_NOW: readonly (readonly [
  IncidentSeverity,
  IncidentStatus,
  number,
])[] = [
  ["SEV-3", "Investigating", 1],
  ["SEV-1", "Mitigating", 3],
  ["SEV-2", "Identified", 9],
  ["SEV-3", "Detected", 20],
]

const COUNT = 38
const rng = createRng(3003)

function build(i: number): Incident {
  const service = serviceSeeds[(i * 5 + 2) % serviceSeeds.length]
  const open = OPEN_NOW[i]
  const severity: IncidentSeverity =
    open?.[0] ??
    rng.weighted<IncidentSeverity>([
      ["SEV-1", 5],
      ["SEV-2", 20],
      ["SEV-3", 40],
      ["SEV-4", 35],
    ])
  const detectedMs = open
    ? SEED_NOW - open[2] * HOUR_MS
    : SEED_NOW - (i / COUNT) * 90 * DAY_MS - rng.int(1, 20) * HOUR_MS
  const [min, max] = DURATION_HOURS[severity]
  const resolvedMs = detectedMs + rng.int(min, max) * HOUR_MS
  const status: IncidentStatus =
    open?.[1] ??
    (severity === "SEV-1" || severity === "SEV-2"
      ? rng.weighted<IncidentStatus>([
          ["Resolved", 3],
          ["Postmortem", 7],
        ])
      : "Resolved")
  const isResolved = status === "Resolved" || status === "Postmortem"
  return {
    id: `INC-${1400 - i}`,
    title: `${TITLES[(i * 3) % TITLES.length]} on ${service.name}`,
    severity,
    status,
    serviceId: service.id,
    teamId: service.teamId,
    commanderId: `eng-${String(((i * 11) % 64) + 1).padStart(3, "0")}`,
    detectedAt: isoAt(detectedMs),
    resolvedAt: isResolved ? isoAt(Math.min(resolvedMs, SEED_NOW)) : null,
  }
}

/** Newest first. */
export const incidents: readonly Incident[] = Array.from(
  { length: COUNT },
  (_, i) => build(i)
)
