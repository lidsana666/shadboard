import type {
  Deployment,
  DeploymentStatus,
  Environment,
} from "@/types/engineering"

import { DAY_MS, SEED_NOW, createRng, isoAt } from "./prng"
import { serviceSeeds } from "./service-seeds"
import { teams } from "./teams"

const COUNT = 318
const rng = createRng(4004)

function startedAtMs(): number {
  let ms = SEED_NOW - rng.next() * 90 * DAY_MS
  const day = new Date(ms).getUTCDay()
  // Teams rarely ship at weekends: move most weekend deploys back to Friday.
  if ((day === 0 || day === 6) && rng.next() > 0.2) {
    ms -= (day === 0 ? 2 : 1) * DAY_MS
  }
  return ms
}

/** An engineer from the team that owns the service (8 per team, ids sequential). */
function engineerOf(teamId: string): string {
  const t = teams.findIndex((team) => team.id === teamId)
  return `eng-${String(t * 8 + rng.int(1, 8)).padStart(3, "0")}`
}

type Draft = Omit<Deployment, "id">

function build(): Draft & { ms: number } {
  const service = rng.pick(serviceSeeds)
  const ms = startedAtMs()
  return {
    ms,
    serviceId: service.id,
    teamId: service.teamId,
    environment: rng.weighted<Environment>([
      ["Production", 40],
      ["Staging", 25],
      ["QA", 20],
      ["Development", 15],
    ]),
    version: `2.${rng.int(0, 31)}.${rng.int(0, 9)}`,
    status: rng.weighted<DeploymentStatus>([
      ["Success", 88],
      ["Failed", 9],
      ["Rolled Back", 3],
    ]),
    startedAt: isoAt(ms),
    durationSec: rng.int(90, 1500),
    leadTimeHours: 3 + Math.floor(rng.next() ** 2 * 60),
    deployedById: engineerOf(service.teamId),
  }
}

const history = Array.from({ length: COUNT }, build).sort((a, b) => b.ms - a.ms)

const inFlight: Draft[] = [
  { service: serviceSeeds[0], environment: "Staging" as const, minutes: 12 },
  { service: serviceSeeds[5], environment: "Production" as const, minutes: 41 },
].map(({ service, environment, minutes }) => ({
  serviceId: service.id,
  teamId: service.teamId,
  environment,
  version: "2.32.0",
  status: "In Progress" as const,
  startedAt: isoAt(SEED_NOW - minutes * 60_000),
  durationSec: 0,
  leadTimeHours: 9,
  deployedById: engineerOf(service.teamId),
}))

const ordered: readonly Draft[] = [...inFlight, ...history].sort((a, b) =>
  b.startedAt.localeCompare(a.startedAt)
)

/** 320 deployments, newest first. Ids ascend with age so they are stable. */
export const deployments: readonly Deployment[] = ordered.map((d, i) => ({
  id: `DEP-${String(ordered.length - i).padStart(4, "0")}`,
  serviceId: d.serviceId,
  teamId: d.teamId,
  environment: d.environment,
  version: d.version,
  status: d.status,
  startedAt: d.startedAt,
  durationSec: d.durationSec,
  leadTimeHours: d.leadTimeHours,
  deployedById: d.deployedById,
}))
