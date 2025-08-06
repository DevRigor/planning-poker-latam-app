"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type VoteValue, VOTE_OPTIONS } from "@/types"
import { Vote, RotateCcw, Eye } from "lucide-react"

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
}: VotingCardProps) {
  // Ensure we have valid numbers
  const totalParticipants = Math.max(allParticipantsCount || 0, 0)
  const votedCount = Math.max(votedParticipantsCount || 0, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Tu Voto
          </div>
          <div className="flex items-center gap-2">
            {canReveal && !isRevealed && (
              <Button onClick={onReveal} variant="default" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Revelar Votos
              </Button>
            )}
            <Button onClick={onReset} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Nueva Ronda
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Voting Status */}
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-sm text-muted-foreground mb-2">Estado de la votación</div>
            <div className="text-lg font-semibold">
              {votedCount} de {totalParticipants} han votado
            </div>
            {isRevealed ? (
              <Badge variant="secondary" className="mt-2">
                Votos revelados
              </Badge>
            ) : canReveal ? (
              <Badge variant="default" className="mt-2">
                Listo para revelar
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-2">
                Esperando votos
              </Badge>
            )}
          </div>

          {/* User's current vote */}
          {hasVoted && userVote && (
            <div className="text-center p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="text-sm text-muted-foreground mb-1">Tu voto:</div>
              <div className="text-2xl font-bold font-mono">{userVote}</div>
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
                  className="h-16 text-xl font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {hasVoted && !isRevealed && (
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-green-800 font-medium">✅ Voto registrado</div>
              <div className="text-sm text-green-600 mt-1">
                {canReveal
                  ? "Todos han votado. Haz clic en 'Revelar Votos' para ver los resultados."
                  : "Esperando a que todos los participantes voten..."}
              </div>
            </div>
          )}

          {/* Reveal button for mobile/small screens */}
          {canReveal && !isRevealed && (
            <div className="block sm:hidden">
              <Button onClick={onReveal} className="w-full" size="lg">
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
