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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("AuthContext: Setting up Firebase auth listener")

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("AuthContext: Auth state changed:", user ? `User: ${user.email}` : "No user")
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("AuthContext: Auth state change error:", error)
        setError(`Error de autenticación: ${error.message}`)
        setLoading(false)
      },
    )

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("AuthContext: Timeout reached, stopping loading")
        setLoading(false)
      }
    }, 10000) // 10 seconds timeout

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, []) // Only run once

  const signInWithGoogle = async () => {
    try {
      setError(null)
      console.log("AuthContext: Starting Google sign in...")

      const result = await signInWithPopup(auth, googleProvider)
      console.log("AuthContext: Sign in successful:", result.user.email)
    } catch (error: any) {
      console.error("AuthContext: Sign in error:", error)

      let errorMessage = "Error al iniciar sesión con Google"

      switch (error.code) {
        case "auth/unauthorized-domain":
          errorMessage = `El dominio ${window.location.hostname} no está autorizado.`
          break
        case "auth/configuration-not-found":
          errorMessage = "El proveedor de Google no está configurado en Firebase."
          break
        case "auth/popup-closed-by-user":
          console.log("AuthContext: User closed popup")
          return // No mostrar error
        case "auth/cancelled-popup-request":
          console.log("AuthContext: Popup cancelled")
          return // No mostrar error
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
      console.log("AuthContext: Signing out...")
      await signOut(auth)
      console.log("AuthContext: Signed out successfully")
    } catch (error: any) {
      console.error("AuthContext: Error signing out:", error)
      setError(`Error al cerrar sesión: ${error.message}`)
      // Forzar logout local incluso si hay error
      setUser(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    clearError,
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
