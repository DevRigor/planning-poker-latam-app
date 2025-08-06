"use client"

import { useState, useEffect } from "react"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"

export function useFirebaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkFirebaseConfig = async () => {
      try {
        setIsChecking(true)
        setError(null)

        // Try to initialize a sign-in popup to test configuration
        // This will fail immediately if Google provider is not configured
        const popup = await signInWithPopup(auth, googleProvider).catch((error) => {
          // If the error is specifically about configuration, Firebase is not set up
          if (error.code === "auth/configuration-not-found") {
            throw new Error("Google provider not configured")
          }
          // If it's popup closed or other user-related errors, configuration is OK
          if (
            error.code === "auth/popup-closed-by-user" ||
            error.code === "auth/popup-blocked" ||
            error.code === "auth/cancelled-popup-request"
          ) {
            return null // Configuration is OK, user just cancelled
          }
          throw error
        })

        // If we get here, configuration is working
        setIsConfigured(true)
      } catch (error: any) {
        console.error("Firebase configuration check failed:", error)
        setError(error.message)
        setIsConfigured(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Small delay to let Firebase initialize
    const timer = setTimeout(checkFirebaseConfig, 1000)
    return () => clearTimeout(timer)
  }, [])

  return { isConfigured, isChecking, error }
}
