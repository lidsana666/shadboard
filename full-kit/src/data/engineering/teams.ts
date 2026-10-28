import type { Team } from "@/types/engineering"

export const teams: readonly Team[] = [
  {
    id: "team-platform",
    name: "Platform",
    department: "Infrastructure",
    leadId: "eng-001",
    capacity: 62,
  },
  {
    id: "team-payments",
    name: "Payments",
    department: "Product Engineering",
    leadId: "eng-009",
    capacity: 58,
  },
  {
    id: "team-identity",
    name: "Identity",
    department: "Security Engineering",
    leadId: "eng-017",
    capacity: 44,
  },
  {
    id: "team-growth",
    name: "Growth",
    department: "Product Engineering",
    leadId: "eng-025",
    capacity: 52,
  },
  {
    id: "team-data",
    name: "Data",
    department: "Data & ML",
    leadId: "eng-033",
    capacity: 48,
  },
  {
    id: "team-mobile",
    name: "Mobile",
    department: "Product Engineering",
    leadId: "eng-041",
    capacity: 46,
  },
  {
    id: "team-sre",
    name: "Reliability",
    department: "Infrastructure",
    leadId: "eng-049",
    capacity: 40,
  },
  {
    id: "team-search",
    name: "Search",
    department: "Data & ML",
    leadId: "eng-057",
    capacity: 42,
  },
]
