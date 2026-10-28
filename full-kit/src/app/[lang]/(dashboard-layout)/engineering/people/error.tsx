"use client"

import { spacing } from "@/configs/tokens"

import { Button } from "@/components/ui/button"
import { PageState } from "@/components/page-state"

export default function ErrorPage({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <section className={spacing.page}>
      <PageState
        variant="error"
        action={
          <Button variant="outline" size="sm" onClick={reset}>
            Try again
          </Button>
        }
      />
    </section>
  )
}
