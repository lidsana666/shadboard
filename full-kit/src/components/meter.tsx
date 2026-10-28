import type { Tone } from "@/configs/tokens"

import { toneClass } from "@/configs/tokens"
import { cn } from "@/lib/utils"

interface MeterProps {
  /** 0-100. */
  value: number
  tone: Tone
  label: string
  /** Optional 0-100 marker, e.g. how much of the time has passed. */
  marker?: number
  className?: string
}

/** A thin progress bar with an optional marker. Tone comes from config. */
export function Meter({ value, tone, label, marker, className }: MeterProps) {
  const clamp = (n: number) => Math.min(100, Math.max(0, n))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamp(value))}
      className={cn("relative h-1.5 w-full rounded-full bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full", toneClass[tone].fill)}
        style={{ width: `${clamp(value)}%` }}
      />
      {marker !== undefined && (
        <div
          aria-hidden
          className="absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-foreground/60"
          style={{ left: `${clamp(marker)}%` }}
        />
      )}
    </div>
  )
}
