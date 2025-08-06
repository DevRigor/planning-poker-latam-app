"use client"

import { useAuth } from "@/contexts/AuthContext"
import { LoginCard } from "@/components/LoginCard"
import { PlanningRoom } from "@/components/PlanningRoom"
import { RoomSelector } from "@/components/RoomSelector"
import { FirebaseSetupGuide } from "@/components/FirebaseSetupGuide"
import { DomainAuthGuide } from "@/components/DomainAuthGuide"
import { SuccessBanner } from "@/components/SuccessBanner"
import { StorageDebugger } from "@/components/StorageDebugger"
import { getRoomIdFromUrl, isValidRoomId } from "@/lib/roomUtils"
import { cleanupAllScheduledCleanups } from "@/lib/roomCleanup"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function Home() {
  const { user, loading, isFirebaseConfigured, needsDomainAuth, error } = useAuth()
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [roomDeletedMessage, setRoomDeletedMessage] = useState<string | null>(null)
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null) // Para preservar roomId durante login

  // Check URL for room ID on mount and when auth state changes
  useEffect(() => {
    const roomIdFromUrl = getRoomIdFromUrl()

    if (roomIdFromUrl && isValidRoomId(roomIdFromUrl)) {
      console.log(`Found room ID in URL: ${roomIdFromUrl}`)

      if (user) {
        // Usuario autenticado, ir directamente a la sala
        setCurrentRoomId(roomIdFromUrl)
        setPendingRoomId(null)
      } else if (!loading) {
        // Usuario no autenticado, preservar roomId para después del login
        setPendingRoomId(roomIdFromUrl)
        setCurrentRoomId(null)
        console.log(`User not authenticated, preserving room ID: ${roomIdFromUrl}`)
      }
    } else if (roomIdFromUrl && !isValidRoomId(roomIdFromUrl)) {
      // URL inválida, limpiar y redirigir al inicio
      console.log(`Invalid room ID in URL: ${roomIdFromUrl}, redirecting to home`)
      window.history.replaceState({}, "", "/")
      setCurrentRoomId(null)
      setPendingRoomId(null)
    } else {
      // No hay roomId en URL
      setCurrentRoomId(null)
      setPendingRoomId(null)
    }
  }, [user, loading])

  // Cuando el usuario se autentica y hay un roomId pendiente, redirigir a la sala
  useEffect(() => {
    if (user && pendingRoomId && !currentRoomId) {
      console.log(`User authenticated, redirecting to pending room: ${pendingRoomId}`)
      setCurrentRoomId(pendingRoomId)
      setPendingRoomId(null)
    }
  }, [user, pendingRoomId, currentRoomId])

  // Cleanup scheduled room cleanups when component unmounts
  useEffect(() => {
    return () => {
      cleanupAllScheduledCleanups()
    }
  }, [])

  const handleRoomSelect = (roomId: string) => {
    setCurrentRoomId(roomId)
    setRoomDeletedMessage(null) // Clear any previous messages
    // Update URL
    window.history.pushState({}, "", `/room/${roomId}`)
  }

  const handleLeaveRoom = (deletedRoomId?: string) => {
    if (deletedRoomId) {
      setRoomDeletedMessage(`La sala "${deletedRoomId}" fue eliminada porque quedó vacía.`)
    }
    setCurrentRoomId(null)
    setPendingRoomId(null)
    // Clear URL
    window.history.pushState({}, "", "/")
  }

  const handleLogout = () => {
    // Limpiar estado y URL cuando el usuario se desloguea
    setCurrentRoomId(null)
    setPendingRoomId(null)
    window.history.pushState({}, "", "/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando configuración de Firebase...</p>
        </div>
      </div>
    )
  }

  // Show domain authorization guide if needed
  if (needsDomainAuth) {
    return <DomainAuthGuide />
  }

  // Show setup guide if Firebase is not configured
  if (!isFirebaseConfigured || (error && error.includes("configuración"))) {
    return <FirebaseSetupGuide />
  }

  // Show login card if user is not authenticated
  if (!user) {
    return (
      <>
        <LoginCard
          pendingRoomId={pendingRoomId}
          onClearPendingRoom={() => {
            setPendingRoomId(null)
            window.history.pushState({}, "", "/")
          }}
        />
        <StorageDebugger />
      </>
    )
  }

  // Show room selector if no room is selected
  if (!currentRoomId) {
    return (
      <>
        <SuccessBanner />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Room deleted message */}
          {roomDeletedMessage && (
            <div className="max-w-2xl mx-auto pt-8 px-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-blue-800">{roomDeletedMessage}</AlertDescription>
              </Alert>
            </div>
          )}
          <RoomSelector onRoomSelect={handleRoomSelect} />
        </div>
        <StorageDebugger />
      </>
    )
  }

  // Show planning room for the selected room
  return (
    <>
      <SuccessBanner />
      <PlanningRoom roomId={currentRoomId} onLeaveRoom={handleLeaveRoom} onLogout={handleLogout} />
      <StorageDebugger />
    </>
  )
}
