"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { NavEntry } from "@/lib/navigation"
import type { SearchHit } from "@/services/search"
import type { LocaleType } from "@/types"
import type { DialogProps } from "@radix-ui/react-dialog"

import { navigationsData } from "@/data/navigations"

import { searchKindIcons, shellLimits } from "@/configs/shell"
import { ensureLocalizedPathname } from "@/lib/i18n"
import { flattenNav } from "@/lib/navigation"
import { cn, getDictionaryValue, titleCaseToCamelCase } from "@/lib/utils"

import { useShell } from "@/contexts/shell-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"
import { Keyboard } from "@/components/ui/keyboard"
import { DynamicIcon } from "@/components/dynamic-icon"

interface CommandMenuProps extends DialogProps {
  dictionary: DictionaryType
  buttonClassName?: string
}

const entries = flattenNav(navigationsData)

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement)
  )
}

export function CommandMenu({
  buttonClassName,
  dictionary,
  ...props
}: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [found, setFound] = useState<{ query: string; hits: SearchHit[] }>({
    query: "",
    hits: [],
  })
  const router = useRouter()
  const params = useParams()
  const { data, favorites, recents } = useShell()

  const locale = params.lang as LocaleType
  const term = query.trim()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (isTypingTarget(e.target)) return
        e.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Entity search: debounced, cancelled when the query changes or the dialog closes.
  useEffect(() => {
    if (!open || term.length < shellLimits.searchMinChars) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const hits: SearchHit[] = await res.json()
        setFound({ query: term, hits })
      } catch {
        // Aborted or offline: keep the page results.
      }
    }, shellLimits.searchDebounceMs)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [open, term])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery("")
      router.push(ensureLocalizedPathname(href, locale))
    },
    [locale, router]
  )

  const byHref = useMemo(() => new Map(entries.map((e) => [e.href, e])), [])
  const pick = (hrefs: string[]) => hrefs.flatMap((h) => byHref.get(h) ?? [])

  const hits = found.query === term ? found.hits : []
  const pageTitle = (e: NavEntry) =>
    getDictionaryValue(titleCaseToCamelCase(e.title), dictionary.navigation)

  const pageItem = (e: NavEntry, prefix: string) => (
    <CommandItem
      key={`${prefix}-${e.href}`}
      value={`${prefix} ${pageTitle(e)} ${e.trail.join(" ")}`}
      onSelect={() => go(e.href)}
    >
      <DynamicIcon name={e.iconName ?? "Circle"} />
      <span>{pageTitle(e)}</span>
      {e.trail.length > 1 && (
        <span className="text-xs text-muted-foreground">
          {e.trail.slice(1).join(" / ")}
        </span>
      )}
    </CommandItem>
  )

  const favoriteEntries = pick(favorites)
  const recentEntries = pick(recents)

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "max-w-64 w-full justify-start px-3 rounded-md bg-muted/50 text-muted-foreground",
          buttonClassName
        )}
        onClick={() => setOpen(true)}
        aria-label={dictionary.search.search}
        {...props}
      >
        <Search className="me-2 h-4 w-4" />
        <span>{dictionary.search.search}</span>
        <Keyboard className="ms-auto">K</Keyboard>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} {...props}>
        <DialogTitle className="sr-only">
          {dictionary.search.search}
        </DialogTitle>
        <CommandInput
          placeholder={dictionary.search.typeCommand}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[320px]">
          <CommandEmpty>{dictionary.search.noResults}</CommandEmpty>
          {hits.length > 0 && (
            <CommandGroup heading="Results">
              {hits.map((hit) => (
                <CommandItem
                  key={`${hit.kind}-${hit.id}`}
                  value={`hit ${hit.title} ${hit.subtitle} ${term}`}
                  onSelect={() => go(hit.href)}
                >
                  <DynamicIcon name={searchKindIcons[hit.kind]} />
                  <span>{hit.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {hit.subtitle}
                  </span>
                  <Badge variant="secondary" className="ms-auto">
                    {hit.kind}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {data.createActions.length > 0 && (
            <CommandGroup heading="Create">
              {data.createActions.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`create ${a.label}`}
                  onSelect={() => go(a.href)}
                >
                  <DynamicIcon name={a.iconName} />
                  <span>{a.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {favoriteEntries.length > 0 && (
            <CommandGroup heading="Favorites">
              {favoriteEntries.map((e) => pageItem(e, "favorite"))}
            </CommandGroup>
          )}
          {recentEntries.length > 0 && (
            <CommandGroup heading="Recent">
              {recentEntries.map((e) => pageItem(e, "recent"))}
            </CommandGroup>
          )}
          {navigationsData.map(({ title: s }) => (
            <CommandGroup
              key={s}
              heading={getDictionaryValue(
                titleCaseToCamelCase(s),
                dictionary.navigation
              )}
            >
              {entries
                .filter((e) => e.trail[0] === s)
                .map((e) => pageItem(e, "page"))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
