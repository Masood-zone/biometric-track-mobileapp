import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { createContext, useContext, useState, type ReactNode } from "react";
import { BiometricService } from "../../services/biometricService";
import { db } from "../../services/firebase";

interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: "present" | "absent";
  timestamp: Timestamp;
  biometricType?: string;
}

interface AttendanceContextType {
  markAttendance: (teacherId: string, teacherName: string) => Promise<void>;
  getAttendanceByDate: (date: string) => Promise<AttendanceRecord[]>;
  getTodayAttendance: (teacherId: string) => Promise<AttendanceRecord | null>;
  checkBiometricCapabilities: () => Promise<{
    hasHardware: boolean;
    isEnrolled: boolean;
    supportedTypes: string[];
  }>;
  loading: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const checkBiometricCapabilities = async () => {
    const capabilities = await BiometricService.checkCapabilities();
    return {
      hasHardware: capabilities.hasHardware,
      isEnrolled: capabilities.isEnrolled,
      supportedTypes: capabilities.supportedTypes.map((type) =>
        type.toString()
      ),
    };
  };

  const markAttendance = async (teacherId: string, teacherName: string) => {
    try {
      setLoading(true);

      const capabilities = await BiometricService.checkCapabilities();

      if (!capabilities.hasHardware) {
        throw new Error(
          "Biometric authentication is not available on this device"
        );
      }

      if (!capabilities.isEnrolled) {
        throw new Error(
          "No biometric credentials found. Please set up fingerprint or face recognition in your device settings"
        );
      }

      // Authenticate with biometrics
      const result = await BiometricService.authenticate({
        promptMessage: "Authenticate to mark your attendance",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Device Passcode",
      });

      if (!result.success) {
        // Replace BiometricService.ErrorCodes with the correct error code references
        if (result.error === "UserCancel") {
          throw new Error("Authentication was cancelled");
        } else if (result.error === "UserFallback") {
          throw new Error(
            "Biometric authentication is required for attendance"
          );
        } else {
          throw new Error("Biometric authentication failed. Please try again");
        }
      }

      // Check if already marked today
      const today = new Date().toISOString().split("T")[0];
      const existingAttendance = await getTodayAttendance(teacherId);

      if (existingAttendance) {
        throw new Error("Attendance has already been marked for today");
      }

      // Mark attendance
      await addDoc(collection(db, "attendance"), {
        teacherId,
        teacherName,
        date: today,
        status: "present",
        timestamp: Timestamp.now(),
        biometricType: BiometricService.getBiometricTypeString(
          capabilities.supportedTypes
        ),
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceByDate = async (
    date: string
  ): Promise<AttendanceRecord[]> => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "attendance"),
        where("date", "==", date),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const records: AttendanceRecord[] = [];

      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data(),
        } as AttendanceRecord);
      });

      return records;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTodayAttendance = async (
    teacherId: string
  ): Promise<AttendanceRecord | null> => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const q = query(
        collection(db, "attendance"),
        where("teacherId", "==", teacherId),
        where("date", "==", today)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as AttendanceRecord;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    markAttendance,
    getAttendanceByDate,
    getTodayAttendance,
    checkBiometricCapabilities,
    loading,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
}
