import { redirect } from "next/navigation"
import { getShellData } from "@/services/shell"

import type { LocaleType } from "@/types"
import type { ReactNode } from "react"

import { getDictionary } from "@/lib/get-dictionary"
import { ensureLocalizedPathname } from "@/lib/i18n"

import { ShellProvider } from "@/contexts/shell-context"
import { Layout } from "@/components/layout"

export default async function DashboardLayout(props: {
  children: ReactNode
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params

  const { children } = props

  const [dictionary, shell] = await Promise.all([
    getDictionary(params.lang),
    getShellData(),
  ])

  if (!shell) redirect(ensureLocalizedPathname("/sign-in", params.lang))

  return (
    <ShellProvider data={shell}>
      <Layout dictionary={dictionary}>{children}</Layout>
    </ShellProvider>
  )
}
