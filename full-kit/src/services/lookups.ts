import { engineers, services, teams } from "@/data/engineering"

import { authorize } from "./guard"

/** Name lookups so tables can show names instead of ids. */
export async function getLookups() {
  await authorize("view", "dashboard")
  return {
    teams: Object.fromEntries(teams.map((t) => [t.id, t.name])),
    services: Object.fromEntries(services.map((s) => [s.id, s.name])),
    engineers: Object.fromEntries(engineers.map((e) => [e.id, e.name])),
  }
}
