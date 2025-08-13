"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ref, onValue, set, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { useVoteTimeout } from "@/hooks/useVoteTimeout"
import { scheduleRoomCleanup, cancelRoomCleanup } from "@/lib/roomCleanup"
import { useRouter } from "next/navigation"

interface Participant {
  id: string
  name: string
  hasVoted: boolean
  joinedAt: number
  voteStartedAt?: number
}

interface Room {
  participants: Record<string, Participant>
  votes: Record<string, string>
  gameState: {
    isRevealed: boolean
    roundId: string
    createdAt: number
    voteStartedAt?: number
    createdBy?: string
  }
  storyName?: string
}

export function useRoom(roomId: string) {
  const { user } = useAuth()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const hasJoinedRoom = useRef(false)
  const wasInRoom = useRef(false)
  const isLeavingRoom = useRef(false)

  // Use vote timeout hook
  useVoteTimeout(room, user?.uid || null)

  useEffect(() => {
    if (!user || !roomId) {
      console.log("useRoom: No user or roomId, stopping loading")
      setLoading(false)
      return
    }

    console.log(`useRoom: Setting up room listener for: ${roomId}`)
    const roomRef = ref(database, `rooms/${roomId}`)

    const unsubscribe = onValue(
      roomRef,
      async (snapshot) => {
        try {
          const data = snapshot.val()

          if (data) {
            console.log(`useRoom: Room data received for ${roomId}:`, Object.keys(data))

            // Check if user was kicked (was in room but no longer is)
            const userIsInRoom = Boolean(data.participants?.[user.uid])

            if (wasInRoom.current && !userIsInRoom && !isLeavingRoom.current) {
              console.log(`useRoom: User ${user.uid} was kicked from room ${roomId}`)
              // User was kicked, redirect to home
              router.push("/")
              return
            }

            setRoom(data)

            // Track if user is in room
            if (userIsInRoom) {
              wasInRoom.current = true
            }

            // Cancel any scheduled cleanup since room has participants
            const participantCount = Object.keys(data.participants || {}).length
            if (participantCount > 0) {
              cancelRoomCleanup(roomId)
            } else {
              // Schedule cleanup if room is empty
              scheduleRoomCleanup(roomId)
            }

            // Join room only once when we first get room data
            if (!hasJoinedRoom.current && user && !userIsInRoom) {
              console.log(`useRoom: Joining room ${roomId} as ${user.displayName || user.email}`)
              hasJoinedRoom.current = true
              wasInRoom.current = true

              const participant: Participant = {
                id: user.uid,
                name: user.displayName || user.email || "Usuario",
                hasVoted: false,
                joinedAt: Date.now(),
              }

              const participantRef = ref(database, `rooms/${roomId}/participants/${user.uid}`)
              await set(participantRef, participant)
            }
          } else {
            console.log(`useRoom: Creating new room: ${roomId}`)
            // Create new room with current user as creator
            const newRoom: Room = {
              participants: {},
              votes: {},
              gameState: {
                isRevealed: false,
                roundId: `round_${Date.now()}`,
                createdAt: Date.now(),
                createdBy: user.uid, // Set creator
              },
              storyName: "",
            }

            await set(roomRef, newRoom)
            // Don't set room state here, let the listener handle it
          }

          setLoading(false)
        } catch (error) {
          console.error(`useRoom: Error handling room data for ${roomId}:`, error)
          setLoading(false)
        }
      },
      (error) => {
        console.error(`useRoom: Error listening to room ${roomId}:`, error)
        setLoading(false)
      },
    )

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log(`useRoom: Timeout reached for room ${roomId}, stopping loading`)
        setLoading(false)
      }
    }, 15000) // 15 seconds timeout

    return () => {
      console.log(`useRoom: Cleaning up room listener for: ${roomId}`)
      hasJoinedRoom.current = false
      wasInRoom.current = false
      isLeavingRoom.current = false
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [user, roomId, router]) // Dependencies

  const vote = useCallback(
    async (value: string) => {
      if (!user || !roomId) return

      console.log(`useRoom: User ${user.displayName} voting: ${value}`)
      const participantRef = ref(database, `rooms/${roomId}/participants/${user.uid}/hasVoted`)
      const voteRef = ref(database, `rooms/${roomId}/votes/${user.uid}`)

      // Set vote start time if this is the first vote of the round
      const gameStateRef = ref(database, `rooms/${roomId}/gameState/voteStartedAt`)
      const voteStartedAt = room?.gameState?.voteStartedAt

      const promises = [set(participantRef, true), set(voteRef, value)]

      // Only set vote start time if it hasn't been set for this round
      if (!voteStartedAt) {
        promises.push(set(gameStateRef, Date.now()))
      }

      await Promise.all(promises)
    },
    [user, roomId, room],
  )

  const revealVotes = useCallback(async () => {
    if (!user || !roomId || !room) return

    // Only room creator can reveal votes
    if (room.gameState?.createdBy !== user.uid) {
      console.log("useRoom: Only room creator can reveal votes")
      return
    }

    console.log(`useRoom: Revealing votes for room: ${roomId}`)
    const gameStateRef = ref(database, `rooms/${roomId}/gameState/isRevealed`)
    await set(gameStateRef, true)
  }, [user, roomId, room])

  const resetRound = useCallback(async () => {
    if (!user || !roomId || !room) return

    // Only room creator can reset round
    if (room.gameState?.createdBy !== user.uid) {
      console.log("useRoom: Only room creator can reset round")
      return
    }

    console.log(`useRoom: Resetting round for room: ${roomId}`)
    const now = Date.now()
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`)
    const votesRef = ref(database, `rooms/${roomId}/votes`)

    await Promise.all([
      set(gameStateRef, {
        isRevealed: false,
        roundId: `round_${now}`,
        createdAt: now,
        createdBy: room.gameState?.createdBy, // Preserve creator
        // Don't set voteStartedAt here, it will be set when first vote comes in
      }),
      set(votesRef, {}),
    ])

    // Reset all participants' hasVoted status
    if (room?.participants) {
      const resetPromises = Object.keys(room.participants).map((participantId) => {
        const hasVotedRef = ref(database, `rooms/${roomId}/participants/${participantId}/hasVoted`)
        return set(hasVotedRef, false)
      })
      await Promise.all(resetPromises)
    }
  }, [user, roomId, room])

  const updateStoryName = useCallback(
    async (storyName: string) => {
      if (!user || !roomId || !room) return

      // Only room creator can update story name
      if (room.gameState?.createdBy !== user.uid) {
        console.log("useRoom: Only room creator can update story name")
        return
      }

      console.log(`useRoom: Updating story name for room ${roomId}: ${storyName}`)
      const storyNameRef = ref(database, `rooms/${roomId}/storyName`)
      await set(storyNameRef, storyName)
    },
    [user, roomId, room],
  )

  const kickUser = useCallback(
    async (userId: string) => {
      if (!user || !roomId || !room) return

      // Only room creator can kick users
      if (room.gameState?.createdBy !== user.uid) {
        console.log("useRoom: Only room creator can kick users")
        return
      }

      // Can't kick yourself
      if (userId === user.uid) {
        console.log("useRoom: Cannot kick yourself")
        return
      }

      console.log(`useRoom: Kicking user ${userId} from room: ${roomId}`)
      const participantRef = ref(database, `rooms/${roomId}/participants/${userId}`)
      const voteRef = ref(database, `rooms/${roomId}/votes/${userId}`)

      await Promise.all([remove(participantRef), remove(voteRef)])
    },
    [user, roomId, room],
  )

  const leaveRoom = useCallback(async () => {
    if (!user || !roomId) return

    console.log(`useRoom: User ${user.displayName} leaving room: ${roomId}`)
    isLeavingRoom.current = true

    const participantRef = ref(database, `rooms/${roomId}/participants/${user.uid}`)
    const voteRef = ref(database, `rooms/${roomId}/votes/${user.uid}`)

    await Promise.all([remove(participantRef), remove(voteRef)])
    hasJoinedRoom.current = false
    wasInRoom.current = false

    // Schedule room cleanup after user leaves
    scheduleRoomCleanup(roomId)
  }, [user, roomId])

  // Check if current user is room creator
  const isRoomCreator = Boolean(user && room?.gameState?.createdBy === user.uid)

  return {
    room,
    loading,
    vote,
    revealVotes,
    resetRound,
    updateStoryName,
    kickUser,
    leaveRoom,
    isRoomCreator,
  }
}
