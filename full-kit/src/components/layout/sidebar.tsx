"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { ChevronDown, Star } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type {
  DynamicIconNameType,
  LocaleType,
  NavigationNestedItem,
  NavigationRootItem,
  NavigationType,
} from "@/types"

import { navigationsData } from "@/data/navigations"

import { i18n } from "@/configs/i18n"
import { appName } from "@/configs/shell"
import { ensureLocalizedPathname } from "@/lib/i18n"
import { flattenNav } from "@/lib/navigation"
import {
  cn,
  getDictionaryValue,
  isActivePathname,
  titleCaseToCamelCase,
} from "@/lib/utils"

import { useSettings } from "@/hooks/use-settings"
import { useShell } from "@/contexts/shell-context"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  Sidebar as SidebarWrapper,
  useSidebar,
} from "@/components/ui/sidebar"
import { DynamicIcon } from "@/components/dynamic-icon"
import { CommandMenu } from "./command-menu"

interface LeafLink {
  href: string
  title: string
  label?: string
  iconName?: DynamicIconNameType
}

const entries = flattenNav(navigationsData)
const entryByHref = new Map(entries.map((e) => [e.href, e]))

type NavItem = NavigationRootItem | NavigationNestedItem

const leavesOf = (item: NavItem): string[] =>
  item.items
    ? item.items.flatMap(leavesOf)
    : "href" in item && item.href
      ? [item.href]
      : []

export function Sidebar({ dictionary }: { dictionary: DictionaryType }) {
  const pathname = usePathname()
  const params = useParams()
  const { setOpenMobile, isMobile } = useSidebar()
  const { settings } = useSettings()
  const { favorites, toggleFavorite, recents } = useShell()

  const locale = params.lang as LocaleType
  const isRTL = i18n.localeDirection[locale] === "rtl"
  const isHorizontalAndDesktop = settings.layout === "horizontal" && !isMobile

  // Horizontal layout on desktop navigates with the top menubar instead.
  if (isHorizontalAndDesktop) return null

  const translate = (title: string) =>
    getDictionaryValue(titleCaseToCamelCase(title), dictionary.navigation)
  const translateLabel = (label: string) =>
    getDictionaryValue(titleCaseToCamelCase(label), dictionary.label)

  const isActiveHref = (href: string) =>
    isActivePathname(ensureLocalizedPathname(href, locale), pathname)
  const containsActive = (hrefs: string[]) => hrefs.some(isActiveHref)

  const renderLeaf = (leaf: LeafLink, prefix: string) => {
    const title = translate(leaf.title)
    const localized = ensureLocalizedPathname(leaf.href, locale)
    const starred = favorites.includes(leaf.href)

    return (
      <SidebarMenuItem key={`${prefix}-${leaf.href}`}>
        <SidebarMenuButton
          isActive={isActiveHref(leaf.href)}
          tooltip={title}
          onClick={() => isMobile && setOpenMobile(false)}
          asChild
        >
          <Link href={localized}>
            {leaf.iconName && (
              <DynamicIcon name={leaf.iconName} className="h-4 w-4" />
            )}
            <span>{title}</span>
            {leaf.label && (
              <Badge variant="secondary">{translateLabel(leaf.label)}</Badge>
            )}
          </Link>
        </SidebarMenuButton>
        <SidebarMenuAction
          showOnHover={!starred}
          className="end-1 right-auto"
          aria-pressed={starred}
          aria-label={
            starred
              ? `Remove ${title} from favorites`
              : `Add ${title} to favorites`
          }
          onClick={() => toggleFavorite(leaf.href)}
        >
          <Star className={cn(starred && "fill-current")} />
        </SidebarMenuAction>
      </SidebarMenuItem>
    )
  }

  const renderItem = (item: NavItem) => {
    if (item.items) {
      return (
        <SidebarMenuItem key={item.title}>
          <Collapsible
            className="group/collapsible"
            defaultOpen={containsActive(leavesOf(item))}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={translate(item.title)}
                className="w-full justify-between [&[data-state=open]>svg]:rotate-180"
              >
                <span className="flex items-center gap-2">
                  {"iconName" in item && (
                    <DynamicIcon name={item.iconName} className="h-4 w-4" />
                  )}
                  <span>{translate(item.title)}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <SidebarMenuSub>{item.items.map(renderItem)}</SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      )
    }
    if (!("href" in item) || !item.href) return null
    return renderLeaf(
      {
        href: item.href,
        title: item.title,
        label: item.label,
        iconName: "iconName" in item ? item.iconName : undefined,
      },
      "nav"
    )
  }

  const renderSection = (nav: NavigationType) => {
    const hrefs = nav.items.flatMap(leavesOf)
    const menu = (
      <SidebarGroupContent>
        <SidebarMenu>{nav.items.map(renderItem)}</SidebarMenu>
      </SidebarGroupContent>
    )

    if (!nav.collapsed) {
      return (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{translate(nav.title)}</SidebarGroupLabel>
          {menu}
        </SidebarGroup>
      )
    }

    // Collapsed sections are tucked away; icon mode hides them entirely.
    return (
      <Collapsible
        key={nav.title}
        asChild
        defaultOpen={containsActive(hrefs)}
        className="group/section"
      >
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="w-full justify-between [&[data-state=open]>svg]:rotate-180">
              {translate(nav.title)}
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>{menu}</CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    )
  }

  const pinned = favorites.flatMap((h) => entryByHref.get(h) ?? [])
  const recent = recents
    .filter((h) => !favorites.includes(h))
    .flatMap((h) => entryByHref.get(h) ?? [])

  return (
    <SidebarWrapper side={isRTL ? "right" : "left"} collapsible="icon">
      <SidebarHeader>
        <Link
          href={ensureLocalizedPathname("/", locale)}
          className="mb-1 flex w-fit items-center gap-2 rounded-md p-2 font-semibold text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => isMobile && setOpenMobile(false)}
        >
          <Image
            src="/images/icons/shadboard.svg"
            alt=""
            height={24}
            width={24}
            className="shrink-0 dark:invert"
          />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {appName}
          </span>
        </Link>
        {isMobile && (
          <CommandMenu dictionary={dictionary} buttonClassName="max-w-full" />
        )}
      </SidebarHeader>
      <ScrollArea>
        <SidebarContent className="gap-0">
          {pinned.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Favorites</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pinned.map((e) => renderLeaf(e, "fav"))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {recent.length > 0 && (
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recent.map((e) => renderLeaf(e, "recent"))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {navigationsData.map(renderSection)}
        </SidebarContent>
      </ScrollArea>
      <SidebarRail />
    </SidebarWrapper>
  )
}
