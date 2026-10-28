"use client"

import type { DictionaryType } from "@/lib/get-dictionary"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppBreadcrumb } from "../app-breadcrumb"
import { CommandMenu } from "../command-menu"
import { HeaderActions } from "../header-actions"
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar"

export function VerticalLayoutHeader({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
      <div className="flex h-14 items-center gap-2 px-4">
        <ToggleMobileSidebar />
        <SidebarTrigger className="hidden md:flex" />
        <div className="min-w-0 flex-1">
          <AppBreadcrumb dictionary={dictionary} />
        </div>
        <CommandMenu
          dictionary={dictionary}
          buttonClassName="hidden h-8 w-56 md:flex"
        />
        <HeaderActions dictionary={dictionary} />
      </div>
    </header>
  )
}
