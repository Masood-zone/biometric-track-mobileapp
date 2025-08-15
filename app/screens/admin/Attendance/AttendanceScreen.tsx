import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Card from "../../../components/Card";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { colors } from "../../../constants/colors";
import { useAttendance } from "../../../contexts/attendance/AttendanceContext";
import { formatDate, getTodayString } from "../../../utils/dateUtils";

interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: "present" | "absent";
  timestamp: any;
}

export default function AttendanceScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [loading, setLoading] = useState(true);
  const { getAttendanceByDate } = useAttendance();

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const records = await getAttendanceByDate(selectedDate);
      setAttendanceRecords(records);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: i === 0 ? "Today" : formatDate(date),
      });
    }

    return dates;
  };

  const renderAttendanceRecord = ({ item }: { item: AttendanceRecord }) => (
    <Card style={styles.recordCard}>
      <View style={styles.recordInfo}>
        <View style={styles.recordHeader}>
          <Text style={styles.teacherName}>{item.teacherName}</Text>
          <View style={[styles.statusBadge, styles[item.status]]}>
            <Text style={[styles.statusText, styles[`${item.status}Text`]]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          Marked at:{" "}
          {item.timestamp?.toDate?.()?.toLocaleTimeString() || "Unknown time"}
        </Text>
      </View>
    </Card>
  );

  const renderDateOption = (dateOption: { value: string; label: string }) => (
    <TouchableOpacity
      key={dateOption.value}
      style={[
        styles.dateButton,
        selectedDate === dateOption.value && styles.selectedDateButton,
      ]}
      onPress={() => setSelectedDate(dateOption.value)}
    >
      <Text
        style={[
          styles.dateButtonText,
          selectedDate === dateOption.value && styles.selectedDateButtonText,
        ]}
      >
        {dateOption.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Records</Text>
      </View>

      {/* Date Filter */}
      <View style={styles.dateFilter}>
        <Text style={styles.filterTitle}>Select Date:</Text>
        <View style={styles.dateButtons}>
          {getDateOptions().map(renderDateOption)}
        </View>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendanceRecords}
        renderItem={renderAttendanceRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records</Text>
            <Text style={styles.emptySubtext}>
              No teachers have marked attendance for{" "}
              {formatDate(new Date(selectedDate))}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  dateFilter: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  dateButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDateButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  selectedDateButtonText: {
    color: "white",
  },
  listContainer: {
    padding: 20,
  },
  recordCard: {
    marginBottom: 12,
  },
  recordInfo: {
    gap: 8,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  present: {
    backgroundColor: colors.success + "20",
  },
  absent: {
    backgroundColor: colors.danger + "20",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.danger,
  },
  timestamp: {
    fontSize: 12,
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
    paddingHorizontal: 20,
  },
});
