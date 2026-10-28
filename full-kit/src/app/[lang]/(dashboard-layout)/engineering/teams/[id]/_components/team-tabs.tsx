"use client"

import type { TeamTabId } from "@/configs/teams"
import type { ReactNode } from "react"

import { teamTabs, teamsCopy } from "@/configs/teams"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Tab chrome only: the content of every tab is rendered on the server and passed in. */
export function TeamTabs({ panels }: { panels: Record<TeamTabId, ReactNode> }) {
  return (
    <Tabs defaultValue={teamTabs[0].id} className="gap-4">
      <div className="overflow-x-auto pb-1">
        <TabsList aria-label={teamsCopy.detail.tabs} className="w-max">
          {teamTabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {teamTabs.map((t) => (
        <TabsContent key={t.id} value={t.id} className="grid gap-4">
          {panels[t.id]}
        </TabsContent>
      ))}
    </Tabs>
  )
}
