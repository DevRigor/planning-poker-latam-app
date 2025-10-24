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
          {/* Estado de la votación */}
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

          {/* Muestra el voto actual sin botón de cambio */}
          {hasVoted && userVote && !isRevealed && (
            <div className="text-center p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="text-sm text-blue-700 font-medium mb-1">Tu voto:</div>
              <div className="text-3xl font-bold font-mono text-blue-800">{userVote}</div>
            </div>
          )}

          {/* Botones centrados */}
          {!isRevealed && (
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-3">
                {VOTE_OPTIONS.map((option) => {
                  const isSelected = hasVoted && userVote === option
                  return (
                    <Button
                      key={option}
                      onClick={() => onVote(option)}
                      variant="outline"
                      size="lg"
                      className={`h-16 w-20 text-xl font-mono transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                          : "bg-white border-2 border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      }`}
                    >
                      {option}
                    </Button>
                  )
                })}
              </div>
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
                  : "Puedes cambiar tu voto en cualquier momento antes de que se revelen los resultados."}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
