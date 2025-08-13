"use client"

import { useAuth } from "@/contexts/AuthContext"
import { LoginCard } from "@/components/LoginCard"
import { RoomSelector } from "@/components/RoomSelector"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleRoomSelect = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginCard />
  }

  return <RoomSelector onRoomSelect={handleRoomSelect} />
}
