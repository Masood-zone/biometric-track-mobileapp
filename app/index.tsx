import AppNavigator from "@/App";
import { AttendanceProvider } from "./contexts/attendance/AttendanceContext";
import { AuthProvider } from "./contexts/auth/AuthContext";

export default function HomeScreen() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <AppNavigator />
      </AttendanceProvider>
    </AuthProvider>
  );
}
