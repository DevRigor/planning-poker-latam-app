// Mock authentication system for demo purposes
export interface MockUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
}

const MOCK_USERS: MockUser[] = [
  {
    uid: "user1",
    email: "alice@example.com",
    displayName: "Alice Johnson",
    photoURL: "/placeholder.svg?height=40&width=40",
  },
  {
    uid: "user2",
    email: "bob@example.com",
    displayName: "Bob Smith",
    photoURL: "/placeholder.svg?height=40&width=40",
  },
  {
    uid: "user3",
    email: "charlie@example.com",
    displayName: "Charlie Brown",
    photoURL: "/placeholder.svg?height=40&width=40",
  },
]

export class MockAuthService {
  private currentUser: MockUser | null = null
  private listeners: ((user: MockUser | null) => void)[] = []

  constructor() {
    // Check if user was previously logged in
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("mockUser")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
      }
    }
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback)
    // Immediately call with current user
    callback(this.currentUser)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  async signInWithGoogle(): Promise<MockUser> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Select a random user for demo
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
        this.currentUser = randomUser

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("mockUser", JSON.stringify(randomUser))
        }

        // Notify listeners
        this.listeners.forEach((listener) => listener(randomUser))

        resolve(randomUser)
      }, 1000)
    })
  }

  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null

        // Remove from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("mockUser")
        }

        // Notify listeners
        this.listeners.forEach((listener) => listener(null))

        resolve()
      }, 500)
    })
  }
}

export const mockAuth = new MockAuthService()
