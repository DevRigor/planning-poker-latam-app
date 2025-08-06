"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle, LogOut } from "lucide-react"
import { VOTE_TIMEOUT_MS } from "@/types"

interface VoteTimeoutIndicatorProps {
  voteStartedAt: number | undefined
  hasVoted: boolean
  isRevealed: boolean
}

export function VoteTimeoutIndicator({ voteStartedAt, hasVoted, isRevealed }: VoteTimeoutIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!voteStartedAt || hasVoted || isRevealed) {
      setTimeRemaining(0)
      setIsExpired(false)
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - voteStartedAt
      const remaining = Math.max(0, VOTE_TIMEOUT_MS - elapsed)

      setTimeRemaining(remaining)
      setIsExpired(remaining === 0)
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [voteStartedAt, hasVoted, isRevealed])

  if (!voteStartedAt || hasVoted || isRevealed || timeRemaining === 0) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)
  const progress = ((VOTE_TIMEOUT_MS - timeRemaining) / VOTE_TIMEOUT_MS) * 100

  const isUrgent = timeRemaining < 60000 // Less than 1 minute
  const isCritical = timeRemaining < 30000 // Less than 30 seconds

  return (
    <Alert variant={isCritical ? "destructive" : isUrgent ? "warning" : "default"} className="mb-4">
      <div className="flex items-center gap-2">
        {isCritical ? (
          <LogOut className="h-4 w-4" />
        ) : isUrgent ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <div className="flex-1">
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {isCritical ? "¡Serás desconectado!" : isUrgent ? "¡Vota pronto!" : "Tiempo para votar"}
              </span>
              <span className="font-mono text-sm">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs mt-1 opacity-75">
              {isCritical
                ? "Tu sesión se cerrará automáticamente si no votas"
                : isUrgent
                  ? "Los usuarios inactivos son desconectados automáticamente"
                  : "Tienes 5 minutos para votar antes de ser desconectado"}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
