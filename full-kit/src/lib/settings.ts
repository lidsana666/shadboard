import type { SettingsType } from "@/types"

// Parses the "settings" cookie; null when missing or malformed
export function parseSettings(raw?: string | null): SettingsType | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as SettingsType
  } catch {
    return null
  }
}
