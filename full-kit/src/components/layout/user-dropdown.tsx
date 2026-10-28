import Link from "next/link"
import { signOut } from "next-auth/react"
import { LogOut, User, UserCog } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { getInitials } from "@/lib/utils"

import { useShell } from "@/contexts/shell-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserDropdown({
  dictionary,
  locale,
}: {
  dictionary: DictionaryType
  locale: LocaleType
}) {
  const { data } = useShell()
  const { name, email } = data.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          aria-label={`Account menu, ${data.role.label}`}
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-transparent">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent forceMount>
        <DropdownMenuLabel className="flex gap-2">
          <Avatar>
            <AvatarFallback className="bg-transparent">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground font-semibold truncate">
              {email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {data.role.label}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-w-48">
          <DropdownMenuItem asChild>
            <Link
              href={ensureLocalizedPathname("/pages/account/profile", locale)}
            >
              <User className="me-2 size-4" />
              {dictionary.navigation.userNav.profile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={ensureLocalizedPathname("/pages/account/settings", locale)}
            >
              <UserCog className="me-2 size-4" />
              {dictionary.navigation.userNav.settings}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="me-2 size-4" />
          {dictionary.navigation.userNav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
