"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Check, Clock, Crown, X } from "lucide-react"
import type { Participant } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ParticipantsListProps {
  participants: Record<string, Participant>
  votes: Record<string, string>
  isRevealed: boolean
  isRoomCreator?: boolean
  currentUserId?: string
  creatorId?: string
  onKickUser?: (userId: string) => void
}

export const ParticipantsList = memo(function ParticipantsList({
  participants,
  votes,
  isRevealed,
  isRoomCreator = false,
  currentUserId,
  creatorId,
  onKickUser,
}: ParticipantsListProps) {
  // Filter out invalid participants and ensure they have required properties
  const participantsList = Object.values(participants || {}).filter((participant) => {
    return participant && participant.id && typeof participant.name === "string" && participant.name.trim().length > 0
  })

  if (participantsList.length === 0) {
    return (
      <Card className="shadow-sm border bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Users className="h-5 w-5 text-blue-600" />
            Participantes (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">No hay participantes en la sala</p>
            <p className="text-sm text-gray-500 mt-1">Comparte el enlace para invitar a tu equipo</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="shadow-sm border bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Users className="h-5 w-5 text-blue-600" />
            Participantes ({participantsList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participantsList.map((participant) => {
              // Additional safety checks
              const participantName = participant.name || "Usuario Anónimo"
              const participantId = participant.id
              const hasVoted = Boolean(participant.hasVoted)
              const userVote = votes && votes[participantId] ? votes[participantId] : null
              const isCreator = participantId === creatorId
              const isCurrentUser = participantId === currentUserId
              const showKickButton = isRoomCreator && !isCurrentUser && onKickUser

              return (
                <div
                  key={participantId}
                  className={`group relative flex items-center p-4 rounded-lg border transition-all duration-200 ${
                    isCreator
                      ? "bg-blue-50 border-blue-200"
                      : hasVoted
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Kick button - X in top right corner */}
                  {showKickButton && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm z-10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Expulsar participante</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres expulsar a <strong>{participantName}</strong> de la sala?
                            <br />
                            <br />
                            Esta acción no se puede deshacer y el usuario será redirigido automáticamente fuera de la
                            sala.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onKickUser(participantId)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Expulsar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Left side - Name and info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium text-gray-800 truncate cursor-default">{participantName}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{participantName}</p>
                          </TooltipContent>
                        </Tooltip>
                        {isCurrentUser && !isCreator && (
                          <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap">
                            Tú
                          </div>
                        )}
                      </div>
                      {hasVoted && (
                        <span className="text-xs text-gray-500">
                          Votó hace {Math.floor((Date.now() - (participant.joinedAt || 0)) / 60000)} min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side - Status indicators */}
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {/* Creator crown - always first */}
                    {isCreator && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Crown className="h-4 w-4 text-blue-600 cursor-default" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Creador de la sala</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Vote status */}
                    {hasVoted ? (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 font-medium"
                      >
                        <Check className="h-3 w-3" />
                        Votó
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-600 font-medium">
                        <Clock className="h-3 w-3" />
                        {isCreator ? "Opcional" : "Esperando"}
                      </Badge>
                    )}

                    {/* Vote value when revealed */}
                    {isRevealed && userVote && (
                      <Badge
                        variant="outline"
                        className="font-mono text-lg px-3 py-1 bg-white border-2 border-blue-300 text-blue-800 font-bold"
                      >
                        {userVote}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Room creator info */}
          {isRoomCreator && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Crown className="h-4 w-4 inline mr-1" />
                <strong>Eres el creador de la sala.</strong> Tu voto es opcional. Puedes expulsar participantes, revelar
                votos y controlar las rondas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
})
