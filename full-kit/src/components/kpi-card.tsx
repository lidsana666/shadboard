import { ArrowDown, ArrowUp, Minus } from "lucide-react"

import type { Tone } from "@/configs/tokens"
import type { KpiValue } from "@/services/dashboard"

import { dashboardCopy, kpiToneLabel } from "@/configs/dashboard"
import { toneClass } from "@/configs/tokens"
import { formatMetric, percentChange } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

/** Whether a change in this KPI is an improvement. */
function changeTone(kpi: KpiValue, change: number): Tone {
  if (change === 0 || kpi.better === "none") return "neutral"
  const improved = kpi.better === "higher" ? change > 0 : change < 0
  return improved ? "success" : "danger"
}

/** The one KPI tile: value, change over the previous window and target status. */
export function KpiCard({ kpi }: { kpi: KpiValue }) {
  const change = percentChange(kpi.value, kpi.previous)
  const rounded = change === null ? null : Math.round(change * 10) / 10
  const tone = rounded === null ? "neutral" : changeTone(kpi, rounded)
  const Arrow =
    rounded === null || rounded === 0
      ? Minus
      : rounded > 0
        ? ArrowUp
        : ArrowDown
  const direction =
    rounded === null || rounded === 0
      ? "no change"
      : rounded > 0
        ? "increase"
        : "decrease"
  const toneLabel = kpiToneLabel[kpi.tone]
  const tightUnit = kpi.unit === "%"

  return (
    <Card className="flex flex-col gap-1 p-3" data-kpi={kpi.id}>
      <p className="truncate text-xs text-muted-foreground">{kpi.label}</p>
      <p className="text-xl font-semibold tabular-nums leading-tight">
        {formatMetric(kpi.value, kpi.digits)}
        {kpi.unit && (
          <span
            className={cn(
              "text-xs font-normal text-muted-foreground",
              !tightUnit && "ms-1"
            )}
          >
            {kpi.unit}
          </span>
        )}
      </p>
      <p
        className={cn(
          "flex items-center gap-1 text-xs tabular-nums",
          toneClass[tone].text
        )}
      >
        <Arrow className="size-3" aria-hidden />
        {rounded === null ? (
          <span className="text-muted-foreground">No comparison</span>
        ) : (
          <>
            <span>{Math.abs(rounded).toFixed(1)}%</span>
            <span className="sr-only">
              {direction} {dashboardCopy.comparison}
            </span>
          </>
        )}
      </p>
      {kpi.target !== null && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              toneClass[kpi.tone].dot
            )}
            aria-hidden
          />
          <span className="truncate">
            Target {kpi.better === "lower" ? "≤" : "≥"}{" "}
            {formatMetric(kpi.target, kpi.digits)}
            {tightUnit ? kpi.unit : ""}
            {toneLabel && <span className="sr-only">, {toneLabel}</span>}
          </span>
        </p>
      )}
    </Card>
  )
}
