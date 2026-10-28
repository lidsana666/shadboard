import { getDashboardOverview } from "@/services/dashboard"

import type { Metadata } from "next"

import {
  capacityChart,
  dashboardCopy,
  deliveryChart,
  deploymentChart,
  incidentChart,
} from "@/configs/dashboard"
import { spacing } from "@/configs/tokens"
import { ForbiddenError } from "@/lib/rbac"
import { formatDateWithTime } from "@/lib/utils"

import {
  RecentDeployments,
  RecentIncidents,
  TeamPerformance,
} from "./_components/activity-tables"
import {
  ReleasePanel,
  RiskPanel,
  ServicePanel,
  SprintHealthPanel,
} from "./_components/health-panels"
import { ChartCard } from "@/components/charts/chart-card"
import { KpiCard } from "@/components/kpi-card"
import { PageState } from "@/components/page-state"

export const metadata: Metadata = {
  title: dashboardCopy.title,
}

// Data depends on the signed-in role, so never prerender it.
export const dynamic = "force-dynamic"

export default async function EngineeringDashboardPage() {
  let overview: Awaited<ReturnType<typeof getDashboardOverview>>
  try {
    overview = await getDashboardOverview()
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <section className={spacing.page}>
          <PageState variant="forbidden" />
        </section>
      )
    }
    throw error
  }

  if (overview.teams.length === 0) {
    return (
      <section className={spacing.page}>
        <PageState variant="empty" description={dashboardCopy.empty.teams} />
      </section>
    )
  }

  const { access, names } = overview

  return (
    <section className={spacing.page}>
      <header className="grid gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight">
          {dashboardCopy.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dashboardCopy.description} Data as of{" "}
          {formatDateWithTime(overview.asOf)}.
        </p>
      </header>

      <section aria-label={dashboardCopy.sections.kpis}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {overview.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      <section
        aria-label={dashboardCopy.sections.trends}
        className="grid gap-4 lg:grid-cols-2"
      >
        <ChartCard data={overview.deliveryTrend} spec={deliveryChart} />
        <ChartCard data={overview.deploymentTrend} spec={deploymentChart} />
        <ChartCard data={overview.incidentTrend} spec={incidentChart} />
        <ChartCard data={overview.teamCapacity} spec={capacityChart} />
      </section>

      <section
        aria-label={dashboardCopy.sections.panels}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <SprintHealthPanel sprints={overview.sprintHealth} />
        <ReleasePanel releases={overview.releases} />
        <RiskPanel risks={overview.risks} />
        <ServicePanel services={overview.criticalServices} />
      </section>

      <section
        aria-label={dashboardCopy.sections.activity}
        className="grid gap-4 xl:grid-cols-2"
      >
        <RecentDeployments
          rows={overview.recentDeployments}
          names={names}
          allowed={access.deployments}
        />
        <RecentIncidents
          rows={overview.recentIncidents}
          names={names}
          allowed={access.incidents}
        />
      </section>

      <TeamPerformance rows={overview.teams} />
    </section>
  )
}
