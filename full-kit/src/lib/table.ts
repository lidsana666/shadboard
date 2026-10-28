/** Pure list transforms behind every interactive table: search, filter, sort, paginate. */

export type SortDir = "asc" | "desc"

export interface SortState {
  id: string
  dir: SortDir
}

/** Click cycle on a column header: ascending, descending, unsorted. */
export function nextSort(
  current: SortState | null,
  id: string
): SortState | null {
  if (current?.id !== id) return { id, dir: "asc" }
  return current.dir === "asc" ? { id, dir: "desc" } : null
}

export function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a).localeCompare(String(b), "en", { numeric: true })
}

/** Stable sort by a value getter. */
export function sortRows<T>(
  rows: readonly T[],
  get: (row: T) => string | number,
  dir: SortDir
): T[] {
  const sign = dir === "asc" ? 1 : -1
  return [...rows].sort((a, b) => sign * compareValues(get(a), get(b)))
}

/** Rows where any searchable text contains the query (case-insensitive). */
export function searchRows<T>(
  rows: readonly T[],
  query: string,
  text: (row: T) => readonly string[]
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...rows]
  return rows.filter((r) => text(r).some((t) => t.toLowerCase().includes(q)))
}

export interface FieldFilter<T> {
  key: keyof T
  value: string
}

/** Rows matching every filter exactly. */
export function filterRows<T>(
  rows: readonly T[],
  filters: readonly FieldFilter<T>[]
): T[] {
  return rows.filter((r) => filters.every((f) => String(r[f.key]) === f.value))
}

export interface Page<T> {
  rows: T[]
  /** Zero-based, clamped to the last page. */
  page: number
  pages: number
  total: number
  /** One-based range shown, 0-0 when empty. */
  from: number
  to: number
}

export function paginate<T>(
  rows: readonly T[],
  page: number,
  size: number
): Page<T> {
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const at = Math.min(Math.max(0, page), pages - 1)
  const start = at * size
  const slice = rows.slice(start, start + size)
  return {
    rows: slice,
    page: at,
    pages,
    total: rows.length,
    from: slice.length === 0 ? 0 : start + 1,
    to: start + slice.length,
  }
}
