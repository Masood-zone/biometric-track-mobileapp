import { initializeApp } from "firebase/app"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { __DEV__ } from "react-native"

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

// Initialize Firestore
export const db = getFirestore(app)

// Connect to Firestore emulator in development
if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  const EMULATOR_HOST = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || "localhost"
  const FIRESTORE_PORT = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || "8080"

  try {
    connectFirestoreEmulator(db, EMULATOR_HOST, Number.parseInt(FIRESTORE_PORT))
    console.log("Connected to Firestore emulator")
  } catch (error) {
    console.warn("Failed to connect to Firestore emulator:", error)
  }
}

export default app
