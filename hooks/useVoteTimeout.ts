"use client"

import { useEffect, useRef } from "react"
import { ref, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { VOTE_TIMEOUT_MS } from "@/types"
import type { Room } from "@/types"
import { useAuth } from "@/contexts/AuthContext"

export function useVoteTimeout(room: Room | null, currentUserId: string | null) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { logout } = useAuth()

  useEffect(() => {
    // TEMPORALMENTE DESHABILITADO para evitar conflictos
    console.log("Vote timeout hook temporarily disabled")
    return

    if (!room || !currentUserId) {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      return
    }

    const gameState = room.gameState
    const currentUser = room.participants[currentUserId]

    // Only start timeout if:
    // 1. Game is not revealed
    // 2. User hasn't voted
    // 3. There's a vote start time
    // 4. User exists in participants
    if (!gameState.isRevealed && currentUser && !currentUser.hasVoted && gameState.voteStartedAt) {
      const timeElapsed = Date.now() - gameState.voteStartedAt
      const timeRemaining = VOTE_TIMEOUT_MS - timeElapsed

      console.log(`Vote timeout: ${timeRemaining}ms remaining for user ${currentUser.name}`)

      if (timeRemaining > 0) {
        // Set timeout for remaining time
        timeoutRef.current = setTimeout(() => {
          console.log(`Vote timeout reached for user ${currentUser.name}, logging out user`)
          logoutUserDueToTimeout(currentUserId, currentUser.name)
        }, timeRemaining)
      } else if (timeElapsed > VOTE_TIMEOUT_MS) {
        // Time already expired, logout immediately
        console.log(`Vote timeout already expired for user ${currentUser.name}, logging out user`)
        logoutUserDueToTimeout(currentUserId, currentUser.name)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [room, currentUserId, logout])

  const logoutUserDueToTimeout = async (userId: string, userName: string) => {
    try {
      console.log(`Logging out user ${userName} (${userId}) due to vote timeout`)

      // First remove user from room
      await removeUserFromRoom(userId)

      // Store timeout information with current timestamp
      if (typeof window !== "undefined") {
        localStorage.setItem("voteTimeoutLogout", "true")
        localStorage.setItem("voteTimeoutTimestamp", Date.now().toString())
        console.log("Stored timeout information in localStorage with timestamp:", Date.now())
      }

      // Then logout the user
      await logout()
    } catch (error) {
      console.error(`Error logging out user ${userId} due to timeout:`, error)
    }
  }

  const removeUserFromRoom = async (userId: string) => {
    try {
      console.log(`Removing user ${userId} from room due to timeout`)

      const participantRef = ref(database, `room/participants/${userId}`)
      const voteRef = ref(database, `room/votes/${userId}`)

      await Promise.allSettled([remove(participantRef), remove(voteRef)])

      console.log(`Successfully removed user ${userId} from room`)
    } catch (error) {
      console.error(`Error removing user ${userId} from room:`, error)
    }
  }
}
