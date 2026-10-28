"use client"

import { useMemo, useState } from "react"
import { Bell } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { NotificationCategory } from "@/services/notifications"

import { notificationCategoryMeta } from "@/configs/shell"
import { toneClass } from "@/configs/tokens"
import { uniq } from "@/lib/uniq"
import { cn, formatDistance, formatUnreadCount } from "@/lib/utils"

import { useShell } from "@/contexts/shell-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DynamicIcon } from "@/components/dynamic-icon"

export function NotificationDropdown({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const { data, readIds, markRead } = useShell()
  const [category, setCategory] = useState<NotificationCategory | "All">("All")

  const items = useMemo(
    () =>
      data.notifications.map((n) => ({
        ...n,
        unread: !n.read && !readIds.includes(n.id),
      })),
    [data.notifications, readIds]
  )
  const categories = useMemo(() => uniq(items, "category"), [items])
  const visible = items.filter(
    (n) => category === "All" || n.category === category
  )
  const unread = items.filter((n) => n.unread)
  const unreadCount = formatUnreadCount(unread.length)

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="sr-only">
            Notifications{unread.length > 0 ? `, ${unread.length} unread` : ""}
          </span>
          {unread.length > 0 && (
            <Badge
              className="absolute -top-1 -end-1 h-4 max-w-8 flex justify-center px-1 text-[10px]"
              aria-hidden
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(380px,calc(100vw-1rem))] p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h3 className="text-sm font-semibold">
            {dictionary.navigation.notifications.notifications}
          </h3>
          <Button
            variant="link"
            className="h-auto p-0 text-xs"
            disabled={unread.length === 0}
            onClick={() => markRead(unread.map((n) => n.id))}
          >
            Mark all read
          </Button>
        </div>
        {categories.length > 1 && (
          <div
            role="group"
            aria-label="Filter by category"
            className="flex flex-wrap gap-1 border-b border-border p-2"
          >
            {(["All", ...categories] as const).map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "secondary" : "ghost"}
                aria-pressed={category === c}
                className="h-6 px-2 text-xs"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}
        {visible.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            You are all caught up.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {visible.map((n) => {
              const meta = notificationCategoryMeta[n.category]
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead([n.id])}
                    className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border",
                        toneClass[meta.tone].badge
                      )}
                    >
                      <DynamicIcon name={meta.iconName} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {n.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {n.category} · {n.detail}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDistance(n.at)}
                      </span>
                    </span>
                    {n.unread && (
                      <>
                        <span
                          aria-hidden
                          className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                        />
                        <span className="sr-only">Unread</span>
                      </>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
