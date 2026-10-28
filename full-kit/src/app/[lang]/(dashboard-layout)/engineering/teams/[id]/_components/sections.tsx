import Link from "next/link"

import type { Column } from "@/components/entity-table"
import type { TeamPage } from "@/services/teams"
import type { ReactNode } from "react"

import { deploymentChart, incidentChart, sloTone } from "@/configs/dashboard"
import { teamsCopy, velocityChart } from "@/configs/teams"
import { formatMetric } from "@/lib/format"
import { ensureLocalizedPathname } from "@/lib/i18n"
import { formatDate, formatDateShort } from "@/lib/utils"

import { ChartCard } from "@/components/charts/chart-card"
import { EntityTable } from "@/components/entity-table"
import { KpiCard } from "@/components/kpi-card"
import { Meter } from "@/components/meter"
import { PageState } from "@/components/page-state"
import { Panel } from "@/components/panel"
import { StatusBadge } from "@/components/status-badge"

type Detail = TeamPage["detail"]
type Access = TeamPage["access"]

const { empty, notAllowed } = teamsCopy.detail

/** A table in a panel, or the no-permission state when the role may not see the data. */
function TableSection<T>({
  title,
  description,
  allowed,
  denied,
  columns,
  rows,
  rowKey,
  none,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
  allowed: boolean
  denied: string
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  none: string
}) {
  return (
    <Panel title={title} description={description} action={action}>
      {allowed ? (
        <EntityTable
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          caption={title}
          empty={none}
        />
      ) : (
        <PageState variant="forbidden" description={denied} compact />
      )}
    </Panel>
  )
}

const always = true

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

export function Overview({ d }: { d: Detail }) {
  const s = d.summary
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Team" description={s.department}>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact term="Engineering manager">{s.manager}</Fact>
          <Fact term="Tech lead">{s.lead}</Fact>
          <Fact term="On-call">{s.oncall}</Fact>
          <Fact term="Members">{s.members}</Fact>
          <Fact term="Projects">{s.projects}</Fact>
          <Fact term="Services">{s.services}</Fact>
          <Fact term="Repositories">{s.repos}</Fact>
          <Fact term="Stack">{s.stack.join(", ") || "-"}</Fact>
          <Fact term="Open incidents">{s.open}</Fact>
        </dl>
      </Panel>
      <Panel
        title="Current sprint"
        description={s.sprint ?? "No active sprint"}
      >
        {s.pace ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <div className="flex justify-between text-xs">
                <span>Completed</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatMetric(s.pace.completion, 0)}% done,{" "}
                  {formatMetric(s.pace.elapsed, 0)}% elapsed
                </span>
              </div>
              <Meter
                value={s.pace.completion}
                marker={s.pace.elapsed}
                tone={s.pace.tone}
                label={`${s.sprint}: ${Math.round(s.pace.completion)}% complete, ${Math.round(s.pace.elapsed)}% of time elapsed`}
              />
            </div>
            <div className="grid gap-1.5">
              <div className="flex justify-between text-xs">
                <span>Load against capacity</span>
                <span className="tabular-nums text-muted-foreground">
                  {s.committed}/{s.capacity} pts ({s.load}%)
                </span>
              </div>
              <Meter
                value={s.load}
                tone={s.loadTone}
                label={`${s.sprint} sprint load`}
              />
            </div>
            <StatusBadge kind="health" value={s.health} />
          </div>
        ) : (
          <PageState variant="empty" description={empty.sprints} compact />
        )}
      </Panel>
    </div>
  )
}

const memberColumns = (lang: string): Column<Detail["members"][number]>[] => [
  {
    id: "name",
    header: "Name",
    primary: true,
    cell: (m) => (
      <Link
        href={ensureLocalizedPathname(
          `/engineering/people?q=${encodeURIComponent(m.email)}`,
          lang
        )}
        className="rounded-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {m.name}
      </Link>
    ),
  },
  { id: "title", header: "Title", cell: (m) => m.title },
  {
    id: "roles",
    header: "Team roles",
    cell: (m) => (m.roles.length ? m.roles.join(", ") : "-"),
  },
  { id: "location", header: "Location", cell: (m) => m.location },
  { id: "email", header: "Email", cell: (m) => m.email },
  {
    id: "active",
    header: "Status",
    cell: (m) => (m.active ? "Active" : "Inactive"),
  },
]

