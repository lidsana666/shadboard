"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { ZodType } from "zod"

import { readStored, writeStored } from "@/lib/safe-storage"

/**
 * State mirrored to localStorage. Renders `initial` on the server and first
 * client pass (no hydration mismatch), then loads the stored value.
 */
export function useStoredState<T>(key: string, schema: ZodType<T>, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const hydrated = useRef(false)
  const initialRef = useRef(initial)

  useEffect(() => {
    setValue(readStored(key, schema, initialRef.current))
    hydrated.current = true
  }, [key, schema])

  useEffect(() => {
    if (hydrated.current) writeStored(key, value)
  }, [key, value])

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), [])

  return [value, update] as const
}
