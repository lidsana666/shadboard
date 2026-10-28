import type { DocKind, TeamDoc } from "@/types/engineering"

import { engineers } from "./engineers"
import { DAY_MS, SEED_NOW, createRng, isoAt } from "./prng"
import { teams } from "./teams"

const rng = createRng(7007)

/** Title templates per kind; `%` is the team name. */
const TEMPLATES: readonly (readonly [DocKind, string])[] = [
  ["Runbook", "% on-call runbook"],
  ["Runbook", "% rollback procedure"],
  ["ADR", "% service boundaries"],
  ["ADR", "% data retention policy"],
  ["Design", "% reliability roadmap"],
  ["Onboarding", "Joining % in your first week"],
  ["Postmortem", "% quarterly incident review"],
]

/** Five to seven documents per team, owned by its members, newest first. */
export const teamDocs: readonly TeamDoc[] = teams.flatMap((team) => {
  const members = engineers.filter((e) => e.teamId === team.id)
  const count = rng.int(5, TEMPLATES.length)
  return TEMPLATES.slice(0, count).map(
    ([kind, title], i): TeamDoc => ({
      id: `doc-${team.id.replace("team-", "")}-${i + 1}`,
      teamId: team.id,
      title: title.replace("%", team.name),
      kind,
      ownerId: rng.pick(members).id,
      updatedAt: isoAt(SEED_NOW - rng.int(2, 160) * DAY_MS),
    })
  )
})
