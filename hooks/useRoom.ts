"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ref, onValue, set, remove, onDisconnect } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Room, Participant, GameState, VoteValue } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useVoteTimeout } from "./useVoteTimeout"
import { schedulePassiveRoomCleanup, cancelRoomCleanup } from "@/lib/roomCleanup"

export function useRoom(roomId: string | null) {
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const hasJoinedRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const previousParticipantCountRef = useRef<number>(0)

  // Use vote timeout hook
  useVoteTimeout(room, user?.uid || null)

  useEffect(() => {
    if (!user || !roomId) {
      setLoading(false)
      setRoom(null)
      hasJoinedRef.current = false
      return
    }

    console.log(`Setting up Firebase room listener for room: ${roomId}, user: ${user.email}`)
    const roomRef = ref(database, `rooms/${roomId}`)

    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val()
        console.log(`Firebase room data updated for ${roomId}:`, data)

        if (data) {
          // Ensure all required properties exist and clean up invalid participants
          const cleanParticipants: Record<string, Participant> = {}
          const participants = data.participants || {}

          // Filter and validate participants
          Object.entries(participants).forEach(([id, participant]: [string, any]) => {
            if (
              participant &&
              typeof participant === "object" &&
              participant.id &&
              typeof participant.name === "string" &&
              participant.name.trim().length > 0
            ) {
              cleanParticipants[id] = {
                id: participant.id,
                name: participant.name.trim(),
                hasVoted: Boolean(participant.hasVoted),
                joinedAt: participant.joinedAt || Date.now(),
                lastSeen: participant.lastSeen,
                voteStartedAt: participant.voteStartedAt,
              }
            } else {
              console.warn("Removing invalid participant:", id, participant)
            }
          })

          const currentParticipantCount = Object.keys(cleanParticipants).length
          const previousCount = previousParticipantCountRef.current

          console.log(`Room ${roomId} participant count: ${previousCount} → ${currentParticipantCount}`)

          // Check if room became empty - use passive cleanup
          if (currentParticipantCount === 0 && previousCount > 0) {
            console.log(`Room ${roomId} became empty, scheduling passive cleanup`)
            schedulePassiveRoomCleanup(roomId)
          } else if (currentParticipantCount > 0 && previousCount === 0) {
            console.log(`Room ${roomId} is no longer empty, canceling cleanup`)
            cancelRoomCleanup(roomId)
          }

          previousParticipantCountRef.current = currentParticipantCount

          const roomData: Room = {
            participants: cleanParticipants,
            votes: data.votes || {},
            gameState: data.gameState || {
              isRevealed: false,
              roundId: `round_${Date.now()}`,
              createdAt: Date.now(),
              voteStartedAt: Date.now(),
              createdBy: user.uid,
            },
            roomInfo: data.roomInfo || {
              id: roomId,
              createdAt: Date.now(),
              createdBy: user.uid,
            },
          }
          setRoom(roomData)
        } else {
          // Room doesn't exist - either deleted or never created
          console.log(`Room ${roomId} doesn't exist`)

          // If we had participants before, it means the room was deleted
          if (previousParticipantCountRef.current > 0) {
            console.log(`Room ${roomId} was deleted, redirecting to room selector`)
            setRoom(null)
            // The parent component should handle this by showing room selector
          } else {
            // Initialize empty room if it doesn't exist and we're the first user
            const now = Date.now()
            const initialRoom: Room = {
              participants: {},
              votes: {},
              gameState: {
                isRevealed: false,
                roundId: `round_${now}`,
                createdAt: now,
                voteStartedAt: now,
                createdBy: user.uid,
              },
              roomInfo: {
                id: roomId,
                createdAt: now,
                createdBy: user.uid,
              },
            }
            console.log(`Initializing new room ${roomId}:`, initialRoom)
            setRoom(initialRoom)

            // Initialize the room in Firebase (only once)
            set(roomRef, initialRoom).catch((error) => {
              console.error(`Error initializing room ${roomId}:`, error)
            })
          }

          previousParticipantCountRef.current = 0
        }
        setLoading(false)
      },
      (error) => {
        console.error(`Firebase room listener error for ${roomId}:`, error)
        setLoading(false)
      },
    )

    return () => {
      console.log(`Cleaning up room listener for ${roomId}`)
      unsubscribe()
      // Cancel any scheduled cleanup when component unmounts
      cancelRoomCleanup(roomId)
    }
  }, [user, roomId])

  // Join room when user is authenticated and room is loaded
  useEffect(() => {
    if (user && room && roomId && !hasJoinedRef.current) {
      hasJoinedRef.current = true
      joinRoom()
    }
  }, [user, room, roomId])

  // Setup cleanup on page unload/close
  useEffect(() => {
    if (!user || !roomId) return

    const handleBeforeUnload = () => {
      console.log("Page unloading, cleanup will be handled by Firebase onDisconnect")
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("Page hidden, user might be leaving")
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user, roomId])

  const joinRoom = useCallback(async () => {
    if (!user || !roomId) return

    try {
      console.log(`Joining Firebase room ${roomId} as:`, user.displayName)
      const now = Date.now()

      // Cancel any scheduled cleanup since someone is joining
      cancelRoomCleanup(roomId)

      // Ensure we have a valid name
      const userName = user.displayName?.trim() || user.email?.split("@")[0] || "Usuario Anónimo"

      const participant: Participant = {
        id: user.uid,
        name: userName,
        hasVoted: false,
        joinedAt: now,
        lastSeen: now,
        voteStartedAt: room?.gameState?.voteStartedAt || now,
      }

      const participantRef = ref(database, `rooms/${roomId}/participants/${user.uid}`)
      const voteRef = ref(database, `rooms/${roomId}/votes/${user.uid}`)

      // Set up automatic cleanup on disconnect
      const participantDisconnectRef = onDisconnect(participantRef)
      const voteDisconnectRef = onDisconnect(voteRef)

      await Promise.all([
        participantDisconnectRef.remove(),
        voteDisconnectRef.remove(),
        set(participantRef, participant),
      ])

      console.log(`Set up automatic cleanup on disconnect for ${userName} in room ${roomId}`)

      // Store cleanup function
      cleanupRef.current = () => {
        participantDisconnectRef.cancel()
        voteDisconnectRef.cancel()
      }
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error)
    }
  }, [user, room, roomId])

  const leaveRoom = useCallback(async () => {
    if (!user || !roomId) {
      console.log("No user or roomId found, skipping room cleanup")
      return
    }

    try {
      console.log(`Leaving Firebase room ${roomId}:`, user.displayName)

      // Cancel automatic cleanup since we're manually leaving
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      const participantRef = ref(database, `rooms/${roomId}/participants/${user.uid}`)
      const voteRef = ref(database, `rooms/${roomId}/votes/${user.uid}`)

      // Use Promise.allSettled to handle individual failures gracefully
      const results = await Promise.allSettled([remove(participantRef), remove(voteRef)])

      // Log any failures but don't throw
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const refName = index === 0 ? "participant" : "vote"
          console.warn(`Failed to remove ${refName} data from room ${roomId}:`, result.reason)
        }
      })

      hasJoinedRef.current = false
      console.log(`Room cleanup completed for ${user.displayName} in room ${roomId}`)

      // After leaving, schedule passive cleanup (only if user is still authenticated)
      setTimeout(() => {
        if (user) {
          schedulePassiveRoomCleanup(roomId)
        }
      }, 5000) // Small delay to allow Firebase to process the removal
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error)
      // Don't throw the error to prevent blocking logout
    }
  }, [user, roomId])

  const vote = useCallback(
    async (value: VoteValue) => {
      if (!user || !room || !roomId) return

      try {
        console.log(`Voting in Firebase room ${roomId}:`, value, "by", user.displayName)

        // Update participant's hasVoted status and vote simultaneously
        const participantRef = ref(database, `rooms/${roomId}/participants/${user.uid}/hasVoted`)
        const voteRef = ref(database, `rooms/${roomId}/votes/${user.uid}`)

        await Promise.all([set(participantRef, true), set(voteRef, value)])

        console.log("Vote recorded successfully")
      } catch (error) {
        console.error("Error voting:", error)
      }
    },
    [user, room, roomId],
  )

  const revealVotes = useCallback(async () => {
    if (!user || !roomId) return

    try {
      console.log(`Revealing votes manually in room ${roomId} by:`, user.displayName)
      const gameStateRef = ref(database, `rooms/${roomId}/gameState/isRevealed`)
      await set(gameStateRef, true)
    } catch (error) {
      console.error("Error revealing votes:", error)
    }
  }, [user, roomId])

  const resetRound = useCallback(async () => {
    if (!user || !roomId) return

    try {
      console.log(`Resetting Firebase round in room ${roomId} by:`, user.displayName)

      const now = Date.now()
      const newGameState: GameState = {
        isRevealed: false,
        roundId: `round_${now}`,
        createdAt: now,
        voteStartedAt: now, // Reset vote start time
        createdBy: room?.gameState?.createdBy || user.uid,
      }

      // Reset game state and clear votes simultaneously
      const gameStateRef = ref(database, `rooms/${roomId}/gameState`)
      const votesRef = ref(database, `rooms/${roomId}/votes`)

      await Promise.all([set(gameStateRef, newGameState), set(votesRef, {})])

      // Reset all participants' hasVoted status and update their voteStartedAt
      const participants = room?.participants || {}
      const resetPromises = Object.keys(participants).map((participantId) => {
        const hasVotedRef = ref(database, `rooms/${roomId}/participants/${participantId}/hasVoted`)
        const voteStartedAtRef = ref(database, `rooms/${roomId}/participants/${participantId}/voteStartedAt`)
        return Promise.all([set(hasVotedRef, false), set(voteStartedAtRef, now)])
      })

      await Promise.all(resetPromises)
      console.log(`Round reset completed in room ${roomId} with new vote timeout`)
    } catch (error) {
      console.error("Error resetting round:", error)
    }
  }, [user, room, roomId])

  const updateName = useCallback(
    async (newName: string) => {
      if (!user || !newName.trim() || !roomId) return

      try {
        console.log(`Updating name in Firebase room ${roomId} to:`, newName.trim())
        const nameRef = ref(database, `rooms/${roomId}/participants/${user.uid}/name`)
        await set(nameRef, newName.trim())
      } catch (error) {
        console.error("Error updating name:", error)
      }
    },
    [user, roomId],
  )

  return {
    room,
    loading,
    joinRoom,
    leaveRoom,
    vote,
    revealVotes,
    resetRound,
    updateName,
  }
}
