import type { Repository } from "@/types/engineering"

import { createRng } from "./prng"
import { serviceSeeds } from "./service-seeds"

const LANGS = ["TypeScript", "Go", "Java", "Python", "Kotlin", "Rust"] as const
const rng = createRng(2002)

/** One primary repository per service plus a shared library each for a few. */
export const repositories: readonly Repository[] = serviceSeeds.flatMap(
  (service, i) => {
    const base: Repository = {
      id: `repo-${service.name}`,
      name: service.name,
      serviceId: service.id,
      teamId: service.teamId,
      language: LANGS[i % LANGS.length],
      openPrs: rng.int(2, 19),
      coverage: rng.int(61, 92),
    }
    const lib: Repository[] =
      i % 3 === 0
        ? [
            {
              id: `repo-${service.name}-client`,
              name: `${service.name}-client`,
              serviceId: service.id,
              teamId: service.teamId,
              language: "TypeScript",
              openPrs: rng.int(0, 6),
              coverage: rng.int(70, 95),
            },
          ]
        : []
    return [base, ...lib]
  }
)
