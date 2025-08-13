// Configuración ultra-básica de Firebase
import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getDatabase } from "firebase/database"

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
