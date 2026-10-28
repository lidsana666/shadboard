import { spacing } from "@/configs/tokens"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <section
      className={spacing.page}
      role="status"
      aria-busy="true"
      aria-label="Loading teams"
    >
      <span className="sr-only">Loading teams</span>
      <div className="grid gap-1.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-80" />
    </section>
  )
}
