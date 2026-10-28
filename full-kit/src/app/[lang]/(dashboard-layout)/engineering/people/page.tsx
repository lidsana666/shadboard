import { listPeople } from "@/services/people"

import type { Metadata } from "next"

import { peopleCopy, peopleFilters } from "@/configs/people"
import { spacing } from "@/configs/tokens"
import { ForbiddenError } from "@/lib/rbac"

import { PeopleTable } from "./_components/people-table"
import { PageState } from "@/components/page-state"

export const metadata: Metadata = {
  title: peopleCopy.title,
}

// Data depends on the signed-in role, so never prerender it.
export const dynamic = "force-dynamic"

type Params = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? ""

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Params>
}) {
  let rows: Awaited<ReturnType<typeof listPeople>>
  try {
    rows = await listPeople()
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

  // Deep links: ?q= searches, and any filter key (?team=, ?role=, ?location=) preselects it.
  const params = await searchParams
  const query = first(params.q)
  const picked = Object.fromEntries(
    peopleFilters.flatMap((f) => {
      const value = first(params[f.key])
      return value ? [[f.key, value]] : []
    })
  )

  return (
    <section className={spacing.page}>
      <header className="grid gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight">
          {peopleCopy.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {peopleCopy.description}
        </p>
      </header>
      <PeopleTable
        key={JSON.stringify([query, picked])}
        rows={rows}
        initial={{ query, picked }}
      />
    </section>
  )
}
