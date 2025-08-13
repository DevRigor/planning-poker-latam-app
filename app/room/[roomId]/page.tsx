"use client"

import { useAuth } from "@/contexts/AuthContext"
import { LoginCard } from "@/components/LoginCard"
import { PlanningRoom } from "@/components/PlanningRoom"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface RoomPageProps {
  params: {
    roomId: string
  }
}

export default function RoomPage({ params }: RoomPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [roomId, setRoomId] = useState<string>("")

  // Extract roomId from params
  useEffect(() => {
    if (params.roomId) {
      setRoomId(params.roomId)
    }
  }, [params.roomId])

  const handleLeaveRoom = () => {
    router.push("/")
  }

  // Show loading while auth is loading or roomId is not set
  if (loading || !roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando sala {params.roomId}...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show login with pending room
  if (!user) {
    return <LoginCard pendingRoomId={roomId} />
  }

  // User is authenticated, show the room
  return <PlanningRoom roomId={roomId} onLeaveRoom={handleLeaveRoom} />
}
