"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Check, Clock } from "lucide-react"
import type { Participant } from "@/types"

interface ParticipantsListProps {
  participants: Record<string, Participant>
  votes: Record<string, string>
  isRevealed: boolean
}

export const ParticipantsList = memo(function ParticipantsList({
  participants,
  votes,
  isRevealed,
}: ParticipantsListProps) {
  // Filter out invalid participants and ensure they have required properties
  const participantsList = Object.values(participants || {}).filter((participant) => {
    return participant && participant.id && typeof participant.name === "string" && participant.name.trim().length > 0
  })

  if (participantsList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participantes (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay participantes en la sala</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
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

            return (
              <div key={participantId} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {participantName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{participantName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {hasVoted ? (
                    <>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Votó
                      </Badge>
                      {isRevealed && userVote && (
                        <Badge variant="outline" className="font-mono">
                          {userVote}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Esperando
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})
