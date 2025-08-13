"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Users, Plus, LogIn, LogOut } from "lucide-react"

interface RoomSelectorProps {
  onRoomSelect: (roomId: string) => void
}

export function RoomSelector({ onRoomSelect }: RoomSelectorProps) {
  const { user, logout } = useAuth()
  const [roomId, setRoomId] = useState("")

  const handleCreateRoom = () => {
    const newRoomId = `sala-${Math.random().toString(36).substr(2, 6)}`
    onRoomSelect(newRoomId)
  }

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onRoomSelect(roomId.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Planning Poker</h1>
          <p className="text-muted-foreground">
            Hola, {user?.displayName || user?.email}! Crea una nueva sala o únete a una existente.
          </p>
        </div>

        {/* User info and logout */}
        <div className="flex justify-end">
          <Button onClick={logout} variant="outline" size="sm" className="bg-white hover:bg-gray-50">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
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
            <CardContent>
              <Button onClick={handleCreateRoom} className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Crear Sala
              </Button>
            </CardContent>
          </Card>

          {/* Unirse a sala existente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Unirse a Sala
              </CardTitle>
              <CardDescription>Ingresa el ID de una sala existente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId">ID de Sala</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ej: sala-abc123"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>

              <Button onClick={handleJoinRoom} className="w-full bg-white" size="lg" variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Unirse a Sala
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
