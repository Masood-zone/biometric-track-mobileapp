import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword, type User } from "firebase/auth"
import { auth, db } from "../services/firebase"

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: "admin" | "teacher"
  phone?: string
  subject?: string
  createdAt: any
}

export const createUserProfile = async (
  user: User,
  additionalData: {
    name: string
    role: "admin" | "teacher"
    phone?: string
    subject?: string
  },
): Promise<void> => {
  if (!user) return

  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const { name, role, phone, subject } = additionalData

    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name,
        role,
        phone: phone || "",
        subject: subject || "",
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error creating user profile:", error)
      throw error
    }
  }
}

export const createTeacherAccount = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  subject: string,
): Promise<UserProfile> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    await createUserProfile(user, {
      name,
      role: "teacher",
      phone,
      subject,
    })

    return {
      uid: user.uid,
      email: user.email || email,
      name,
      role: "teacher",
      phone,
      subject,
      createdAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating teacher account:", error)
    throw error
  }
}

export const validateFirebaseConfig = (): boolean => {
  const requiredEnvVars = [
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
  ]

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName] === "your-api-key",
  )

  if (missingVars.length > 0) {
    console.error("Missing Firebase configuration:", missingVars)
    return false
  }

  return true
}
