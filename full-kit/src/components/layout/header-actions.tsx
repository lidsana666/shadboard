"use client"

import { useParams } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { LanguageDropdown } from "@/components/language-dropdown"
import { FullscreenToggle } from "@/components/layout/full-screen-toggle"
import { NotificationDropdown } from "@/components/layout/notification-dropdown"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { ModeDropdown } from "@/components/mode-dropdown"
import { CreateMenu } from "./create-menu"
import { EnvIndicator } from "./env-indicator"

/** The right-hand header cluster, shared by the vertical and horizontal layouts. */
export function HeaderActions({ dictionary }: { dictionary: DictionaryType }) {
  const params = useParams()
  const locale = params.lang as LocaleType

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <EnvIndicator />
      <CreateMenu />
      <NotificationDropdown dictionary={dictionary} />
      <FullscreenToggle />
      <ModeDropdown dictionary={dictionary} />
      <LanguageDropdown dictionary={dictionary} />
      <UserDropdown dictionary={dictionary} locale={locale} />
    </div>
  )
}
