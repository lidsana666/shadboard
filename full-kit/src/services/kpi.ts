import type { KpiId } from "@/configs/kpis"
import type { Tone } from "@/configs/tokens"

import { kpiDefinitions, kpiTone } from "@/configs/kpis"

export interface KpiValue {
  id: KpiId
  label: string
  unit: string
  digits: number
  value: number
  /** Value over the previous equal window, when comparable. */
  previous: number | null
  better: "higher" | "lower" | "none"
  target: number | null
  tone: Tone
}

export interface KpiInput {
  value: number
  previous: number | null
}

/** Attach label, unit, target and tone from `kpiDefinitions` to raw values, in definition order. */
export function makeKpis(values: Partial<Record<KpiId, KpiInput>>): KpiValue[] {
  return kpiDefinitions.flatMap((def) => {
    const v = values[def.id]
    if (!v) return []
    return [
      {
        id: def.id,
        label: def.label,
        unit: def.unit,
        digits: def.digits,
        better: def.better,
        target: def.target ?? null,
        value: v.value,
        previous: v.previous,
        tone: kpiTone(def, v.value),
      },
    ]
  })
}
