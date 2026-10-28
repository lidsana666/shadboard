/** Number formatting shared by every metric on screen. */

export function formatMetric(value: number, digits: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** Relative change from `previous` to `value`, in percent. Null when not comparable. */
export function percentChange(
  value: number,
  previous: number | null
): number | null {
  if (previous === null || previous === 0) return null
  return ((value - previous) / Math.abs(previous)) * 100
}

/** 125 -> "2m 05s"; 3700 -> "1h 01m". */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, "0")
  if (h > 0) return `${h}h ${pad(m)}m`
  return `${m}m ${pad(s % 60)}s`
}
