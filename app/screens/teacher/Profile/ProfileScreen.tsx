"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../../services/firebase"
import { useAuth } from "../../../contexts/auth/AuthContext"
import { colors } from "../../../constants/colors"
import Card from "../../../components/Card"
import FormInput from "../../../components/FormInput"
import Button from "../../../components/Button"
import LoadingSpinner from "../../../components/LoadingSpinner"

interface TeacherProfile {
  name: string
  email: string
  phone: string
  subject: string
  role: string
  createdAt?: any
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")

  const { user, logout } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const profileData = docSnap.data() as TeacherProfile
        setProfile(profileData)
        setName(profileData.name || "")
        setPhone(profileData.phone || "")
        setSubject(profileData.subject || "")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !name.trim() || !subject.trim()) {
      Alert.alert("Error", "Name and subject are required")
      return
    }

    try {
      setSaving(true)
      const docRef = doc(db, "users", user.uid)

      await updateDoc(docRef, {
        name: name.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        updatedAt: new Date(),
      })

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          name: name.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
        })
      }

      setEditing(false)
      Alert.alert("Success", "Profile updated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout()
          } catch (error) {
            Alert.alert("Error", "Failed to logout")
          }
        },
      },
    ])
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Profile</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        {editing ? (
          <View style={styles.editForm}>
            <FormInput label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" />

            <FormInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <FormInput label="Subject" value={subject} onChangeText={setSubject} placeholder="Enter subject taught" />

            <View style={styles.formActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setEditing(false)
                  setName(profile.name || "")
                  setPhone(profile.phone || "")
                  setSubject(profile.subject || "")
                }}
                style={styles.actionButton}
              />
              <Button
                title={saving ? "Saving..." : "Save"}
                onPress={handleSave}
                disabled={saving}
                style={styles.actionButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.name?.charAt(0)?.toUpperCase() || "T"}</Text>
              </View>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userRole}>Teacher</Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{profile.phone || "Not set"}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Subject</Text>
                <Text style={styles.value}>{profile.subject || "Not set"}</Text>
              </View>

              {profile.createdAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Member Since</Text>
                  <Text style={styles.value}>{profile.createdAt.toDate?.()?.toLocaleDateString() || "Unknown"}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Card>

      {/* Quick Stats Card */}
      {!editing && (
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Days Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
          <Text style={styles.statsNote}>Attendance statistics will be available soon</Text>
        </Card>
      )}

      {/* Logout Button */}
      <Button title="Logout" variant="danger" onPress={handleLogout} style={styles.logoutButton} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  editButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  profileCard: {
    marginBottom: 20,
  },
  profileInfo: {
    gap: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
  },
  editForm: {
    gap: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
  statsNote: {
    fontSize: 12,
    color: colors.text.light,
    textAlign: "center",
    fontStyle: "italic",
  },
  logoutButton: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginTop: 50,
  },
})
