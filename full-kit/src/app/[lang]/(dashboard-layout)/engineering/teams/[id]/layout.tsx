import { notFound } from "next/navigation"

import type { ReactNode } from "react"

import { loadTeam } from "./_components/load"

// The 404 must be decided here, outside the page's loading boundary, so the
// response status is a real 404 rather than a streamed 200.
export default async function TeamLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const loaded = await loadTeam(id)
  if (loaded.state === "missing") notFound()
  return children
}
