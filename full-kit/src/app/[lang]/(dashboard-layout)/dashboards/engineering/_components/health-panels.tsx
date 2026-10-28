import type { DashboardOverview } from "@/services/dashboard"

import { dashboardCopy, sloTone, sprintPaceTone } from "@/configs/dashboard"
import { formatMetric } from "@/lib/format"
import { formatDateShort } from "@/lib/utils"

import { Meter } from "@/components/meter"
import { PageState } from "@/components/page-state"
import { Panel } from "@/components/panel"
import { StatusBadge } from "@/components/status-badge"

type Overview = Pick<
  DashboardOverview,
  "sprintHealth" | "releases" | "risks" | "criticalServices"
>

function Rows({
  empty,
  children,
  isEmpty,
}: {
  empty: string
  isEmpty: boolean
  children: React.ReactNode
}) {
  if (isEmpty) return <PageState variant="empty" description={empty} compact />
  return <ul className="grid gap-3">{children}</ul>
}

export function SprintHealthPanel({
  sprints,
}: {
  sprints: Overview["sprintHealth"]
}) {
  return (
    <Panel
      title="Sprint health"
      description="Completed points against time elapsed"
    >
      <Rows isEmpty={sprints.length === 0} empty={dashboardCopy.empty.sprints}>
        {sprints.map((s) => {
          const tone = sprintPaceTone(s.elapsed, s.completion)
          return (
            <li key={s.teamId} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium">{s.team}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {s.completed}/{s.committed} pts
                </span>
              </div>
              <Meter
                value={s.completion}
                marker={s.elapsed}
                tone={tone}
                label={`${s.team} ${s.name}: ${Math.round(s.completion)}% complete, ${Math.round(s.elapsed)}% of time elapsed`}
              />
              <p className="text-xs text-muted-foreground">
                {s.name} · {Math.round(s.completion)}% done ·{" "}
                {Math.round(s.elapsed)}% elapsed · ends{" "}
                {formatDateShort(s.endDate)}
              </p>
            </li>
          )
        })}
      </Rows>
    </Panel>
  )
}

export function ReleasePanel({ releases }: { releases: Overview["releases"] }) {
  return (
    <Panel title="Release status" description="Upcoming releases and readiness">
      <Rows
        isEmpty={releases.length === 0}
        empty={dashboardCopy.empty.releases}
      >
        {releases.map((r) => (
          <li key={r.id} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {r.project} {r.version}
              </span>
              <StatusBadge kind="releaseStatus" value={r.status} />
            </div>
            <Meter
              value={r.readiness}
              tone={
                r.readiness >= 90
                  ? "success"
                  : r.readiness >= 60
                    ? "warning"
                    : "danger"
              }
              label={`${r.name} readiness ${r.readiness}%`}
            />
            <p className="text-xs text-muted-foreground">
              {r.readiness}% ready · target {formatDateShort(r.targetDate)}
            </p>
          </li>
        ))}
      </Rows>
    </Panel>
  )
}

export function RiskPanel({ risks }: { risks: Overview["risks"] }) {
  return (
    <Panel
      title="Engineering risks"
      description="Open risks, most severe first"
    >
      <Rows isEmpty={risks.length === 0} empty={dashboardCopy.empty.risks}>
        {risks.map((r) => (
          <li key={r.id} className="grid gap-0.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{r.title}</span>
              <StatusBadge kind="riskLevel" value={r.level} />
            </div>
            <p className="text-xs text-muted-foreground">
              {r.project} · owner {r.owner}
            </p>
          </li>
        ))}
      </Rows>
    </Panel>
  )
}

export function ServicePanel({
  services,
}: {
  services: Overview["criticalServices"]
}) {
  return (
    <Panel
      title="Critical services"
      description="Tier 1 availability against SLO"
    >
      <Rows
        isEmpty={services.length === 0}
        empty={dashboardCopy.empty.services}
      >
        {services.map((s) => {
          const tone = sloTone(s.availability, s.sloTarget)
          return (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatMetric(s.availability, 2)}% · SLO{" "}
                  {formatMetric(s.sloTarget, 2)}%
                  <span className="sr-only">
                    {tone === "success" ? ", meets SLO" : ", below SLO"}
                  </span>
                </p>
              </div>
              <StatusBadge kind="serviceStatus" value={s.status} />
            </li>
          )
        })}
      </Rows>
    </Panel>
  )
}
