"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  isFirebaseConfigured: boolean
  needsDomainAuth: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true)
  const [needsDomainAuth, setNeedsDomainAuth] = useState(false)

  useEffect(() => {
    console.log("AuthContext: Setting up Firebase auth listener")

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("AuthContext: Auth state changed:", user ? `User: ${user.email}` : "No user")
        setUser(user)
        setLoading(false)
        setIsFirebaseConfigured(true)
        setNeedsDomainAuth(false)

        // NO tocar localStorage aquí - dejar que LoginCard lo maneje
      },
      (error) => {
        console.error("AuthContext: Auth state change error:", error)
        setError(`Error de autenticación: ${error.message}`)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      setNeedsDomainAuth(false)
      console.log("AuthContext: Starting Google sign in with Firebase...")

      const result = await signInWithPopup(auth, googleProvider)
      console.log("AuthContext: Firebase sign in successful:", result.user.email)
      setIsFirebaseConfigured(true)
    } catch (error: any) {
      console.error("AuthContext: Firebase sign in error:", error)

      let errorMessage = "Error al iniciar sesión con Google"

      switch (error.code) {
        case "auth/unauthorized-domain":
          errorMessage = `El dominio ${window.location.hostname} no está autorizado para autenticación.`
          setNeedsDomainAuth(true)
          setIsFirebaseConfigured(true)
          break
        case "auth/configuration-not-found":
          errorMessage = "El proveedor de Google no está configurado en Firebase."
          setIsFirebaseConfigured(false)
          break
        case "auth/popup-closed-by-user":
          // Don't show error for user-cancelled popup - this is normal behavior
          console.log("AuthContext: User closed popup, no error shown")
          return // Exit without setting error or throwing
        case "auth/cancelled-popup-request":
          // Don't show error for cancelled popup request - this is normal
          console.log("AuthContext: Popup request cancelled, no error shown")
          return // Exit without setting error or throwing
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifica tu conexión a internet."
          break
        default:
          errorMessage = `Error: ${error.message}`
      }

      setError(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      setError(null)
      console.log("AuthContext: User signing out...")

      await signOut(auth)
      console.log("AuthContext: User signed out successfully")
    } catch (error: any) {
      console.error("AuthContext: Error signing out:", error)
      setError(`Error al cerrar sesión: ${error.message}`)
      setUser(null)
    }
  }

  const clearError = () => {
    setError(null)
    setNeedsDomainAuth(false)
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    clearError,
    isFirebaseConfigured,
    needsDomainAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
