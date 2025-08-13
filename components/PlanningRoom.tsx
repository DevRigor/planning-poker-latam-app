"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useRoom } from "@/hooks/useRoom"
import { ArrowLeft, Users, LogOut, Copy, Check, Share2, Edit2, Save, X, Crown } from "lucide-react"
import { VotingCard } from "@/components/VotingCard"
import { ParticipantsList } from "@/components/ParticipantsList"
import { VoteStatistics } from "@/components/VoteStatistics"
import { ParticipantStatistics } from "@/components/ParticipantStatistics"
import { VoteTimeoutIndicator } from "@/components/VoteTimeoutIndicator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PlanningRoomProps {
  roomId: string
  onLeaveRoom: () => void
}

export function PlanningRoom({ roomId, onLeaveRoom }: PlanningRoomProps) {
  const { user, logout } = useAuth()
  const { room, loading, vote, resetRound, revealVotes, leaveRoom, updateStoryName, kickUser, isRoomCreator } =
    useRoom(roomId)
  const [copied, setCopied] = useState(false)
  const [isEditingStory, setIsEditingStory] = useState(false)
  const [storyName, setStoryName] = useState("")

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom()
    } catch (error) {
      console.error("Error leaving room:", error)
    } finally {
      onLeaveRoom()
    }
  }

  const handleLogout = async () => {
    try {
      await leaveRoom()
      await logout()
    } catch (error) {
      console.error("Error during logout:", error)
      await logout()
    }
  }

  const copyRoomUrl = async () => {
    try {
      const url = `${window.location.origin}/room/${roomId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareRoom = async () => {
    const url = `${window.location.origin}/room/${roomId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Planning Poker - Únete a mi sala",
          text: `Únete a mi sala de Planning Poker: ${roomId}`,
          url: url,
        })
      } catch (err) {
        console.log("Error sharing:", err)
        // Fallback to copy
        copyRoomUrl()
      }
    } else {
      // Fallback to copy
      copyRoomUrl()
    }
  }

  const handleSaveStoryName = async () => {
    if (storyName.trim()) {
      await updateStoryName(storyName.trim())
      setIsEditingStory(false)
    }
  }

  const handleCancelEdit = () => {
    setStoryName(room?.storyName || "")
    setIsEditingStory(false)
  }

  const startEditingStory = () => {
    if (!isRoomCreator) return
    setStoryName(room?.storyName || "")
    setIsEditingStory(true)
  }

  const handleKickUser = async (userId: string) => {
    if (kickUser) {
      await kickUser(userId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando sala {roomId}...</p>
          <p className="text-sm text-gray-500 mt-1">Conectando con Firebase...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <X className="h-10 w-10 text-red-600" />
          </div>
          <p className="text-lg font-medium text-gray-700">Error cargando la sala {roomId}</p>
          <p className="text-sm text-gray-500 mt-1">La sala no existe o no tienes permisos para acceder</p>
          <Button onClick={onLeaveRoom} className="mt-4">
            Volver al selector de salas
          </Button>
        </div>
      </div>
    )
  }

  const participants = Object.values(room.participants || {})
  const currentUser = user ? room.participants?.[user.uid] : null
  const userVote = user ? room.votes?.[user.uid] : null
  const hasVoted = Boolean(currentUser?.hasVoted)
  const isRevealed = Boolean(room.gameState?.isRevealed)
  const allParticipantsCount = participants.length
  const votedParticipantsCount = participants.filter((p) => p.hasVoted).length

  // For "can reveal" logic, exclude creator from required votes if they haven't voted
  const nonCreatorParticipants = participants.filter((p) => p.id !== room.gameState?.createdBy)
  const nonCreatorVotedCount = nonCreatorParticipants.filter((p) => p.hasVoted).length
  const creatorHasVoted = room.gameState?.createdBy
    ? Boolean(room.participants?.[room.gameState.createdBy]?.hasVoted)
    : false

  // Can reveal if all non-creators have voted, OR if all participants (including creator) have voted
  const canReveal =
    (nonCreatorParticipants.length > 0 && nonCreatorVotedCount === nonCreatorParticipants.length) ||
    (votedParticipantsCount > 0 && votedParticipantsCount === allParticipantsCount)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button onClick={handleLeaveRoom} variant="ghost" size="sm" className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-blue-600">Planning Poker</h1>
                  {isRoomCreator && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                      <Crown className="h-3 w-3" />
                      Creador
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">Sala: {roomId}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <Users className="h-4 w-4" />
                <span className="font-medium">{participants.length} participantes</span>
              </div>

              {/* Share dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={copyRoomUrl}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar enlace
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareRoom}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={handleLogout} variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Voting */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story Name Section */}
            <Card className="shadow-sm border bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <Edit2 className="h-5 w-5 text-blue-600" />
                    Historia de Usuario
                  </div>
                  {!isEditingStory && isRoomCreator && (
                    <Button onClick={startEditingStory} variant="ghost" size="sm" className="hover:bg-blue-50">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {!isRoomCreator && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Solo el creador puede editar
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingStory ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="storyName" className="text-gray-700 font-medium">
                        Nombre de la Historia
                      </Label>
                      <Input
                        id="storyName"
                        value={storyName}
                        onChange={(e) => setStoryName(e.target.value)}
                        placeholder="Ej: Como usuario, quiero poder..."
                        maxLength={200}
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveStoryName()
                          if (e.key === "Escape") handleCancelEdit()
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveStoryName} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[60px] flex items-center">
                    {room.storyName ? (
                      <p className="text-lg text-gray-800 leading-relaxed">{room.storyName}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        {isRoomCreator
                          ? "Haz clic en el ícono de editar para añadir una Historia de Usuario"
                          : "El creador de la sala puede añadir una Historia de Usuario"}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vote Timeout Indicator */}
            <VoteTimeoutIndicator
              voteStartedAt={room.gameState?.voteStartedAt}
              hasVoted={hasVoted}
              isRevealed={isRevealed}
              isCreator={isRoomCreator}
            />

            {/* Voting Card */}
            <VotingCard
              onVote={vote}
              onReset={resetRound}
              onReveal={revealVotes}
              userVote={userVote}
              hasVoted={hasVoted}
              isRevealed={isRevealed}
              allParticipantsCount={allParticipantsCount}
              votedParticipantsCount={votedParticipantsCount}
              canReveal={canReveal}
              isRoomCreator={isRoomCreator}
            />

            {/* Vote Statistics - Only show when revealed */}
            {isRevealed && Object.keys(room.votes || {}).length > 0 && (
              <VoteStatistics votes={room.votes || {}} participants={room.participants || {}} />
            )}
          </div>

          {/* Right Column - Participants and Stats */}
          <div className="space-y-6">
            {/* Participant Statistics */}
            <ParticipantStatistics
              participants={room.participants || {}}
              votes={room.votes || {}}
              isRevealed={isRevealed}
            />

            {/* Participants List */}
            <ParticipantsList
              participants={room.participants || {}}
              votes={room.votes || {}}
              isRevealed={isRevealed}
              isRoomCreator={isRoomCreator}
              currentUserId={user?.uid}
              creatorId={room.gameState?.createdBy}
              onKickUser={handleKickUser}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
