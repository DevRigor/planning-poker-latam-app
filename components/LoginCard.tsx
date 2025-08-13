"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LogIn, Wifi, WifiOff, Users, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface LoginCardProps {
  pendingRoomId?: string | null
}

export function LoginCard({ pendingRoomId }: LoginCardProps) {
  const { signInWithGoogle, error, user } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [wasLoggedOut, setWasLoggedOut] = useState(false)
  const router = useRouter()

  // Check if user was logged out due to timeout
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timeoutLogout = localStorage.getItem("voteTimeoutLogout")
      if (timeoutLogout === "true") {
        setWasLoggedOut(true)
        localStorage.removeItem("voteTimeoutLogout")
      }
    }
  }, [])

  // Redirect to room after login - FIXED: Only redirect once
  useEffect(() => {
    if (user && pendingRoomId && !isSigningIn) {
      console.log(`Redirecting authenticated user to room: ${pendingRoomId}`)
      router.push(`/room/${pendingRoomId}`)
    }
  }, [user, pendingRoomId, router, isSigningIn])

  // Monitor network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      if (!isOnline) {
        throw new Error("Sin conexión a internet")
      }
      console.log("Starting Google sign in...")
      await signInWithGoogle()
      console.log("Sign in successful")
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  // Don't show login card if user is already authenticated and we have a pending room
  if (user && pendingRoomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Redirigiendo a la sala {pendingRoomId}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Planning Poker</CardTitle>
          <CardDescription>
            {pendingRoomId ? `Inicia sesión para unirte a la sala: ${pendingRoomId}` : "Inicia sesión para comenzar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeout logout message */}
          {wasLoggedOut && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Sesión cerrada por inactividad</strong>
                <br />
                <span className="text-sm">
                  Fuiste desconectado automáticamente por no votar dentro del tiempo límite (5 minutos).
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Información de sala pendiente */}
          {pendingRoomId && (
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Sala detectada:</strong> {pendingRoomId}
                <br />
                <span className="text-sm">Serás redirigido automáticamente después del login</span>
              </AlertDescription>
            </Alert>
          )}

          {!isOnline && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>Sin conexión a internet</AlertDescription>
            </Alert>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <Button onClick={handleSignIn} className="w-full" size="lg" disabled={isSigningIn || !isOnline}>
            {isSigningIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Iniciando sesión...
              </>
            ) : !isOnline ? (
              <>
                <WifiOff className="mr-2 h-4 w-4" />
                Sin conexión
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {pendingRoomId ? `Iniciar sesión y unirse a ${pendingRoomId}` : "Iniciar sesión con Google"}
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Necesitas una cuenta de Google para acceder</p>
            {isOnline && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Conectado</span>
              </div>
            )}
          </div>

          {wasLoggedOut && (
            <div className="text-center text-xs text-gray-500 bg-yellow-50 p-2 rounded">
              💡 <strong>Tip:</strong> Para evitar desconexiones, vota dentro de los 5 minutos después de que comience
              una ronda.
            </div>
          )}

          {/* Debug info */}
          {pendingRoomId && (
            <div className="text-center text-xs text-gray-400 border-t pt-2">Debug: Room ID = {pendingRoomId}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
