"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import type { Column } from "@/components/entity-table"
import type { ColumnDef, TeamColId } from "@/configs/teams"
import type { TeamSummary } from "@/services/team-model"

import {
  healthRank,
  stackShown,
  teamColumns,
  teamFilters,
  teamPageSize,
  teamsCopy,
} from "@/configs/teams"
import { ensureLocalizedPathname } from "@/lib/i18n"

import { EntityList } from "@/components/entity-list"
import { Meter } from "@/components/meter"
import { StatusBadge } from "@/components/status-badge"

type Cell = Pick<Column<TeamSummary>, "cell" | "sort">

const text = (t: TeamSummary) => [
  t.name,
  t.department,
  t.lead,
  t.manager,
  t.oncall,
  ...t.stack,
]

export function TeamsTable({ rows }: { rows: TeamSummary[] }) {
  const { lang } = useParams<{ lang: string }>()

  const cells: Record<TeamColId, Cell> = {
    name: {
      cell: (t) => (
        <Link
          href={ensureLocalizedPathname(`/engineering/teams/${t.id}`, lang)}
          className="rounded-sm font-medium hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.name}
        </Link>
      ),
      sort: (t) => t.name,
    },
    lead: { cell: (t) => t.lead, sort: (t) => t.lead },
    manager: { cell: (t) => t.manager, sort: (t) => t.manager },
    members: { cell: (t) => t.members, sort: (t) => t.members },
    projects: { cell: (t) => t.projects, sort: (t) => t.projects },
    services: { cell: (t) => t.services, sort: (t) => t.services },
    repos: { cell: (t) => t.repos, sort: (t) => t.repos },
    stack: {
      cell: (t) =>
        t.stack.length === 0
          ? "-"
          : t.stack.length > stackShown
            ? `${t.stack.slice(0, stackShown).join(", ")} +${t.stack.length - stackShown}`
            : t.stack.join(", "),
    },
    capacity: {
      cell: (t) => (
        <div className="grid min-w-28 gap-1">
          <span className="text-xs tabular-nums">
            {t.committed}/{t.capacity} pts ({t.load}%)
          </span>
          <Meter
            value={t.load}
            tone={t.loadTone}
            label={`${t.name} sprint load`}
          />
        </div>
      ),
      sort: (t) => t.load,
    },
    sprint: { cell: (t) => t.sprint ?? "-", sort: (t) => t.sprint ?? "" },
    health: {
      cell: (t) => <StatusBadge kind="health" value={t.health} />,
      sort: (t) => healthRank(t.health),
    },
    oncall: { cell: (t) => t.oncall, sort: (t) => t.oncall },
  }

  const columns: Column<TeamSummary>[] = teamColumns.map((c) => {
    const def: ColumnDef = c
    const { cell, sort } = cells[c.id]
    return {
      id: c.id,
      header: c.header,
      align: def.align,
      primary: def.primary,
      cell,
      sort: def.sortable ? sort : undefined,
    }
  })

  return (
    <EntityList
      rows={rows}
      columns={columns}
      rowKey={(t) => t.id}
      caption={teamsCopy.list.caption}
      text={text}
      filters={teamFilters}
      pageSize={teamPageSize}
      search={teamsCopy.list.search}
      searchLabel={teamsCopy.list.searchLabel}
      empty={teamsCopy.list.empty}
      none={teamsCopy.list.none}
    />
  )
}
