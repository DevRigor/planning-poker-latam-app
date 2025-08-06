"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, CheckCircle, BarChart3 } from "lucide-react"

interface ParticipantStatisticsProps {
  participants: Record<string, any>
  votes: Record<string, string>
  isRevealed: boolean
}

export const ParticipantStatistics = memo(function ParticipantStatistics({
  participants,
  votes,
  isRevealed,
}: ParticipantStatisticsProps) {
  // Filter out invalid participants and ensure they have required properties
  const participantsList = Object.values(participants || {}).filter((participant) => {
    return participant && participant.id && typeof participant.name === "string" && participant.name.trim().length > 0
  })

  const totalParticipants = participantsList.length
  const votedCount = participantsList.filter((p) => Boolean(p.hasVoted)).length
  const pendingCount = totalParticipants - votedCount
  const votingProgress = totalParticipants > 0 ? Math.round((votedCount / totalParticipants) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estado de la Votación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border">
            <div className="text-3xl font-bold text-blue-600 mb-1">{votingProgress}%</div>
            <div className="text-sm text-blue-800 mb-3">Progreso de Votación</div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${votingProgress}%` }}
              />
            </div>
          </div>

          {/* Voting Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600">{votedCount}</div>
              <div className="text-xs text-green-800">Votaron</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-yellow-800">Pendientes</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-600">{totalParticipants}</div>
              <div className="text-xs text-blue-800">Total</div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center p-3 rounded-lg bg-gray-50 border">
            {votingProgress === 100 ? (
              <div className="text-green-800">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                <strong>¡Todos han votado!</strong> {isRevealed ? "Resultados revelados." : "Listo para revelar."}
              </div>
            ) : votingProgress > 0 ? (
              <div className="text-blue-800">
                <Clock className="h-4 w-4 inline mr-1" />
                <strong>Votación en progreso...</strong> Esperando {pendingCount} participante
                {pendingCount !== 1 ? "s" : ""} más.
              </div>
            ) : (
              <div className="text-gray-600">
                <Users className="h-4 w-4 inline mr-1" />
                <strong>Esperando votos...</strong> Ningún participante ha votado aún.
              </div>
            )}
          </div>

          {/* Participants Status */}
          {totalParticipants > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm text-gray-700">Estado por Participante:</h4>
              <div className="space-y-1">
                {participantsList.map((participant) => {
                  const participantName = participant.name || "Usuario Anónimo"
                  const hasVoted = Boolean(participant.hasVoted)

                  return (
                    <div key={participant.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{participantName}</span>
                      <Badge variant={hasVoted ? "default" : "outline"} className="ml-2">
                        {hasVoted ? "✓ Votó" : "⏳ Esperando"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
