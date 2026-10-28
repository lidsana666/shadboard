import type { Column } from "@/components/entity-table"
import type { DashboardOverview, TeamRow } from "@/services/dashboard"
import type { Deployment, Incident } from "@/types/engineering"

import { dashboardCopy } from "@/configs/dashboard"
import { formatMetric, formatSeconds } from "@/lib/format"
import { formatDateWithTime } from "@/lib/utils"

import { EntityTable } from "@/components/entity-table"
import { PageState } from "@/components/page-state"
import { Panel } from "@/components/panel"
import { StatusBadge } from "@/components/status-badge"

type Names = DashboardOverview["names"]

export function RecentDeployments({
  rows,
  names,
  allowed,
}: {
  rows: Deployment[]
  names: Names
  allowed: boolean
}) {
  const columns: Column<Deployment>[] = [
    {
      id: "service",
      header: "Service",
      primary: true,
      cell: (d) => names.services[d.serviceId] ?? d.serviceId,
    },
    { id: "version", header: "Version", cell: (d) => d.version },
    { id: "env", header: "Environment", cell: (d) => d.environment },
    {
      id: "status",
      header: "Status",
      cell: (d) => <StatusBadge kind="deploymentStatus" value={d.status} />,
    },
    {
      id: "started",
      header: "Started",
      cell: (d) => formatDateWithTime(d.startedAt),
    },
    {
      id: "duration",
      header: "Duration",
      align: "end",
      cell: (d) => formatSeconds(d.durationSec),
    },
  ]
  return (
    <Panel
      title="Recent deployments"
      description="Latest across all environments"
    >
      {allowed ? (
        <EntityTable
          columns={columns}
          rows={rows}
          rowKey={(d) => d.id}
          caption="Recent deployments"
          empty={dashboardCopy.empty.deployments}
        />
      ) : (
        <PageState
          variant="forbidden"
          description={dashboardCopy.noPermission.deployments}
          compact
        />
      )}
    </Panel>
  )
}

export function RecentIncidents({
  rows,
  names,
  allowed,
}: {
  rows: Incident[]
  names: Names
  allowed: boolean
}) {
  const columns: Column<Incident>[] = [
    { id: "title", header: "Incident", primary: true, cell: (i) => i.title },
    {
      id: "severity",
      header: "Severity",
      cell: (i) => <StatusBadge kind="severity" value={i.severity} />,
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => <StatusBadge kind="incidentStatus" value={i.status} />,
    },
    {
      id: "service",
      header: "Service",
      cell: (i) => names.services[i.serviceId] ?? i.serviceId,
    },
    {
      id: "detected",
      header: "Detected",
      cell: (i) => formatDateWithTime(i.detectedAt),
    },
  ]
  return (
    <Panel title="Recent incidents" description="Latest detected incidents">
      {allowed ? (
        <EntityTable
          columns={columns}
          rows={rows}
          rowKey={(i) => i.id}
          caption="Recent incidents"
          empty={dashboardCopy.empty.incidents}
        />
      ) : (
        <PageState
          variant="forbidden"
          description={dashboardCopy.noPermission.incidents}
          compact
        />
      )}
    </Panel>
  )
}

const teamColumns: Column<TeamRow>[] = [
  { id: "team", header: "Team", primary: true, cell: (t) => t.name },
  { id: "dept", header: "Department", cell: (t) => t.department },
  { id: "eng", header: "Engineers", align: "end", cell: (t) => t.engineers },
  { id: "prs", header: "Open PRs", align: "end", cell: (t) => t.openPrs },
  {
    id: "completion",
    header: "Sprint completion",
    align: "end",
    cell: (t) => `${formatMetric(t.completion, 0)}%`,
  },
  {
    id: "deploys",
    header: "Deploys (30d)",
    align: "end",
    cell: (t) => t.deploymentsLast30d,
  },
  {
    id: "incidents",
    header: "Open incidents",
    align: "end",
    cell: (t) => t.openIncidents,
  },
]

/** Team-level only: nothing here ranks or profiles individual engineers. */
export function TeamPerformance({ rows }: { rows: TeamRow[] }) {
  return (
    <Panel title="Team performance" description="Team-level delivery overview">
      <EntityTable
        columns={teamColumns}
        rows={rows}
        rowKey={(t) => t.id}
        caption="Team performance overview"
        empty={dashboardCopy.empty.teams}
      />
    </Panel>
  )
}