export function Members({ d, lang }: { d: Detail; lang: string }) {
  return (
    <TableSection
      title="Members"
      description="People in this team and the roles they hold"
      allowed={always}
      denied=""
      action={
        <Link
          href={ensureLocalizedPathname(
            `/engineering/people?team=${encodeURIComponent(d.summary.name)}`,
            lang
          )}
          className="rounded-sm text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          View in People directory
        </Link>
      }
      columns={memberColumns(lang)}
      rows={d.members}
      rowKey={(m) => m.id}
      none={empty.members}
    />
  )
}

const projectColumns: Column<Detail["projects"][number]>[] = [
  {
    id: "name",
    header: "Project",
    primary: true,
    cell: (p) => `${p.key} ${p.name}`,
  },
  { id: "owner", header: "Owner", cell: (p) => p.owner },
  {
    id: "status",
    header: "Status",
    cell: (p) => <StatusBadge kind="projectStatus" value={p.status} />,
  },
  {
    id: "health",
    header: "Health",
    cell: (p) => <StatusBadge kind="health" value={p.health} />,
  },
  {
    id: "progress",
    header: "Progress",
    cell: (p) => (
      <div className="grid min-w-24 gap-1">
        <span className="text-xs tabular-nums">{p.progress}%</span>
        <Meter value={p.progress} tone="info" label={`${p.name} progress`} />
      </div>
    ),
  },
  { id: "target", header: "Target", cell: (p) => formatDate(p.targetDate) },
]

export function Projects({ d }: { d: Detail }) {
  return (
    <TableSection
      title="Projects"
      description="Projects owned by this team"
      allowed={always}
      denied=""
      columns={projectColumns}
      rows={d.projects}
      rowKey={(p) => p.id}
      none={empty.projects}
    />
  )
}

const serviceColumns: Column<Detail["services"][number]>[] = [
  { id: "name", header: "Service", primary: true, cell: (s) => s.name },
  { id: "tier", header: "Tier", cell: (s) => s.tier },
  {
    id: "status",
    header: "Status",
    cell: (s) => <StatusBadge kind="serviceStatus" value={s.status} />,
  },
  {
    id: "availability",
    header: "Availability (30d)",
    align: "end",
    cell: (s) => (
      <StatusBadge
        tone={sloTone(s.availability, s.sloTarget)}
        label={`${formatMetric(s.availability, 2)}%`}
      />
    ),
  },
  {
    id: "slo",
    header: "SLO",
    align: "end",
    cell: (s) => `${formatMetric(s.sloTarget, 2)}%`,
  },
]

export function Services({ d }: { d: Detail }) {
  return (
    <TableSection
      title="Services"
      description="Services this team owns and their availability against SLO"
      allowed={always}
      denied=""
      columns={serviceColumns}
      rows={d.services}
      rowKey={(s) => s.id}
      none={empty.services}
    />
  )
}

const repoColumns: Column<Detail["repos"][number]>[] = [
  { id: "name", header: "Repository", primary: true, cell: (r) => r.name },
  { id: "service", header: "Service", cell: (r) => r.service },
  { id: "language", header: "Language", cell: (r) => r.language },
  { id: "prs", header: "Open PRs", align: "end", cell: (r) => r.openPrs },
  {
    id: "coverage",
    header: "Coverage",
    align: "end",
    cell: (r) => `${formatMetric(r.coverage, 0)}%`,
  },
]

export function Repositories({ d, access }: { d: Detail; access: Access }) {
  return (
    <TableSection
      title="Repositories"
      description="Code owned by this team"
      allowed={access.repositories}
      denied={notAllowed.repositories}
      columns={repoColumns}
      rows={d.repos}
      rowKey={(r) => r.id}
      none={empty.repositories}
    />
  )
}

const releaseColumns: Column<Detail["releases"][number]>[] = [
  {
    id: "name",
    header: "Release",
    primary: true,
    cell: (r) => `${r.name} ${r.version}`,
  },
  { id: "project", header: "Project", cell: (r) => r.project },
  {
    id: "status",
    header: "Status",
    cell: (r) => <StatusBadge kind="releaseStatus" value={r.status} />,
  },
  {
    id: "readiness",
    header: "Readiness",
    cell: (r) => (
      <div className="grid min-w-24 gap-1">
        <span className="text-xs tabular-nums">{r.readiness}%</span>
        <Meter value={r.readiness} tone="info" label={`${r.name} readiness`} />
      </div>
    ),
  },
  { id: "target", header: "Target", cell: (r) => formatDate(r.targetDate) },
]

const riskColumns: Column<Detail["risks"][number]>[] = [
  { id: "title", header: "Risk", primary: true, cell: (r) => r.title },
  {
    id: "level",
    header: "Level",
    cell: (r) => <StatusBadge kind="riskLevel" value={r.level} />,
  },
  { id: "project", header: "Project", cell: (r) => r.project },
  { id: "owner", header: "Owner", cell: (r) => r.owner },
  { id: "opened", header: "Opened", cell: (r) => formatDate(r.openedAt) },
]

