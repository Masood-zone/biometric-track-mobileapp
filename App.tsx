import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Feather from "react-native-vector-icons/Feather";
// import { AttendanceProvider } from "./app/contexts/attendance/AttendanceContext";
import { useAuth } from "./app/contexts/auth/AuthContext";

// Import screens
import AdminAttendanceScreen from "./app/screens/admin/Attendance/AttendanceScreen";
import AdminProfileScreen from "./app/screens/admin/Profile/ProfileScreen";
import AdminSchoolScreen from "./app/screens/admin/School/SchoolScreen";
import LoginScreen from "./app/screens/auth/Login/LoginScreen";
import TeacherAttendanceScreen from "./app/screens/teacher/Attendance/AttendanceScreen";
import TeacherProfileScreen from "./app/screens/teacher/Profile/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          borderBottomWidth: 1,
        },
        tabBarStyle: {
          backgroundColor: "#1f2937",
          borderTopColor: "#374151",
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          if (route.name === "School") iconName = "users";
          else if (route.name === "Attendance") iconName = "check-square";
          else if (route.name === "Profile") iconName = "user";
          return <Feather name={iconName} size={size} color={color} />;
        },
        title:
          route.name === "School"
            ? "Biometric Track App"
            : "Biometric Track App",
      })}
    >
      <Tab.Screen
        name="School"
        component={AdminSchoolScreen}
        options={{ tabBarLabel: "Teachers" }}
      />
      <Tab.Screen
        name="Attendance"
        component={AdminAttendanceScreen}
        options={{ tabBarLabel: "Attendance" }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1f2937",
          borderTopColor: "#374151",
        },
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          if (route.name === "Attendance") iconName = "check-square";
          else if (route.name === "Profile") iconName = "user";
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Attendance"
        component={TeacherAttendanceScreen}
        options={{ tabBarLabel: "Attendance" }}
      />
      <Tab.Screen
        name="Profile"
        component={TeacherProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Add loading screen later
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === "admin" ? (
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
      ) : user.role === "teacher" ? (
        <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      ) : null}
    </Stack.Navigator>
  );
}

// export default function App() {
//   return (
//     <AuthProvider>
//       <AttendanceProvider>
//         <AppNavigator />
//       </AttendanceProvider>
//     </AuthProvider>
//   );
// }
