import { spacing } from "@/configs/tokens"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <section
      className={spacing.page}
      role="status"
      aria-busy="true"
      aria-label="Loading team"
    >
      <span className="sr-only">Loading team</span>
      <div className="grid gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-56" />
      </div>
      <Skeleton className="h-9 w-full max-w-2xl" />
      <Skeleton className="h-72" />
    </section>
  )
}
