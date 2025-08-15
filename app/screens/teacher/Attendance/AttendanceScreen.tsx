import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { colors } from "../../../constants/colors";
import { useAttendance } from "../../../contexts/attendance/AttendanceContext";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { formatDate, formatTime } from "../../../utils/dateUtils";

interface TodayAttendance {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: "present" | "absent";
  timestamp: any;
}

export default function AttendanceScreen() {
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marking, setMarking] = useState(false);

  const { user } = useAuth();
  const { getTodayAttendance, markAttendance } = useAttendance();

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const attendance = await getTodayAttendance(user.uid);
      setTodayAttendance(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodayAttendance();
    setRefreshing(false);
  };

  const handleMarkAttendance = async () => {
    if (!user) return;

    try {
      setMarking(true);
      await markAttendance(user.uid, user.name);
      await fetchTodayAttendance();
      Alert.alert("Success", "Attendance marked successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to mark attendance");
    } finally {
      setMarking(false);
    }
  };

  const getCurrentTime = () => {
    return formatTime(new Date());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name}!
        </Text>
        <Text style={styles.currentTime}>{getCurrentTime()}</Text>
      </View>

      {/* Today's Date Card */}
      <Card style={styles.dateCard}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Today's Date</Text>
          <Text style={styles.dateValue}>{formatDate(today)}</Text>
          {isWeekend && (
            <Text style={styles.weekendNote}>
              Weekend - No attendance required
            </Text>
          )}
        </View>
      </Card>

      {/* Attendance Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Attendance Status</Text>
        </View>

        {todayAttendance ? (
          <View style={styles.attendanceMarked}>
            <View style={[styles.statusBadge, styles.present]}>
              <Text style={[styles.statusText, styles.presentText]}>
                PRESENT
              </Text>
            </View>
            <Text style={styles.markedTime}>
              Marked at:{" "}
              {todayAttendance.timestamp?.toDate?.()?.toLocaleTimeString() ||
                "Unknown time"}
            </Text>
            <Text style={styles.successMessage}>
              ✓ Your attendance has been recorded for today
            </Text>
          </View>
        ) : (
          <View style={styles.attendanceNotMarked}>
            <View style={[styles.statusBadge, styles.absent]}>
              <Text style={[styles.statusText, styles.absentText]}>
                NOT MARKED
              </Text>
            </View>
            <Text style={styles.pendingMessage}>
              Please mark your attendance for today
            </Text>

            {!isWeekend && (
              <Button
                title={marking ? "Marking Attendance..." : "Mark Attendance"}
                onPress={handleMarkAttendance}
                disabled={marking}
                style={styles.markButton}
              />
            )}
          </View>
        )}
      </Card>

      {/* Instructions Card */}
      {!todayAttendance && !isWeekend && (
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Mark Attendance</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              1. Tap the "Mark Attendance" button
            </Text>
            <Text style={styles.instructionItem}>
              2. Authenticate using your fingerprint
            </Text>
            <Text style={styles.instructionItem}>
              3. Your attendance will be recorded automatically
            </Text>
          </View>
        </Card>
      )}

      {/* Weekend Message */}
      {isWeekend && (
        <Card style={styles.weekendCard}>
          <Text style={styles.weekendTitle}>Weekend</Text>
          <Text style={styles.weekendMessage}>
            Enjoy your weekend! Attendance marking is not required on weekends.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  dateCard: {
    marginBottom: 16,
  },
  dateInfo: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
  },
  weekendNote: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
    fontStyle: "italic",
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  attendanceMarked: {
    alignItems: "center",
    gap: 12,
  },
  attendanceNotMarked: {
    alignItems: "center",
    gap: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  present: {
    backgroundColor: colors.success + "20",
  },
  absent: {
    backgroundColor: colors.danger + "20",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.danger,
  },
  markedTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  successMessage: {
    fontSize: 14,
    color: colors.success,
    textAlign: "center",
  },
  pendingMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  markButton: {
    width: "100%",
    marginTop: 8,
  },
  instructionsCard: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  weekendCard: {
    backgroundColor: colors.warning + "10",
    borderColor: colors.warning + "30",
  },
  weekendTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.warning,
    marginBottom: 8,
    textAlign: "center",
  },
  weekendMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
