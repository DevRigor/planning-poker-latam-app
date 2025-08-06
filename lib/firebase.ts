import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getDatabase, type Database } from "firebase/database"

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDJQ_9LmKTolSUMHa6D8lli-lcwWnGZ1tU",
  authDomain: "planning-poker-latam-app.firebaseapp.com",
  databaseURL: "https://planning-poker-latam-app-default-rtdb.firebaseio.com",
  projectId: "planning-poker-latam-app",
  storageBucket: "planning-poker-latam-app.firebasestorage.app",
  messagingSenderId: "312209969575",
  appId: "1:312209969575:web:2186f1e5688e042f9b2682",
  measurementId: "G-S73G95NSX4",
}

// Log configuration status
console.log("Firebase configuration:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let database: Database
let googleProvider: GoogleAuthProvider

try {
  // Initialize Firebase only if it hasn't been initialized already
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

  // Initialize Firebase Authentication
  auth = getAuth(app)

  // Initialize Google Auth Provider
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({
    prompt: "select_account",
  })

  // Initialize Realtime Database
  database = getDatabase(app)

  console.log("Firebase initialized successfully with your configuration")
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw new Error(`Firebase initialization failed: ${error}`)
}

// Export Firebase instances
export { auth, googleProvider, database }
export default app
