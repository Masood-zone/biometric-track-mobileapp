"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from "react-native"
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../../../services/firebase"
import { colors } from "../../../constants/colors"
import Card from "../../../components/Card"
import Button from "../../../components/Button"
import FormInput from "../../../components/FormInput"
import LoadingSpinner from "../../../components/LoadingSpinner"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  role: string
}

export default function SchoolScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [addingTeacher, setAddingTeacher] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "users"), where("role", "==", "teacher"))
      const querySnapshot = await getDocs(q)

      const teachersList: Teacher[] = []
      querySnapshot.forEach((doc) => {
        teachersList.push({
          id: doc.id,
          ...doc.data(),
        } as Teacher)
      })

      setTeachers(teachersList)
    } catch (error) {
      Alert.alert("Error", "Failed to fetch teachers")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeacher = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !subject.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      setAddingTeacher(true)

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const user = userCredential.user

      // Add teacher to Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        role: "teacher",
        createdAt: new Date(),
      })

      // Reset form
      setName("")
      setEmail("")
      setPhone("")
      setSubject("")
      setPassword("")
      setModalVisible(false)

      // Refresh teachers list
      await fetchTeachers()

      Alert.alert("Success", "Teacher added successfully")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add teacher")
    } finally {
      setAddingTeacher(false)
    }
  }

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <Card style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherEmail}>{item.email}</Text>
        <Text style={styles.teacherDetails}>Subject: {item.subject}</Text>
        <Text style={styles.teacherDetails}>Phone: {item.phone}</Text>
      </View>
    </Card>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teachers</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {/* Teachers List */}
      <FlatList
        data={teachers}
        renderItem={renderTeacher}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No teachers found</Text>
            <Text style={styles.emptySubtext}>Add your first teacher to get started</Text>
          </View>
        }
      />

      {/* Add Teacher Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Teacher</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <FormInput label="Full Name" value={name} onChangeText={setName} placeholder="Enter teacher's full name" />

            <FormInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <FormInput label="Subject" value={subject} onChangeText={setSubject} placeholder="Enter subject taught" />

            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter temporary password"
              secureTextEntry
            />

            <Button
              title={addingTeacher ? "Adding Teacher..." : "Add Teacher"}
              onPress={handleAddTeacher}
              disabled={addingTeacher}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
  },
  teacherCard: {
    marginBottom: 12,
  },
  teacherInfo: {
    gap: 4,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  teacherEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  teacherDetails: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  submitButton: {
    marginTop: 20,
  },
})
