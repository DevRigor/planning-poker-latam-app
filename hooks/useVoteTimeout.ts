"use client"

import { useEffect, useRef } from "react"
import { ref, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { VOTE_TIMEOUT_MS } from "@/types"
import type { Room } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export function useVoteTimeout(room: Room | null, currentUserId: string | null) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!room || !currentUserId) {
      return
    }

    const gameState = room.gameState
    const currentUser = room.participants[currentUserId]
    const isCreator = gameState.createdBy === currentUserId

    // Only start timeout if:
    // 1. Game is not revealed
    // 2. User hasn't voted
    // 3. There's a vote start time
    // 4. User exists in participants
    // 5. User is NOT the creator (creator can choose not to vote)
    if (!gameState.isRevealed && currentUser && !currentUser.hasVoted && gameState.voteStartedAt && !isCreator) {
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
    }
  }, [room, currentUserId, logout, router])

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

      // Then logout the user and redirect to home
      await logout()
      router.push("/")
    } catch (error) {
      console.error(`Error logging out user ${userId} due to timeout:`, error)
    }
  }

  const removeUserFromRoom = async (userId: string) => {
    try {
      console.log(`Removing user ${userId} from room due to timeout`)

      // Get current room ID from URL or room data
      const roomId = room?.gameState ? (Object.keys(room.participants).length > 0 ? "current-room" : null) : null

      if (!roomId) {
        console.error("Could not determine room ID for cleanup")
        return
      }

      const participantRef = ref(database, `rooms/${roomId}/participants/${userId}`)
      const voteRef = ref(database, `rooms/${roomId}/votes/${userId}`)

      await Promise.allSettled([remove(participantRef), remove(voteRef)])

      console.log(`Successfully removed user ${userId} from room`)
    } catch (error) {
      console.error(`Error removing user ${userId} from room:`, error)
    }
  }
}
