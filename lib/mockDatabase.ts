import type { Room } from "@/types"

// Mock database for demo purposes
class MockDatabase {
  private room: Room = {
    participants: {},
    votes: {},
    gameState: {
      isRevealed: false,
      roundId: `round_${Date.now()}`,
      createdAt: Date.now(),
    },
  }

  private listeners: ((room: Room) => void)[] = []

  onValue(callback: (room: Room) => void): () => void {
    this.listeners.push(callback)
    // Immediately call with current data
    callback(this.room)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  async set(path: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Parse the path and update the data
        const pathParts = path.split("/")
        let current: any = this.room

        // Navigate to the parent of the target
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i]
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part]
        }

        // Set the value
        const lastPart = pathParts[pathParts.length - 1]
        current[lastPart] = value

        // Notify listeners
        this.listeners.forEach((listener) => listener({ ...this.room }))

        resolve()
      }, 100)
    })
  }

  async remove(path: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pathParts = path.split("/")
        let current: any = this.room

        // Navigate to the parent of the target
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i]
          if (!current[part]) {
            resolve()
            return
          }
          current = current[part]
        }

        // Remove the value
        const lastPart = pathParts[pathParts.length - 1]
        delete current[lastPart]

        // Notify listeners
        this.listeners.forEach((listener) => listener({ ...this.room }))

        resolve()
      }, 100)
    })
  }

  // Helper method to get current room state
  getCurrentRoom(): Room {
    return { ...this.room }
  }
}

export const mockDatabase = new MockDatabase()
