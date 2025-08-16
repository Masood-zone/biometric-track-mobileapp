import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import FormInput from "../../../components/FormInput";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { colors } from "../../../constants/colors";
import { db, firebaseConfig } from "../../../services/firebase";
// Create a secondary Firebase app instance for admin user creation
let secondaryApp: any = null;
function getSecondaryAuth() {
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "Secondary");
  }
  return getAuth(secondaryApp);
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  role: string;
}

export default function SchoolScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "teacher"));
      const querySnapshot = await getDocs(q);

      const teachersList: Teacher[] = [];
      querySnapshot.forEach((doc) => {
        teachersList.push({
          id: doc.id,
          ...doc.data(),
        } as Teacher);
      });

      setTeachers(teachersList);
    } catch {
      Alert.alert("Error", "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditTeacher = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !subject.trim() ||
      (!editingTeacher && !password.trim())
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setAddingTeacher(true);
      if (editingTeacher) {
        // Edit teacher in Firestore
        await setDoc(doc(db, "users", editingTeacher.id), {
          ...editingTeacher,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
        });
        Alert.alert("Success", "Teacher updated successfully");
      } else {
        // Create Firebase Auth account using secondary app
        const secondaryAuth = getSecondaryAuth();
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          email.trim(),
          password
        );
        const user = userCredential.user;

        // Add teacher to Firestore with UID as document ID
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          role: "teacher",
          createdAt: new Date(),
        });

        // Sign out from secondary app to keep admin logged in
        await secondaryAuth.signOut();
        Alert.alert("Success", "Teacher added successfully");
      }

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setPassword("");
      setModalVisible(false);
      setEditingTeacher(null);

      // Refresh teachers list
      await fetchTeachers();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add/update teacher");
    } finally {
      setAddingTeacher(false);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setEmail(teacher.email);
    setPhone(teacher.phone);
    setSubject(teacher.subject);
    setPassword("");
    setModalVisible(true);
  };

  const handleDeleteTeacher = async () => {
    if (!deletingTeacher) return;
    try {
      setLoading(true);
      await setDoc(doc(db, "users", deletingTeacher.id), {}, { merge: false }); // Clear doc
      await fetchTeachers();
      setDeletingTeacher(null);
      Alert.alert("Success", "Teacher deleted successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete teacher");
    } finally {
      setLoading(false);
    }
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <Card style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherEmail}>{item.email}</Text>
        <Text style={styles.teacherDetails}>Subject: {item.subject}</Text>
        <Text style={styles.teacherDetails}>Phone: {item.phone}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
        <TouchableOpacity
          style={{
            padding: 6,
            backgroundColor: colors.primary,
            borderRadius: 6,
          }}
          onPress={() => handleEditTeacher(item)}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 6,
            backgroundColor: colors.danger,
            borderRadius: 6,
          }}
          onPress={() => setDeletingTeacher(item)}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teachers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
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
            <Text style={styles.emptySubtext}>
              Add your first teacher to get started
            </Text>
          </View>
        }
      />

      {/* Add Teacher Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setEditingTeacher(null);
              }}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <FormInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter teacher's full name"
            />

            <FormInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!editingTeacher}
            />

            <FormInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <FormInput
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="Enter subject taught"
            />

            {!editingTeacher && (
              <FormInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter temporary password"
                secureTextEntry
              />
            )}

            <Button
              title={
                addingTeacher
                  ? editingTeacher
                    ? "Updating..."
                    : "Adding Teacher..."
                  : editingTeacher
                  ? "Update Teacher"
                  : "Add Teacher"
              }
              onPress={handleAddOrEditTeacher}
              disabled={addingTeacher}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deletingTeacher}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingTeacher(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 12,
              width: 300,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Delete Teacher
            </Text>
            <Text style={{ fontSize: 15, marginBottom: 24 }}>
              Are you sure you want to delete {deletingTeacher?.name}?
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 16,
              }}
            >
              <TouchableOpacity onPress={() => setDeletingTeacher(null)}>
                <Text style={{ color: colors.text.primary, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteTeacher}>
                <Text style={{ color: colors.danger, fontWeight: "600" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
});
