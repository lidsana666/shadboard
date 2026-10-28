import type {
  DynamicIconNameType,
  NavigationNestedItem,
  NavigationRootItem,
  NavigationType,
} from "@/types"

import { isActivePathname } from "@/lib/utils"

export interface NavEntry {
  href: string
  title: string
  label?: string
  iconName?: DynamicIconNameType
  /** Titles from the section down to (not including) this entry. */
  trail: string[]
}

/** Every linkable item in the navigation tree, in display order. */
export function flattenNav(sections: readonly NavigationType[]): NavEntry[] {
  const out: NavEntry[] = []

  const visit = (
    item: NavigationRootItem | NavigationNestedItem,
    trail: string[]
  ) => {
    if (item.items) {
      for (const child of item.items) visit(child, [...trail, item.title])
      return
    }
    if (!item.href) return
    out.push({
      href: item.href,
      title: item.title,
      label: item.label,
      iconName: "iconName" in item ? item.iconName : undefined,
      trail,
    })
  }

  for (const section of sections) {
    for (const item of section.items) visit(item, [section.title])
  }
  return out
}

/** The entry whose href is the longest match for an unlocalized pathname. */
export function findNavEntry(
  entries: readonly NavEntry[],
  pathname: string
): NavEntry | undefined {
  return entries
    .filter((e) => isActivePathname(e.href, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0]
}

/** Drop the leading locale segment: `/en/apps/chat` -> `/apps/chat`. */
export function stripLocale(pathname: string): string {
  const rest = pathname.split("/").slice(2).join("/")
  return `/${rest}`
}
