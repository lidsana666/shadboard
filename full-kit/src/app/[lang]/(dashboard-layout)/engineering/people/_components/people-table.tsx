"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import type { Column } from "@/components/entity-table"
import type { PeopleColId, PeopleColumnDef } from "@/configs/people"
import type { PersonRow } from "@/services/people"

import {
  peopleColumns,
  peopleCopy,
  peopleFilters,
  peoplePageSize,
} from "@/configs/people"
import { ensureLocalizedPathname } from "@/lib/i18n"

import { EntityList } from "@/components/entity-list"

type Cell = Pick<Column<PersonRow>, "cell" | "sort">

const text = (p: PersonRow) => [p.name, p.email, p.role, p.team, p.location]

export function PeopleTable({
  rows,
  initial,
}: {
  rows: PersonRow[]
  initial: { query: string; picked: Record<string, string> }
}) {
  const { lang } = useParams<{ lang: string }>()

  const cells: Record<PeopleColId, Cell> = {
    name: { cell: (p) => p.name, sort: (p) => p.name },
    role: { cell: (p) => p.role, sort: (p) => p.role },
    team: {
      cell: (p) => (
        <Link
          href={ensureLocalizedPathname(`/engineering/teams/${p.teamId}`, lang)}
          className="rounded-sm hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {p.team}
        </Link>
      ),
      sort: (p) => p.team,
    },
    duties: {
      cell: (p) =>
        p.duties.length ? p.duties.join(", ") : peopleCopy.noDuties,
    },
    location: { cell: (p) => p.location, sort: (p) => p.location },
    email: { cell: (p) => p.email, sort: (p) => p.email },
    status: { cell: (p) => p.status, sort: (p) => p.status },
  }

  const columns: Column<PersonRow>[] = peopleColumns.map((c) => {
    const def: PeopleColumnDef = c
    const { cell, sort } = cells[c.id]
    return {
      id: c.id,
      header: c.header,
      primary: def.primary,
      cell,
      sort: def.sortable ? sort : undefined,
    }
  })

  return (
    <EntityList
      rows={rows}
      columns={columns}
      rowKey={(p) => p.id}
      caption={peopleCopy.caption}
      text={text}
      filters={peopleFilters}
      pageSize={peoplePageSize}
      search={peopleCopy.search}
      searchLabel={peopleCopy.searchLabel}
      empty={peopleCopy.empty}
      none={peopleCopy.none}
      initial={initial}
    />
  )
}
