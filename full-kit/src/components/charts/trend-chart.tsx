"use client"

import { parseISO } from "date-fns"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { ChartSpec } from "@/configs/dashboard"

import { formatDateShort } from "@/lib/utils"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type Row<K extends string> = Record<K, string | number>

interface TrendChartProps<K extends string> {
  data: Row<K>[]
  spec: ChartSpec<K>
}

/** The one chart: bars, lines and areas on one or two value axes, from a spec. */
export function TrendChart<K extends string>({
  data,
  spec,
}: TrendChartProps<K>) {
  const config: ChartConfig = Object.fromEntries(
    spec.series.map((s) => [s.key, { label: s.label, color: s.color }])
  )
  const vertical = spec.layout === "vertical"
  const hasRight = spec.series.some((s) => s.axis === "right")
  const tick = { fontSize: 11 }
  const formatX = (value: string | number) =>
    spec.xType === "date"
      ? formatDateShort(parseISO(String(value)))
      : String(value)

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: spec.height ?? 240 }}
    >
      <ComposedChart
        accessibilityLayer
        data={data}
        layout={vertical ? "vertical" : "horizontal"}
        margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
      >
        <CartesianGrid
          vertical={vertical}
          horizontal={!vertical}
          strokeDasharray="3 3"
        />
        {vertical ? (
          <>
            <XAxis
              type="number"
              tick={tick}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey={spec.xKey}
              width={84}
              tick={tick}
              tickLine={false}
              axisLine={false}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={spec.xKey}
              tick={tick}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickFormatter={formatX}
            />
            <YAxis
              yAxisId="left"
              width={32}
              tick={tick}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            {hasRight && (
              <YAxis
                yAxisId="right"
                orientation="right"
                width={32}
                tick={tick}
                tickLine={false}
                axisLine={false}
              />
            )}
          </>
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(label) => formatX(label)}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {spec.series.map((s) => {
          const color = `var(--color-${s.key})`
          const yAxisId = vertical ? undefined : (s.axis ?? "left")
          if (s.kind === "line") {
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                yAxisId={yAxisId}
                type="monotone"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            )
          }
          if (s.kind === "area") {
            return (
              <Area
                key={s.key}
                dataKey={s.key}
                yAxisId={yAxisId}
                type="monotone"
                stackId={s.stackId}
                stroke={color}
                fill={color}
                fillOpacity={0.35}
              />
            )
          }
          return (
            <Bar
              key={s.key}
              dataKey={s.key}
              yAxisId={yAxisId}
              stackId={s.stackId}
              fill={color}
              radius={s.stackId ? 0 : 2}
            />
          )
        })}
      </ComposedChart>
    </ChartContainer>
  )
}
