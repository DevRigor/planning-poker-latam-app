export interface Participant {
  id: string
  name: string
  hasVoted: boolean
  vote?: string
  joinedAt: number
  lastSeen?: number
  voteStartedAt?: number // Cuando comenzó la ronda actual
}

export interface GameState {
  isRevealed: boolean
  roundId: string
  createdAt: number
  voteStartedAt?: number // Cuando comenzó la votación actual
  createdBy?: string // ID del usuario que creó la sala
}

export interface Room {
  participants: Record<string, Participant>
  votes: Record<string, string>
  gameState: GameState
  storyName?: string // Nombre de la Historia de Usuario
  roomInfo?: {
    id: string
    name?: string
    createdAt: number
    createdBy: string
  }
}

export type VoteValue = "0.5" | "1" | "2" | "3" | "5" | "8" | "☕"

export const VOTE_OPTIONS: VoteValue[] = ["0.5", "1", "2", "3", "5", "8", "☕"]

// Timeout configuration
export const VOTE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutos
