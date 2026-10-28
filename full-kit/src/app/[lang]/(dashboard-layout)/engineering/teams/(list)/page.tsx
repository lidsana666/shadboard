import { listTeamRows } from "@/services/teams"

import type { Metadata } from "next"

import { teamsCopy } from "@/configs/teams"
import { spacing } from "@/configs/tokens"
import { ForbiddenError } from "@/lib/rbac"

import { TeamsTable } from "./_components/teams-table"
import { PageState } from "@/components/page-state"

export const metadata: Metadata = {
  title: teamsCopy.list.title,
}

// Data depends on the signed-in role, so never prerender it.
export const dynamic = "force-dynamic"

export default async function TeamsPage() {
  let rows: Awaited<ReturnType<typeof listTeamRows>>
  try {
    rows = await listTeamRows()
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

  return (
    <section className={spacing.page}>
      <header className="grid gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight">
          {teamsCopy.list.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {teamsCopy.list.description}
        </p>
      </header>
      <TeamsTable rows={rows} />
    </section>
  )
}
