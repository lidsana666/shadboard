"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"

import type { DictionaryType } from "@/lib/get-dictionary"

import { navigationsData } from "@/data/navigations"

import { findNavEntry, flattenNav, stripLocale } from "@/lib/navigation"
import { getDictionaryValue, titleCaseToCamelCase } from "@/lib/utils"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const entries = flattenNav(navigationsData)

const humanize = (segment: string) =>
  segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

/** Section > group > page trail from the navigation tree; path segments for unlisted pages. */
export function AppBreadcrumb({ dictionary }: { dictionary: DictionaryType }) {
  const pathname = usePathname()

  const path = stripLocale(pathname)
  const entry = findNavEntry(entries, path)
  const translate = (title: string) =>
    getDictionaryValue(titleCaseToCamelCase(title), dictionary.navigation)

  const crumbs = entry
    ? [...entry.trail.map(translate), translate(entry.title)]
    : path.split("/").filter(Boolean).map(humanize)

  if (crumbs.length === 0) return null

  const last = crumbs.length - 1

  return (
    <Breadcrumb aria-label="Breadcrumb" className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, i) => (
          <Fragment key={`${crumb}-${i}`}>
            <BreadcrumbItem
              className={i === last ? "min-w-0" : "hidden md:inline-flex"}
            >
              {i === last ? (
                <BreadcrumbPage className="truncate">{crumb}</BreadcrumbPage>
              ) : (
                <span>{crumb}</span>
              )}
            </BreadcrumbItem>
            {i < last && <BreadcrumbSeparator className="hidden md:block" />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
