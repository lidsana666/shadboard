import type { ChartSpec } from "@/configs/dashboard"

import { dashboardCopy } from "@/configs/dashboard"
import { formatDateShort } from "@/lib/utils"

import { LazyTrendChart } from "@/components/charts/lazy-trend-chart"
import { PageState } from "@/components/page-state"
import { Panel } from "@/components/panel"

type Row<K extends string> = Record<K, string | number>

interface ChartCardProps<K extends string> {
  data: Row<K>[]
  spec: ChartSpec<K>
}

/** A chart in a panel, with its data also available to screen readers as a table. */
export function ChartCard<K extends string>({ data, spec }: ChartCardProps<K>) {
  const label = (value: string | number) =>
    spec.xType === "date"
      ? formatDateShort(new Date(String(value)))
      : String(value)

  return (
    <Panel title={spec.title} description={spec.description}>
      {data.length === 0 ? (
        <PageState
          variant="empty"
          description={dashboardCopy.empty.chart}
          compact
        />
      ) : (
        <>
          <div
            role="img"
            aria-label={`${spec.title}. ${spec.description}. Data table follows.`}
          >
            <LazyTrendChart data={data} spec={spec} />
          </div>
          <table className="sr-only">
            <caption>{spec.title}</caption>
            <thead>
              <tr>
                <th scope="col">{spec.xKey}</th>
                {spec.series.map((s) => (
                  <th key={s.key} scope="col">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={String(row[spec.xKey])}>
                  <th scope="row">{label(row[spec.xKey])}</th>
                  {spec.series.map((s) => (
                    <td key={s.key}>{row[s.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Panel>
  )
}
