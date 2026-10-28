"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import { useCookie } from "react-use"

import type { LocaleType, SettingsType } from "@/types"
import type { ReactNode } from "react"

import { defaultRadius } from "@/configs/tokens"
import { parseSettings } from "@/lib/settings"

export const defaultSettings: SettingsType = {
  theme: "zinc",
  mode: "system",
  radius: defaultRadius,
  layout: "vertical",
  locale: "en",
}

export const SettingsContext = createContext<
  | {
      settings: SettingsType
      updateSettings: (newSettings: SettingsType) => void
      resetSettings: () => void
    }
  | undefined
>(undefined)

export function SettingsProvider({
  locale,
  initial,
  children,
}: {
  locale: LocaleType
  initial?: SettingsType | null
  children: ReactNode
}) {
  const [storedSettings, setStoredSettings, deleteStoredSettings] =
    useCookie("settings")
  const [settings, setSettings] = useState<SettingsType | null>(
    initial ?? { ...defaultSettings, locale }
  )

  useEffect(() => {
    const stored = parseSettings(storedSettings)
    if (stored) {
      setSettings(stored)
    } else {
      setSettings({ ...defaultSettings, locale })
    }
  }, [storedSettings, locale])

  const updateSettings = useCallback(
    (newSettings: SettingsType) => {
      setStoredSettings(JSON.stringify(newSettings))
      setSettings(newSettings)
    },
    [setStoredSettings]
  )

  const resetSettings = useCallback(() => {
    deleteStoredSettings()
    setSettings(defaultSettings)
  }, [deleteStoredSettings])

  // Settings come from the cookie on the server, so children render in SSR
  // and route status codes (404) are decided before streaming starts.
  if (!settings) {
    return null
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
