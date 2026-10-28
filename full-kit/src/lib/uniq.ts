/** Distinct, sorted values of `key` across `rows` — the single source of filter options. */
export function uniq<T, K extends keyof T>(rows: readonly T[], key: K): T[K][] {
  return [...new Set(rows.map((row) => row[key]))].sort((a, b) =>
    String(a).localeCompare(String(b))
  )
}
