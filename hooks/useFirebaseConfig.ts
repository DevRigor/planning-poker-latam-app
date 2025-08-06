"use client"

import { useState, useEffect } from "react"
import { usingDemoConfig, missingVars } from "@/lib/firebase"

export function useFirebaseConfig() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [configErrors, setConfigErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firebase is always configured (either with env vars or demo config)
    // But we track if we're using demo config for UI purposes
    setIsConfigured(true)
    setConfigErrors(missingVars)
    setLoading(false)
  }, [])

  return {
    isConfigured,
    configErrors,
    loading,
    usingDemoConfig,
  }
}
