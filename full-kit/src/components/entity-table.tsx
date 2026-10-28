import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import type { SortState } from "@/lib/table"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageState } from "@/components/page-state"

export interface Column<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  /** Value the column sorts by. Setting it makes the header sortable. */
  sort?: (row: T) => string | number
  align?: "start" | "end"
  /** Title of the row's card on small screens. One column should set this. */
  primary?: boolean
  className?: string
}

interface EntityTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Accessible name of the table. */
  caption: string
  empty?: string
  /** Current sort and the header click handler; both are needed for sortable headers. */
  sort?: SortState | null
  onSort?: (id: string) => void
}

function SortIcon({ dir }: { dir: SortState["dir"] | null }) {
  const Icon =
    dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown
  return <Icon className="size-3 shrink-0 opacity-60" aria-hidden />
}

/**
 * The one table: columns drive both the desktop table and the mobile card list,
 * so a row is never squeezed into a narrow viewport.
 */
export function EntityTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  empty,
  sort,
  onSort,
}: EntityTableProps<T>) {
  if (rows.length === 0) {
    return <PageState variant="empty" description={empty} compact />
  }
  const primary = columns.find((c) => c.primary) ?? columns[0]
  const rest = columns.filter((c) => c !== primary)

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={c.id}
                  aria-sort={
                    sort?.id === c.id
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "h-8 px-2 text-xs",
                    c.align === "end" && "text-end",
                    c.className
                  )}
                >
                  {c.sort && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(c.id)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                        c.align === "end" && "flex-row-reverse"
                      )}
                    >
                      {c.header}
                      <SortIcon dir={sort?.id === c.id ? sort.dir : null} />
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((c) => (
                  <TableCell
                    key={c.id}
                    className={cn(
                      "px-2 py-1.5 text-sm",
                      c.align === "end" && "text-end tabular-nums",
                      c.className
                    )}
                  >
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="grid gap-2 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-md border p-3">
            <div className="mb-2 text-sm font-medium">{primary.cell(row)}</div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {rest.map((c) => (
                <div key={c.id} className="min-w-0">
                  <dt className="text-muted-foreground">{c.header}</dt>
                  <dd className="truncate tabular-nums">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
