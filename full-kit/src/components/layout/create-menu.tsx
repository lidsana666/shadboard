"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Plus } from "lucide-react"

import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"

import { useShell } from "@/contexts/shell-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DynamicIcon } from "@/components/dynamic-icon"

/** Header "Create" dropdown. Lists only the actions the signed-in role may perform. */
export function CreateMenu() {
  const { data } = useShell()
  const params = useParams()
  const locale = params.lang as LocaleType

  if (data.createActions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Create</span>
          <span className="sr-only sm:hidden">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {data.createActions.map((action) => (
          <DropdownMenuItem key={action.id} asChild>
            <Link href={ensureLocalizedPathname(action.href, locale)}>
              <DynamicIcon name={action.iconName} className="me-2 size-4" />
              {action.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
