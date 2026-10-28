"use client"

import { environments } from "@/configs/shell"

import { useShell } from "@/contexts/shell-context"
import { StatusBadge } from "@/components/status-badge"

export function EnvIndicator() {
  const { data } = useShell()
  const env = environments[data.env]

  return (
    <StatusBadge
      tone={env.tone}
      label={env.label}
      className="hidden sm:inline-flex"
    />
  )
}
