import type { RoleId } from "@/types/rbac"

/** Demo identity directory: sign-in email -> role. Unknown emails get the fallback role. */
export const accountRoles: Readonly<Record<string, RoleId>> = {
  "john.doe@example.com": "cto",
}
