import { auth, database } from "@/lib/firebase"
import { ref, get, remove } from "firebase/database"

// Retraso antes de eliminar una sala vacía (para evitar eliminaciones accidentales por desconexiones temporales)
const EMPTY_ROOM_CLEANUP_DELAY = 30000 // 30 segundos

// Map para trackear timeouts de limpieza por sala
const cleanupTimeouts = new Map<string, NodeJS.Timeout>()

export async function scheduleRoomCleanup(roomId: string) {
  console.log(`Programando verificación de limpieza para sala ${roomId} en ${EMPTY_ROOM_CLEANUP_DELAY}ms`)

  // Cancelar cualquier limpieza previa para esta sala
  const existingTimeout = cleanupTimeouts.get(roomId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
    cleanupTimeouts.delete(roomId)
  }

  // Programar nueva limpieza
  const timeoutId = setTimeout(async () => {
    try {
      await checkAndCleanupRoom(roomId)
    } catch (error) {
      console.error(`Error durante limpieza programada para sala ${roomId}:`, error)
    } finally {
      cleanupTimeouts.delete(roomId)
    }
  }, EMPTY_ROOM_CLEANUP_DELAY)

  cleanupTimeouts.set(roomId, timeoutId)
}

export function cancelRoomCleanup(roomId: string) {
  const existingTimeout = cleanupTimeouts.get(roomId)
  if (existingTimeout) {
    console.log(`Cancelando limpieza programada para sala ${roomId}`)
    clearTimeout(existingTimeout)
    cleanupTimeouts.delete(roomId)
  }
}

async function checkAndCleanupRoom(roomId: string) {
  try {
    console.log(`Verificando si sala ${roomId} debe ser limpiada`)

    // Verificar que estamos en el cliente
    if (typeof window === "undefined") {
      console.log(`Cleanup omitido para sala ${roomId}: ejecutándose en servidor`)
      return
    }

    // Verificar si el usuario sigue autenticado
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.log(`No se puede limpiar sala ${roomId}: Usuario no autenticado`)
      return
    }

    const roomRef = ref(database, `rooms/${roomId}`)

    // Intentar leer los datos de la sala
    let snapshot
    try {
      snapshot = await get(roomRef)
    } catch (error: any) {
      if (error.code === "PERMISSION_DENIED") {
        console.log(`Permiso denegado leyendo sala ${roomId}, omitiendo limpieza`)
        return
      }
      throw error
    }

    if (!snapshot.exists()) {
      console.log(`Sala ${roomId} ya no existe`)
      return
    }

    const roomData = snapshot.val()
    const participants = roomData?.participants || {}
    const participantCount = Object.keys(participants).length

    console.log(`Sala ${roomId} tiene ${participantCount} participantes`)

    if (participantCount === 0) {
      console.log(`Sala ${roomId} está vacía, intentando eliminar...`)

      try {
        await remove(roomRef)
        console.log(`✅ Sala ${roomId} ha sido eliminada exitosamente`)
      } catch (error: any) {
        if (error.code === "PERMISSION_DENIED") {
          console.log(`Permiso denegado eliminando sala ${roomId}, limpieza omitida`)
          return
        }
        throw error
      }
    } else {
      console.log(`Sala ${roomId} no está vacía, manteniéndola`)
    }
  } catch (error: any) {
    // Manejar errores específicos de Firebase con gracia
    if (error.code === "PERMISSION_DENIED") {
      console.log(`Permiso denegado para limpieza de sala ${roomId}, esto es normal si el usuario cerró sesión`)
    } else if (error.code === "NETWORK_ERROR") {
      console.log(`Error de red durante limpieza de sala ${roomId}, se reintentará más tarde`)
    } else {
      console.error(`Error inesperado verificando/limpiando sala ${roomId}:`, error)
    }
  }
}

// Función para limpiar inmediatamente (sin retraso) - con mejor manejo de errores
export async function immediateRoomCleanup(roomId: string) {
  console.log(`Realizando verificación de limpieza inmediata para sala ${roomId}`)

  // Cancelar cualquier limpieza programada
  cancelRoomCleanup(roomId)

  try {
    // Verificar que estamos en el cliente
    if (typeof window === "undefined") {
      console.log(`Cleanup inmediato omitido para sala ${roomId}: ejecutándose en servidor`)
      return
    }

    // Solo ejecutar si el usuario está autenticado
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.log(`Omitiendo limpieza inmediata para sala ${roomId}: Usuario no autenticado`)
      return
    }

    // Ejecutar limpieza inmediata con manejo de errores
    await checkAndCleanupRoom(roomId)
  } catch (error) {
    console.log(`Limpieza inmediata falló para sala ${roomId}, esto es normal durante logout`)
  }
}

// Función para limpiar todos los timeouts (útil para limpieza general)
export function cleanupAllScheduledCleanups() {
  console.log(`Limpiando ${cleanupTimeouts.size} limpiezas de sala programadas`)
  cleanupTimeouts.forEach((timeout) => clearTimeout(timeout))
  cleanupTimeouts.clear()
}

// Nueva función para limpieza "silenciosa" que no requiere permisos
export function schedulePassiveRoomCleanup(roomId: string) {
  console.log(`Programando limpieza pasiva para sala ${roomId} (solo se ejecutará si el usuario permanece autenticado)`)

  // Cancelar cualquier limpieza previa
  cancelRoomCleanup(roomId)

  // Programar limpieza que solo se ejecuta si hay autenticación
  const timeoutId = setTimeout(async () => {
    try {
      // Verificar que estamos en el cliente
      if (typeof window === "undefined") {
        console.log(`Cleanup pasivo omitido para sala ${roomId}: ejecutándose en servidor`)
        return
      }

      // Solo intentar limpieza si el usuario sigue autenticado
      if (auth.currentUser) {
        await checkAndCleanupRoom(roomId)
      } else {
        console.log(`Limpieza pasiva omitida para sala ${roomId}: Usuario ya no autenticado`)
      }
    } catch (error) {
      console.log(`Limpieza pasiva falló para sala ${roomId}, esto se espera durante logout`)
    } finally {
      cleanupTimeouts.delete(roomId)
    }
  }, EMPTY_ROOM_CLEANUP_DELAY)

  cleanupTimeouts.set(roomId, timeoutId)
}
