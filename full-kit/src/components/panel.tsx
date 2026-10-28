import type { ReactNode } from "react"

import { cn, slugify } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PanelProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

/** The one card chrome for dashboard panels and charts. */
export function Panel({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: PanelProps) {
  const headingId = `panel-${slugify(title)}`
  return (
    <Card asChild className={cn("min-w-0", className)}>
      <section aria-labelledby={headingId}>
        <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 p-4 pb-2">
          <div className="grid gap-0.5">
            <CardTitle asChild className="text-sm font-semibold">
              <h2 id={headingId}>{title}</h2>
            </CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
        <CardContent className={cn("p-4 pt-2", contentClassName)}>
          {children}
        </CardContent>
      </section>
    </Card>
  )
}
