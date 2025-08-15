// This file would be used for admin operations in a backend service
// For now, it serves as documentation for required Firestore security rules

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  ATTENDANCE: "attendance",
} as const

export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
} as const

// Firestore Security Rules (to be added in Firebase Console)
export const SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data, admins can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Attendance collection - teachers can create their own, admins can read all
    match /attendance/{attendanceId} {
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.teacherId &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.teacherId ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }
  }
}
`

// Initial admin user creation function (to be run once)
export const createInitialAdmin = async (email: string, password: string, name: string) => {
  // This would typically be done through Firebase Admin SDK in a secure environment
  console.log(`
    To create the initial admin user:
    1. Go to Firebase Console > Authentication > Users
    2. Add user with email: ${email}
    3. Note the UID
    4. Go to Firestore > users collection
    5. Create document with UID as document ID and data:
    {
      "email": "${email}",
      "name": "${name}",
      "role": "admin",
      "createdAt": [current timestamp]
    }
  `)
}
