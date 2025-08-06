import { ref, remove, get } from "firebase/database"
import { database, auth } from "@/lib/firebase"

// Delay antes de eliminar una sala vacía (para evitar eliminaciones accidentales por desconexiones temporales)
const EMPTY_ROOM_CLEANUP_DELAY = 30000 // 30 segundos

// Map para trackear timeouts de limpieza por sala
const cleanupTimeouts = new Map<string, NodeJS.Timeout>()

export async function scheduleRoomCleanup(roomId: string) {
  console.log(`Scheduling cleanup check for room ${roomId} in ${EMPTY_ROOM_CLEANUP_DELAY}ms`)

  // Cancelar cualquier cleanup previo para esta sala
  const existingTimeout = cleanupTimeouts.get(roomId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
    cleanupTimeouts.delete(roomId)
  }

  // Programar nuevo cleanup
  const timeoutId = setTimeout(async () => {
    try {
      await checkAndCleanupRoom(roomId)
    } catch (error) {
      console.error(`Error during scheduled cleanup for room ${roomId}:`, error)
    } finally {
      cleanupTimeouts.delete(roomId)
    }
  }, EMPTY_ROOM_CLEANUP_DELAY)

  cleanupTimeouts.set(roomId, timeoutId)
}

export function cancelRoomCleanup(roomId: string) {
  const existingTimeout = cleanupTimeouts.get(roomId)
  if (existingTimeout) {
    console.log(`Canceling scheduled cleanup for room ${roomId}`)
    clearTimeout(existingTimeout)
    cleanupTimeouts.delete(roomId)
  }
}

async function checkAndCleanupRoom(roomId: string) {
  try {
    console.log(`Checking if room ${roomId} should be cleaned up`)

    // Check if user is still authenticated
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.log(`Cannot cleanup room ${roomId}: User not authenticated`)
      return
    }

    const roomRef = ref(database, `rooms/${roomId}`)

    // Try to read the room data
    let snapshot
    try {
      snapshot = await get(roomRef)
    } catch (error: any) {
      if (error.code === "PERMISSION_DENIED") {
        console.log(`Permission denied reading room ${roomId}, skipping cleanup`)
        return
      }
      throw error
    }

    if (!snapshot.exists()) {
      console.log(`Room ${roomId} already doesn't exist`)
      return
    }

    const roomData = snapshot.val()
    const participants = roomData?.participants || {}
    const participantCount = Object.keys(participants).length

    console.log(`Room ${roomId} has ${participantCount} participants`)

    if (participantCount === 0) {
      console.log(`Room ${roomId} is empty, attempting to delete...`)

      try {
        await remove(roomRef)
        console.log(`✅ Room ${roomId} has been deleted successfully`)
      } catch (error: any) {
        if (error.code === "PERMISSION_DENIED") {
          console.log(`Permission denied deleting room ${roomId}, cleanup skipped`)
          return
        }
        throw error
      }
    } else {
      console.log(`Room ${roomId} is not empty, keeping it`)
    }
  } catch (error: any) {
    // Handle specific Firebase errors gracefully
    if (error.code === "PERMISSION_DENIED") {
      console.log(`Permission denied for room ${roomId} cleanup, this is normal if user logged out`)
    } else if (error.code === "NETWORK_ERROR") {
      console.log(`Network error during room ${roomId} cleanup, will retry later`)
    } else {
      console.error(`Unexpected error checking/cleaning room ${roomId}:`, error)
    }
  }
}

// Función para limpiar inmediatamente (sin delay) - con mejor manejo de errores
export async function immediateRoomCleanup(roomId: string) {
  console.log(`Performing immediate cleanup check for room ${roomId}`)

  // Cancelar cualquier cleanup programado
  cancelRoomCleanup(roomId)

  // Solo ejecutar si el usuario está autenticado
  const currentUser = auth.currentUser
  if (!currentUser) {
    console.log(`Skipping immediate cleanup for room ${roomId}: User not authenticated`)
    return
  }

  // Ejecutar limpieza inmediata con manejo de errores
  try {
    await checkAndCleanupRoom(roomId)
  } catch (error) {
    console.log(`Immediate cleanup failed for room ${roomId}, this is normal during logout`)
  }
}

// Función para limpiar todos los timeouts (útil para cleanup general)
export function cleanupAllScheduledCleanups() {
  console.log(`Cleaning up ${cleanupTimeouts.size} scheduled room cleanups`)
  cleanupTimeouts.forEach((timeout) => clearTimeout(timeout))
  cleanupTimeouts.clear()
}

// Nueva función para cleanup "silencioso" que no requiere permisos
export function schedulePassiveRoomCleanup(roomId: string) {
  console.log(`Scheduling passive cleanup for room ${roomId} (will only run if user remains authenticated)`)

  // Cancelar cualquier cleanup previo
  cancelRoomCleanup(roomId)

  // Programar cleanup que solo se ejecuta si hay autenticación
  const timeoutId = setTimeout(async () => {
    try {
      // Solo intentar cleanup si el usuario sigue autenticado
      if (auth.currentUser) {
        await checkAndCleanupRoom(roomId)
      } else {
        console.log(`Passive cleanup skipped for room ${roomId}: User no longer authenticated`)
      }
    } catch (error) {
      console.log(`Passive cleanup failed for room ${roomId}, this is expected during logout`)
    } finally {
      cleanupTimeouts.delete(roomId)
    }
  }, EMPTY_ROOM_CLEANUP_DELAY)

  cleanupTimeouts.set(roomId, timeoutId)
}
