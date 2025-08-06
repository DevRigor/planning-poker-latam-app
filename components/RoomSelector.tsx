"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { generateRoomId, isValidRoomId, generateShareableUrl } from "@/lib/roomUtils"
import { Users, Plus, LogIn, Copy, Check, Share2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoomSelectorProps {
  onRoomSelect: (roomId: string) => void
}

export function RoomSelector({ onRoomSelect }: RoomSelectorProps) {
  const { user } = useAuth()
  const [roomId, setRoomId] = useState("")
  const [error, setError] = useState("")
  const [createdRoomId, setCreatedRoomId] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId()
    setCreatedRoomId(newRoomId)
    setError("")

    // Actualizar la URL sin recargar la página
    window.history.pushState({}, "", `/room/${newRoomId}`)

    onRoomSelect(newRoomId)
  }

  const handleJoinRoom = () => {
    const trimmedId = roomId.trim().toLowerCase()

    if (!trimmedId) {
      setError("Por favor ingresa un ID de sala")
      return
    }

    // Permitir URLs completas o solo el ID
    let extractedId = trimmedId
    if (trimmedId.includes("/room/")) {
      const match = trimmedId.match(/\/room\/([^/?#]+)/)
      extractedId = match ? match[1] : trimmedId
    }

    if (!isValidRoomId(extractedId)) {
      setError("ID de sala inválido. Debe tener el formato: palabra-palabra-123")
      return
    }

    setError("")

    // Actualizar la URL sin recargar la página
    window.history.pushState({}, "", `/room/${extractedId}`)

    onRoomSelect(extractedId)
  }

  const copyShareableUrl = async () => {
    if (!createdRoomId) return

    const url = generateShareableUrl(createdRoomId)

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  const shareRoom = async () => {
    if (!createdRoomId) return

    const url = generateShareableUrl(createdRoomId)

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Planning Poker - Únete a mi sala",
          text: `Únete a mi sesión de Planning Poker: ${createdRoomId}`,
          url: url,
        })
      } catch (err) {
        console.error("Error sharing:", err)
        copyShareableUrl()
      }
    } else {
      copyShareableUrl()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Planning Poker</h1>
          <p className="text-muted-foreground">
            Hola, {user?.displayName || user?.email}! Crea una nueva sala o únete a una existente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Crear nueva sala */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Crear Nueva Sala
              </CardTitle>
              <CardDescription>Crea una sala única para tu equipo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleCreateRoom} className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Crear Sala
              </Button>

              {createdRoomId && (
                <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-800">¡Sala creada!</p>
                    <p className="text-lg font-mono font-bold text-green-900">{createdRoomId}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyShareableUrl} variant="outline" size="sm" className="flex-1 bg-transparent">
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copiar URL
                        </>
                      )}
                    </Button>

                    <Button onClick={shareRoom} variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Share2 className="mr-1 h-3 w-3" />
                      Compartir
                    </Button>
                  </div>

                  <p className="text-xs text-green-700 text-center">
                    Comparte este ID o URL con tu equipo para que se unan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unirse a sala existente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Unirse a Sala
              </CardTitle>
              <CardDescription>Ingresa el ID de sala o pega la URL completa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId">ID de Sala o URL</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ej: rapido-equipo-123 o URL completa"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleJoinRoom} className="w-full bg-transparent" size="lg" variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Unirse a Sala
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Formatos aceptados:</strong>
                </p>
                <p>• ID: rapido-equipo-123</p>
                <p>• URL: https://app.com/room/rapido-equipo-123</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                <strong>💡 Tip:</strong> Cada sala es independiente y privada para tu equipo.
              </p>
              <p>Los participantes pueden unirse usando el ID de sala o la URL compartida.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
