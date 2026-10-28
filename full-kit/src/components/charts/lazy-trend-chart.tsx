"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

/** Recharts is heavy: load it on the client only, after the page shell. */
export const LazyTrendChart = dynamic(
  () => import("./trend-chart").then((m) => m.TrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-60 w-full" aria-hidden />,
  }
)
