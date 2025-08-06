"use client"

import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRoom } from "@/hooks/useRoom"
import { ParticipantsList } from "./ParticipantsList"
import { ParticipantStatistics } from "./ParticipantStatistics"
import { VoteStatistics } from "./VoteStatistics"
import { VoteTimeoutIndicator } from "./VoteTimeoutIndicator"
import { EditNameDialog } from "./EditNameDialog"
import { LogOut, Users, RotateCcw, Eye, BarChart3, ArrowLeft, Copy, Check, Share2, MoreHorizontal } from "lucide-react"
import { type VoteValue, VOTE_OPTIONS } from "@/types"
import { generateShareableUrl } from "@/lib/roomUtils"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PlanningRoomProps {
  roomId: string
  onLeaveRoom: (deletedRoomId?: string) => void
  onLogout?: () => void
}

export function PlanningRoom({ roomId, onLeaveRoom, onLogout }: PlanningRoomProps) {
  const { user, logout } = useAuth()
  const { room, loading, vote, resetRound, revealVotes, updateName, leaveRoom } = useRoom(roomId)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      leaveRoom()
    }
  }, [leaveRoom])

  // Check if room was deleted (room becomes null after existing)
  useEffect(() => {
    if (!loading && room === null) {
      console.log(`Room ${roomId} no longer exists, redirecting to room selector`)
      onLeaveRoom(roomId) // Pass the deleted room ID
    }
  }, [room, loading, roomId, onLeaveRoom])

  // Memoize computed values to prevent unnecessary re-renders
  const roomData = useMemo(() => {
    if (!room) return null

    const participants = room.participants || {}
    const votes = room.votes || {}
    const gameState = room.gameState || {
      isRevealed: false,
      roundId: `round_${Date.now()}`,
      createdAt: Date.now(),
      voteStartedAt: Date.now(),
    }

    const currentUser = user ? participants[user.uid] : null
    const participantsList = Object.values(participants)
    const votedCount = participantsList.filter((p) => p.hasVoted).length
    const canReveal = votedCount > 0 && votedCount === participantsList.length

    return {
      participants,
      votes,
      gameState,
      currentUser,
      participantsList,
      votedCount,
      canReveal,
    }
  }, [room, user])

  const copyShareableUrl = async () => {
    const url = generateShareableUrl(roomId)

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  const shareRoom = async () => {
    const url = generateShareableUrl(roomId)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Planning Poker - Sala ${roomId}`,
          text: `Únete a mi sesión de Planning Poker`,
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

  const handleLeaveRoom = async () => {
    await leaveRoom()
    onLeaveRoom()
  }

  const handleLogout = async () => {
    try {
      await leaveRoom() // Salir de la sala primero
      if (onLogout) {
        onLogout() // Limpiar estado en el componente padre
      }
      await logout() // Luego hacer logout
    } catch (error) {
      console.error("Error during logout:", error)
      // Forzar logout incluso si hay error
      if (onLogout) {
        onLogout()
      }
      await logout()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando sala {roomId}...</p>
        </div>
      </div>
    )
  }

  if (!room || !roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>La sala {roomId} no existe o fue eliminada</p>
          <Button onClick={() => onLeaveRoom()} className="mt-4">
            Volver al selector de salas
          </Button>
        </div>
      </div>
    )
  }

  const { participants, votes, gameState, currentUser, participantsList, votedCount, canReveal } = roomData

  const handleVote = (value: VoteValue) => {
    vote(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Improved Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row - Navigation and User */}
          <div className="flex justify-between items-center h-14 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Button onClick={handleLeaveRoom} variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-bold text-gray-900">Planning Poker</h1>
            </div>

            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">Hola, {currentUser.name}</div>
                    <div className="text-xs text-gray-500">Participante activo</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{currentUser.name.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {currentUser && (
                    <>
                      <EditNameDialog currentName={currentUser.name} onUpdateName={updateName} />
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Bottom row - Room info and Actions */}
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              {/* Room Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-sm font-medium">{roomId}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{participantsList.length}</span>
                  <span className="hidden sm:inline">participante{participantsList.length !== 1 ? "s" : ""}</span>
                </div>

                {participantsList.length === 1 && (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    Sala se eliminará si queda vacía
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Share Actions */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  onClick={copyShareableUrl}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="hidden md:inline">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="hidden md:inline">Copiar</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={shareRoom}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden md:inline">Compartir</span>
                </Button>
              </div>

              {/* Game Actions */}
              <div className="flex items-center gap-1">
                {canReveal && !gameState.isRevealed && (
                  <Button onClick={revealVotes} size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Revelar</span>
                  </Button>
                )}

                <Button
                  onClick={resetRound}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </div>

              {/* Mobile Share Menu */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={copyShareableUrl}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar URL
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareRoom}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vote Timeout Indicator */}
        <VoteTimeoutIndicator
          voteStartedAt={gameState.voteStartedAt}
          hasVoted={currentUser?.hasVoted || false}
          isRevealed={gameState.isRevealed}
        />

        {/* Voting Section */}
        {!currentUser?.hasVoted && !gameState.isRevealed && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4 text-center">Selecciona tu voto</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-2xl mx-auto">
                {VOTE_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleVote(option)}
                    variant="outline"
                    size="lg"
                    className="h-16 text-2xl font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User's vote display */}
        {currentUser?.hasVoted && currentUser && votes[currentUser.id] && !gameState.isRevealed && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Tu voto</h2>
                <div className="inline-block p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <div className="text-4xl font-bold font-mono text-primary">{votes[currentUser.id]}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {canReveal
                    ? "Todos han votado. Haz clic en 'Revelar' para ver los resultados."
                    : "Esperando a que todos los participantes voten..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Three main components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. Estado de la Votación */}
          <div>
            <ParticipantStatistics participants={participants} votes={votes} isRevealed={gameState.isRevealed} />
          </div>

          {/* 2. Lista de Participantes */}
          <div>
            <ParticipantsList participants={participants} votes={votes} isRevealed={gameState.isRevealed} />
          </div>

          {/* 3. Estadísticas de Votación (solo cuando se revelan) */}
          <div>
            {gameState.isRevealed && Object.keys(votes).length > 0 ? (
              <VoteStatistics votes={votes} participants={participants} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium mb-2">Estadísticas de Votación</h3>
                  <p className="text-sm">Las estadísticas se mostrarán cuando se revelen los votos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
