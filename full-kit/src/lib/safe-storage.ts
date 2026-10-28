import type { ZodType } from "zod"

/** Read and validate a JSON value. Any failure (blocked storage, bad data) yields `fallback`. */
export function readStored<T>(key: string, schema: ZodType<T>, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = schema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : fallback
  } catch {
    return fallback
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be unavailable (private mode, quota); the UI still works without it.
  }
}
