import { AlertTriangle, Inbox, Lock } from "lucide-react"

import type { PageStateVariant } from "@/configs/page-state"
import type { ComponentType, ReactNode } from "react"

import { pageStateCopy } from "@/configs/page-state"
import { cn } from "@/lib/utils"

import { Skeleton } from "@/components/ui/skeleton"

const icons: Record<
  Exclude<PageStateVariant, "loading">,
  ComponentType<{ className?: string }>
> = { empty: Inbox, error: AlertTriangle, forbidden: Lock }

interface PageStateProps {
  variant: PageStateVariant
  title?: string
  description?: string
  /** Optional control such as a retry button. */
  action?: ReactNode
  /** Smaller padding for use inside a panel. */
  compact?: boolean
  className?: string
}

/** The one loading / empty / error / no-permission state for pages and panels. */
export function PageState({
  variant,
  title,
  description,
  action,
  compact,
  className,
}: PageStateProps) {
  const copy = pageStateCopy[variant]

  if (variant === "loading") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={title ?? copy.title}
        className={cn("grid gap-2", compact ? "py-2" : "py-6", className)}
      >
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <span className="sr-only">{title ?? copy.title}</span>
      </div>
    )
  }

  const Icon = icons[variant]
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-center",
        compact ? "py-6" : "py-16",
        className
      )}
    >
      <Icon className="mb-1 size-5 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium">{title ?? copy.title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {description ?? copy.description}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
