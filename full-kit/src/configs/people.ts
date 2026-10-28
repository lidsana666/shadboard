/** Everything the people directory says or decides, as data. */
export const peopleCopy = {
  title: "People",
  description: "Engineers by role, team and location.",
  caption: "Engineers",
  search: "Search name, email or team",
  searchLabel: "Search people",
  empty: "No people match the current search and filters.",
  none: "No people yet.",
  active: "Active",
  inactive: "Inactive",
  noDuties: "-",
} as const

export interface PeopleColumnDef {
  id: string
  header: string
  /** Title of the mobile card; never hidden. */
  primary?: boolean
  sortable?: boolean
}

export const peopleColumns = [
  { id: "name", header: "Name", primary: true, sortable: true },
  { id: "role", header: "Role", sortable: true },
  { id: "team", header: "Team", sortable: true },
  { id: "duties", header: "Team duties" },
  { id: "location", header: "Location", sortable: true },
  { id: "email", header: "Email", sortable: true },
  { id: "status", header: "Status", sortable: true },
] as const satisfies readonly PeopleColumnDef[]
export type PeopleColId = (typeof peopleColumns)[number]["id"]

/** Filters on the directory: row field and label. Options come from the data. */
export const peopleFilters = [
  { key: "role", label: "Role" },
  { key: "team", label: "Team" },
  { key: "location", label: "Location" },
] as const

/** Rows per page on the directory. */
export const peoplePageSize = 10

/**
 * The directory describes people, never ranks them. A row may not carry any
 * of these measures; a test enforces it against the real service output.
 */
export const forbiddenPersonFields = [
  "score",
  "rank",
  "rating",
  "velocity",
  "productivity",
  "performance",
  "points",
  "commits",
] as const
