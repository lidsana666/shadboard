import type { Engineer } from "@/types/engineering"

import { createRng } from "./prng"
import { teams } from "./teams"

const FIRST = [
  "Aiden",
  "Priya",
  "Marcus",
  "Sofia",
  "Kenji",
  "Amara",
  "Lucas",
  "Noor",
  "Elena",
  "Tariq",
  "Hana",
  "Mateo",
  "Ines",
  "Rohan",
  "Freya",
  "Omar",
  "Yuki",
  "Chloe",
  "Dmitri",
  "Leila",
  "Samuel",
  "Mei",
  "Jonas",
  "Zara",
] as const
const LAST = [
  "Nakamura",
  "Okafor",
  "Lindqvist",
  "Hernandez",
  "Patel",
  "Kowalski",
  "Abdi",
  "Moreau",
  "Tanaka",
  "Silva",
  "Novak",
  "Haddad",
  "Fischer",
  "Reyes",
  "Larsen",
  "Chen",
  "Mensah",
  "Ivanov",
  "Costa",
  "Bauer",
] as const
const TITLES = [
  "Staff Engineer",
  "Senior Engineer",
  "Senior Engineer",
  "Software Engineer",
  "Software Engineer",
  "Software Engineer",
  "QA Engineer",
  "Site Reliability Engineer",
] as const
const LOCATIONS = [
  "Vientiane",
  "Singapore",
  "Berlin",
  "Austin",
  "Lisbon",
  "Toronto",
] as const

/** Leadership seats, by position in the team: manager, tech lead. */
const ROLE_TITLES = ["Engineering Manager", "Tech Lead"] as const

const rng = createRng(1001)
const PER_TEAM = 8

/** 8 teams x 8 engineers. The first two of each team are its manager and tech lead. */
export const engineers: readonly Engineer[] = teams.flatMap((team, t) =>
  Array.from({ length: PER_TEAM }, (_, i): Engineer => {
    const n = t * PER_TEAM + i + 1
    const first = FIRST[(n * 5) % FIRST.length]
    const last = LAST[(n * 7 + t) % LAST.length]
    return {
      id: `eng-${String(n).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${n}@acme-eng.example`.toLowerCase(),
      title: ROLE_TITLES[i] ?? rng.pick(TITLES),
      teamId: team.id,
      location: LOCATIONS[(n + t) % LOCATIONS.length],
      active: n % 23 !== 0,
    }
  })
)
