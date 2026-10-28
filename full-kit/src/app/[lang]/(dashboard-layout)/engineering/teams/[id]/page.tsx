import Link from "next/link"
import { notFound } from "next/navigation"

import type { Metadata } from "next"

import { teamsCopy } from "@/configs/teams"
import { spacing } from "@/configs/tokens"
import { ensureLocalizedPathname } from "@/lib/i18n"

import { loadTeam } from "./_components/load"
import {
  Docs,
  Incidents,
  Members,
  Overview,
  Performance,
  Projects,
  Repositories,
  Roadmap,
  Services,
  SprintTab,
} from "./_components/sections"
import { TeamTabs } from "./_components/team-tabs"
import { PageState } from "@/components/page-state"
import { StatusBadge } from "@/components/status-badge"

export const metadata: Metadata = {
  title: "Team",
}

// Data depends on the signed-in role, so never prerender it.
export const dynamic = "force-dynamic"

export default async function TeamPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  const loaded = await loadTeam(id)
  if (loaded.state === "missing") notFound()
  if (loaded.state === "forbidden") {
    return (
      <section className={spacing.page}>
        <PageState variant="forbidden" />
      </section>
    )
  }

  const { page } = loaded
  const { detail: d, access } = page
  const s = d.summary

  return (
    <section className={spacing.page}>
      <header className="grid gap-1">
        <Link
          href={ensureLocalizedPathname("/engineering/teams", lang)}
          className="w-fit rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden="true">&larr; </span>
          {teamsCopy.detail.back}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{s.name}</h1>
          <StatusBadge kind="health" value={s.health} />
        </div>
        <p className="text-sm text-muted-foreground">{s.department}</p>
      </header>
      <TeamTabs
        panels={{
          overview: <Overview d={d} />,
          members: <Members d={d} />,
          projects: <Projects d={d} />,
          services: <Services d={d} />,
          repositories: <Repositories d={d} access={access} />,
          roadmap: <Roadmap d={d} />,
          sprint: <SprintTab d={d} />,
          performance: <Performance d={d} access={access} />,
          incidents: <Incidents d={d} access={access} />,
          docs: <Docs d={d} />,
        }}
      />
    </section>
  )
}
