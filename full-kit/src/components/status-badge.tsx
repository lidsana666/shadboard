import type { StatusKind, StatusValue, Tone } from "@/configs/tokens"

import { statusTones, toneClass } from "@/configs/tokens"
import { cn } from "@/lib/utils"

type StatusBadgeProps = { className?: string } & (
  | { tone: Tone; label: string }
  | {
      [K in StatusKind]: { kind: K; value: StatusValue<K> & string }
    }[StatusKind]
)

/** The one badge for every status in the product. Tone comes from `statusTones`. */
export function StatusBadge(props: StatusBadgeProps) {
  const label = "kind" in props ? props.value : props.label
  const tone: Tone =
    "kind" in props
      ? (statusTones[props.kind] as Record<string, Tone>)[props.value]
      : props.tone

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        toneClass[tone].badge,
        props.className
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", toneClass[tone].dot)}
      />
      {label}
    </span>
  )
}
