"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { usePathname } from "next/navigation"
import { z } from "zod"

import type { ShellData } from "@/types/shell"
import type { ReactNode } from "react"

import { navigationsData } from "@/data/navigations"

import { shellLimits, shellStorageKeys } from "@/configs/shell"
import { findNavEntry, flattenNav, stripLocale } from "@/lib/navigation"

import { useStoredState } from "@/hooks/use-stored-state"

const idList = z.array(z.string())
const navEntries = flattenNav(navigationsData)

interface ShellContextValue {
  data: ShellData
  /** Unlocalized hrefs, in the order they were starred. */
  favorites: string[]
  toggleFavorite: (href: string) => void
  /** Unlocalized hrefs, most recent first. */
  recents: string[]
  readIds: string[]
  markRead: (ids: string[]) => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellProvider({
  data,
  children,
}: {
  data: ShellData
  children: ReactNode
}) {
  const pathname = usePathname()
  const [favorites, setFavorites] = useStoredState(
    shellStorageKeys.favorites,
    idList,
    []
  )
  const [recents, setRecents] = useStoredState(
    shellStorageKeys.recents,
    idList,
    []
  )
  const [readIds, setReadIds] = useStoredState(
    shellStorageKeys.readNotifications,
    idList,
    []
  )

  // Record the current page in "Recent" when it is a known navigation entry.
  useEffect(() => {
    const entry = findNavEntry(navEntries, stripLocale(pathname))
    if (!entry) return
    setRecents((prev) =>
      prev[0] === entry.href
        ? prev
        : [entry.href, ...prev.filter((h) => h !== entry.href)].slice(
            0,
            shellLimits.recents
          )
    )
  }, [pathname, setRecents])

  const toggleFavorite = useCallback(
    (href: string) =>
      setFavorites((prev) =>
        prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
      ),
    [setFavorites]
  )

  const markRead = useCallback(
    (ids: string[]) =>
      setReadIds((prev) => Array.from(new Set([...prev, ...ids]))),
    [setReadIds]
  )

  const value = useMemo(
    () => ({ data, favorites, toggleFavorite, recents, readIds, markRead }),
    [data, favorites, toggleFavorite, recents, readIds, markRead]
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const context = useContext(ShellContext)
  if (!context) throw new Error("useShell must be used within a ShellProvider")
  return context
}
