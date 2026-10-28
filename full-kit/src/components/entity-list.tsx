"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Columns3, Search } from "lucide-react"

import type { Column } from "@/components/entity-table"
import type { FieldFilter, SortState } from "@/lib/table"

import {
  filterRows,
  nextSort,
  paginate,
  searchRows,
  sortRows,
} from "@/lib/table"
import { uniq } from "@/lib/uniq"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EntityTable } from "@/components/entity-table"
import { PageState } from "@/components/page-state"

/** Select value meaning "no filter"; real option values come from the data. */
const ALL = "__all__"

export interface ListFilter<T> {
  key: keyof T & string
  label: string
}

interface EntityListProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  caption: string
  /** Strings the search box matches against. */
  text: (row: T) => readonly string[]
  /** Filter dropdowns; their options are the distinct values in `rows`. */
  filters: readonly ListFilter<T>[]
  pageSize: number
  search: string
  searchLabel: string
  /** Shown when search and filters match nothing. */
  empty: string
  /** Shown when there are no rows at all. */
  none: string
  /** Starting search text and filter values, e.g. from a deep link. */
  initial?: { query?: string; picked?: Record<string, string> }
}

/**
 * Search, filter, sort, paginate and show/hide columns over `EntityTable`.
 * The table stays the only renderer; this only decides which rows and columns it gets.
 */
export function EntityList<T>({
  rows,
  columns,
  rowKey,
  caption,
  text,
  filters,
  pageSize,
  search,
  searchLabel,
  empty,
  none,
  initial,
}: EntityListProps<T>) {
  const [query, setQuery] = useState(initial?.query ?? "")
  const [picked, setPicked] = useState<Record<string, string>>(
    initial?.picked ?? {}
  )
  const [sort, setSort] = useState<SortState | null>(null)
  const [page, setPage] = useState(0)
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set())

  const options = useMemo(
    () =>
      filters.map((f) => ({
        ...f,
        values: uniq(rows, f.key).map(String),
      })),
    [rows, filters]
  )

  const view = useMemo(() => {
    const active: FieldFilter<T>[] = filters.flatMap((f) => {
      const value = picked[f.key]
      return value ? [{ key: f.key, value }] : []
    })
    const found = filterRows(searchRows(rows, query, text), active)
    const by = columns.find((c) => c.id === sort?.id)?.sort
    const sorted = sort && by ? sortRows(found, by, sort.dir) : found
    return paginate(sorted, page, pageSize)
  }, [rows, columns, filters, picked, query, text, sort, page, pageSize])

  const primary = columns.find((c) => c.primary) ?? columns[0]
  const shown = columns.filter((c) => c === primary || !hidden.has(c.id))

  // Any change to what is listed starts again from the first page.
  const change =
    <V,>(set: (v: V) => void) =>
    (v: V) => {
      set(v)
      setPage(0)
    }

  if (rows.length === 0) {
    return <PageState variant="empty" description={none} />
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute start-2.5 top-2.5 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => change(setQuery)(e.target.value)}
            placeholder={search}
            aria-label={searchLabel}
            className="h-9 ps-8"
          />
        </div>
        {options.map((f) => (
          <Select
            key={f.key}
            value={picked[f.key] ?? ALL}
            onValueChange={(v) =>
              change(setPicked)({ ...picked, [f.key]: v === ALL ? "" : v })
            }
          >
            <SelectTrigger
              aria-label={`Filter by ${f.label.toLowerCase()}`}
              className="h-9 w-auto min-w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All {f.label.toLowerCase()}</SelectItem>
              {f.values.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ms-auto h-9">
              <Columns3 className="size-4" aria-hidden />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Show columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns
              .filter((c) => c !== primary)
              .map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={!hidden.has(c.id)}
                  onCheckedChange={(on) =>
                    setHidden((prev) => {
                      const next = new Set(prev)
                      if (on) next.delete(c.id)
                      else next.add(c.id)
                      return next
                    })
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EntityTable
        columns={shown}
        rows={view.rows}
        rowKey={rowKey}
        caption={caption}
        empty={empty}
        sort={sort}
        onSort={(id) => setSort((s) => nextSort(s, id))}
      />

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <p aria-live="polite">
          {view.total === 0
            ? "No results"
            : `Showing ${view.from}-${view.to} of ${view.total}`}
        </p>
        <nav
          aria-label={`${caption} pages`}
          className="flex items-center gap-1"
        >
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Previous page"
            disabled={view.page === 0}
            onClick={() => setPage(view.page - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="px-2 tabular-nums">
            Page {view.page + 1} of {view.pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Next page"
            disabled={view.page >= view.pages - 1}
            onClick={() => setPage(view.page + 1)}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      </div>
    </div>
  )
}
