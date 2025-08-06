// Generar ID de sala único y fácil de compartir
export function generateRoomId(): string {
  // Usar palabras simples para hacer URLs más amigables
  const adjectives = [
    "rapido",
    "agil",
    "smart",
    "cool",
    "pro",
    "top",
    "max",
    "super",
    "mega",
    "ultra",
    "azul",
    "verde",
    "rojo",
    "dorado",
    "plata",
    "negro",
    "blanco",
    "rosa",
    "morado",
  ]

  const nouns = [
    "equipo",
    "grupo",
    "squad",
    "team",
    "crew",
    "banda",
    "clan",
    "guild",
    "party",
    "dev",
    "code",
    "app",
    "web",
    "tech",
    "digital",
    "cyber",
    "pixel",
    "byte",
  ]

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999) + 1

  return `${adjective}-${noun}-${number}`
}

// Validar que un ID de sala sea válido
export function isValidRoomId(roomId: string): boolean {
  // Formato: palabra-palabra-numero
  const pattern = /^[a-z]+-[a-z]+-\d{1,3}$/
  return pattern.test(roomId)
}

// Extraer ID de sala de la URL
export function getRoomIdFromUrl(): string | null {
  if (typeof window === "undefined") return null

  const path = window.location.pathname
  const match = path.match(/\/room\/([^/]+)/)
  return match ? match[1] : null
}

// Generar URL compartible
export function generateShareableUrl(roomId: string): string {
  if (typeof window === "undefined") return ""

  const baseUrl = window.location.origin
  return `${baseUrl}/room/${roomId}`
}
