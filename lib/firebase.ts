// Configuración ultra-básica de Firebase
import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyDXtmcsxMXxEFKD5D79Oevf5de4tQKoUY4",
  authDomain: "planning-poker-v0.firebaseapp.com",
  databaseURL: "https://planning-poker-v0-default-rtdb.firebaseio.com",
  projectId: "planning-poker-v0",
  storageBucket: "planning-poker-v0.firebasestorage.app",
  messagingSenderId: "146704816058",
  appId: "1:146704816058:web:f078fa4b0e4af8cbff6f83",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: "select_account",
})

// Initialize Realtime Database
export const database = getDatabase(app)

console.log("Firebase initialized successfully")

export default app