export function Roadmap({ d }: { d: Detail }) {
  return (
    <>
      <TableSection
        title="Upcoming releases"
        description="Releases of this team's projects, by target date"
        allowed={always}
        denied=""
        columns={releaseColumns}
        rows={d.releases}
        rowKey={(r) => r.id}
        none={empty.releases}
      />
      <TableSection
        title="Open risks"
        description="Risks raised against this team's projects"
        allowed={always}
        denied=""
        columns={riskColumns}
        rows={d.risks}
        rowKey={(r) => r.id}
        none={empty.roadmap}
      />
    </>
  )
}

const sprintColumns: Column<Detail["sprints"][number]>[] = [
  { id: "name", header: "Sprint", primary: true, cell: (s) => s.name },
  {
    id: "status",
    header: "Status",
    cell: (s) => <StatusBadge kind="sprintStatus" value={s.status} />,
  },
  {
    id: "dates",
    header: "Dates",
    cell: (s) =>
      `${formatDateShort(s.startDate)} - ${formatDateShort(s.endDate)}`,
  },
  {
    id: "committed",
    header: "Committed",
    align: "end",
    cell: (s) => s.committed,
  },
  {
    id: "completed",
    header: "Completed",
    align: "end",
    cell: (s) => s.completed,
  },
  { id: "added", header: "Added", align: "end", cell: (s) => s.added },
  { id: "removed", header: "Removed", align: "end", cell: (s) => s.removed },
]

export function SprintTab({ d }: { d: Detail }) {
  return (
    <>
      <ChartCard data={d.velocity} spec={velocityChart} />
      <TableSection
        title="Sprints"
        description="Newest first"
        allowed={always}
        denied=""
        columns={sprintColumns}
        rows={d.sprints}
        rowKey={(s) => s.id}
        none={empty.sprints}
      />
    </>
  )
}

export function Performance({ d, access }: { d: Detail; access: Access }) {
  const delivery = access.deployments && access.incidents
  return (
    <>
      {delivery ? (
        <section
          aria-label="Team delivery metrics"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {d.kpis.map((k) => (
            <KpiCard key={k.id} kpi={k} />
          ))}
        </section>
      ) : (
        <Panel title="Delivery metrics">
          <PageState
            variant="forbidden"
            description={
              access.deployments ? notAllowed.incidents : notAllowed.deployments
            }
            compact
          />
        </Panel>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {access.deployments ? (
          <ChartCard data={d.outcomes} spec={deploymentChart} />
        ) : (
          <Panel title={deploymentChart.title}>
            <PageState
              variant="forbidden"
              description={notAllowed.deployments}
              compact
            />
          </Panel>
        )}
        {access.incidents ? (
          <ChartCard data={d.severities} spec={incidentChart} />
        ) : (
          <Panel title={incidentChart.title}>
            <PageState
              variant="forbidden"
              description={notAllowed.incidents}
              compact
            />
          </Panel>
        )}
      </div>
      <ChartCard data={d.velocity} spec={velocityChart} />
    </>
  )
}

const incidentColumns: Column<Detail["incidents"][number]>[] = [
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
  { id: "service", header: "Service", cell: (i) => i.service },
  { id: "commander", header: "Commander", cell: (i) => i.commander },
  { id: "detected", header: "Detected", cell: (i) => formatDate(i.detectedAt) },
]

export function Incidents({ d, access }: { d: Detail; access: Access }) {
  return (
    <TableSection
      title="Incidents"
      description="Newest first"
      allowed={access.incidents}
      denied={notAllowed.incidents}
      columns={incidentColumns}
      rows={d.incidents}
      rowKey={(i) => i.id}
      none={empty.incidents}
    />
  )
}

const docColumns: Column<Detail["docs"][number]>[] = [
  { id: "title", header: "Document", primary: true, cell: (x) => x.title },
  { id: "kind", header: "Type", cell: (x) => x.kind },
  { id: "owner", header: "Owner", cell: (x) => x.owner },
  { id: "updated", header: "Updated", cell: (x) => formatDate(x.updatedAt) },
]

export function Docs({ d }: { d: Detail }) {
  return (
    <TableSection
      title="Documentation"
      description="Runbooks, decisions and designs, most recently updated first"
      allowed={always}
      denied=""
      columns={docColumns}
      rows={d.docs}
      rowKey={(x) => x.id}
      none={empty.docs}
    />
  )
}
