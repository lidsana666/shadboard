import { spacing } from "@/configs/tokens"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <section
      className={spacing.page}
      role="status"
      aria-busy="true"
      aria-label="Loading engineering overview"
    >
      <span className="sr-only">Loading engineering overview</span>
      <div className="grid gap-1.5">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    </section>
  )
}
