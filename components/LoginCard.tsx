"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LogIn, X, RefreshCw, ExternalLink, Trash2, Users, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"

interface LoginCardProps {
  pendingRoomId?: string | null
  onClearPendingRoom?: () => void
}

export function LoginCard({ pendingRoomId, onClearPendingRoom }: LoginCardProps) {
  const { signInWithGoogle, error, loading, clearError, needsDomainAuth } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [forceCleared, setForceCleared] = useState(false)

  // Función de limpieza agresiva
  const forceCleanStorage = () => {
    if (typeof window !== "undefined") {
      try {
        // Método 1: Remover claves específicas
        localStorage.removeItem("voteTimeoutLogout")
        localStorage.removeItem("voteTimeoutTimestamp")

        // Método 2: Iterar y remover cualquier clave relacionada con timeout
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes("timeout") || key.includes("Timeout"))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key))

        // Método 3: Si todo falla, limpiar todo
        if (localStorage.getItem("voteTimeoutLogout")) {
          console.log("Force clearing all localStorage")
          localStorage.clear()
        }

        setForceCleared(true)
        setDebugInfo("Storage force cleaned")
        console.log("Force clean completed")

        // Recargar después de un momento
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        console.error("Error cleaning storage:", error)
        // Si hay error, limpiar todo
        localStorage.clear()
        window.location.reload()
      }
    }
  }

  // Check if user was logged out due to timeout - SIMPLIFICADO
  useEffect(() => {
    if (typeof window !== "undefined" && !forceCleared) {
      const timeoutLogout = localStorage.getItem("voteTimeoutLogout")

      console.log("LoginCard: Checking for timeout data:", timeoutLogout)

      // Si existe cualquier dato de timeout, limpiarlo inmediatamente
      if (timeoutLogout) {
        console.log("LoginCard: Found timeout data, force cleaning...")
        forceCleanStorage()
        return
      }

      setDebugInfo("No timeout data found")
    }
  }, [forceCleared])

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      clearError()

      // Limpieza antes del login
      if (typeof window !== "undefined") {
        localStorage.removeItem("voteTimeoutLogout")
        localStorage.removeItem("voteTimeoutTimestamp")
      }

      await signInWithGoogle()
      // El redireccionamiento a la sala pendiente se maneja en el componente padre
    } catch (error: any) {
      console.error("Login error:", error)

      // Don't show error for user-cancelled actions
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        console.log("User cancelled login, no error shown")
        return // Exit gracefully without showing error
      }

      // For other errors, the AuthContext will handle setting the error message
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleClearPendingRoom = () => {
    if (onClearPendingRoom) {
      onClearPendingRoom()
    }
  }

  const openDomainSettings = () => {
    window.open(
      "https://console.firebase.google.com/project/planning-poker-latam-app/authentication/settings",
      "_blank",
    )
  }

  const isLoading = loading || isSigningIn

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Planning Poker</CardTitle>
          <CardDescription>
            {pendingRoomId
              ? `Inicia sesión para unirte a la sala ${pendingRoomId}`
              : "Inicia sesión para unirte a la sala de votación"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending room info */}
          {pendingRoomId && (
            <Alert className="border-blue-200 bg-blue-50">
              <Users className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sala solicitada:</div>
                    <div className="font-mono text-sm">{pendingRoomId}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </div>
                <div className="text-xs mt-2 opacity-75">
                  Serás redirigido automáticamente después de iniciar sesión
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Debug info */}
          {debugInfo && <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">Debug: {debugInfo}</div>}

          {/* Force clear message */}
          {forceCleared && (
            <Alert className="border-green-200 bg-green-50">
              <div className="text-green-800">
                <strong>✅ Limpieza completada</strong>
                <br />
                Los datos problemáticos han sido eliminados. La página se recargará automáticamente.
              </div>
            </Alert>
          )}

          {/* Regular error message */}
          {error && (
            <Alert variant="destructive">
              <div className="flex justify-between items-start">
                <AlertDescription className="flex-1">{error}</AlertDescription>
                <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1 ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )}

          <Button onClick={handleSignIn} className="w-full" size="lg" disabled={isLoading || forceCleared}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Iniciando sesión...
              </>
            ) : forceCleared ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Recargando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión con Google
              </>
            )}
          </Button>

          {/* Clear pending room button */}
          {pendingRoomId && !forceCleared && (
            <Button onClick={handleClearPendingRoom} variant="outline" className="w-full bg-transparent" size="sm">
              <X className="mr-2 h-4 w-4" />
              Cancelar y ir al inicio
            </Button>
          )}

          {/* Emergency clean button - always visible if there are issues */}
          {!forceCleared && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-gray-600 text-center">¿No puedes iniciar sesión?</p>
              <Button onClick={forceCleanStorage} variant="destructive" size="lg" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />🚨 Limpiar Todo y Recargar
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Esto eliminará todos los datos locales y recargará la página
              </p>
            </div>
          )}

          {error && error.includes("dominio") && (
            <div className="space-y-2">
              <Button onClick={openDomainSettings} variant="outline" className="w-full bg-transparent" size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                Configurar dominios en Firebase
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Necesitas una cuenta de Google para acceder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
