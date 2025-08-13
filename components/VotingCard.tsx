"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type VoteValue, VOTE_OPTIONS } from "@/types"
import { Vote, RotateCcw, Eye, Lock, CheckCircle } from "lucide-react"

interface VotingCardProps {
  onVote: (value: VoteValue) => void
  onReset: () => void
  onReveal: () => void
  userVote?: string
  hasVoted: boolean
  isRevealed: boolean
  allParticipantsCount: number
  votedParticipantsCount: number
  canReveal: boolean
  isRoomCreator: boolean
}

export const VotingCard = memo(function VotingCard({
  onVote,
  onReset,
  onReveal,
  userVote,
  hasVoted,
  isRevealed,
  allParticipantsCount,
  votedParticipantsCount,
  canReveal,
  isRoomCreator,
}: VotingCardProps) {
  // Ensure we have valid numbers
  const totalParticipants = Math.max(allParticipantsCount || 0, 0)
  const votedCount = Math.max(votedParticipantsCount || 0, 0)

  return (
    <Card className="shadow-sm border bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-600" />
            Tu Voto
          </div>
          <div className="flex items-center gap-2">
            {canReveal && !isRevealed && isRoomCreator && (
              <Button
                onClick={onReveal}
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4" />
                Revelar Votos
              </Button>
            )}
            {canReveal && !isRevealed && !isRoomCreator && (
              <Button
                disabled
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-gray-100 text-gray-500"
              >
                <Lock className="h-4 w-4" />
                Solo el creador puede revelar
              </Button>
            )}
            {isRoomCreator && (
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Nueva Ronda
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Voting Status */}
          <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-700 mb-2 font-medium">Estado de la votación</div>
            <div className="text-2xl font-bold text-blue-800 mb-2">
              {votedCount} de {totalParticipants} han votado
            </div>
            {isRevealed ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                <CheckCircle className="h-3 w-3 mr-1" />
                Votos revelados
              </Badge>
            ) : canReveal ? (
              <Badge variant="default" className="bg-blue-600 text-white font-medium">
                {isRoomCreator ? "Listo para revelar" : "Esperando al creador"}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 font-medium">
                Esperando votos
              </Badge>
            )}
          </div>

          {/* User's current vote */}
          {hasVoted && userVote && (
            <div className="text-center p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="text-sm text-blue-700 mb-1 font-medium">Tu voto:</div>
              <div className="text-3xl font-bold font-mono text-blue-800">{userVote}</div>
            </div>
          )}

          {/* Voting buttons */}
          {!hasVoted && !isRevealed && (
            <div className="grid grid-cols-3 gap-3">
              {VOTE_OPTIONS.map((option) => (
                <Button
                  key={option}
                  onClick={() => onVote(option)}
                  variant="outline"
                  size="lg"
                  className="h-16 text-xl font-mono hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 bg-white border-2 border-gray-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {hasVoted && !isRevealed && (
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-blue-800 font-semibold text-lg">✅ Voto registrado</div>
              <div className="text-sm text-blue-700 mt-2 leading-relaxed">
                {canReveal
                  ? isRoomCreator
                    ? "Todos han votado. Haz clic en 'Revelar Votos' para ver los resultados."
                    : "Todos han votado. Esperando a que el creador revele los votos."
                  : "Esperando a que todos los participantes voten..."}
              </div>
            </div>
          )}

          {/* Reveal button for mobile/small screens */}
          {canReveal && !isRevealed && isRoomCreator && (
            <div className="block sm:hidden">
              <Button onClick={onReveal} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                <Eye className="mr-2 h-4 w-4" />
                Revelar Votos
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
