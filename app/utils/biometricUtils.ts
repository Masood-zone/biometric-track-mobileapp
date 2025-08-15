import { Alert, Linking } from "react-native"
import { BiometricService } from "../services/biometricService"

export const showBiometricSetupAlert = () => {
  Alert.alert(
    "Biometric Authentication Required",
    "To mark attendance, you need to set up biometric authentication (fingerprint or face recognition) on your device.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings()
        },
      },
    ],
  )
}

export const showBiometricUnavailableAlert = () => {
  Alert.alert(
    "Biometric Authentication Unavailable",
    "This device doesn't support biometric authentication. Please contact your administrator for alternative attendance methods.",
    [{ text: "OK" }],
  )
}

export const handleBiometricError = (error: string) => {
  if (error.includes("not available")) {
    showBiometricUnavailableAlert()
  } else if (error.includes("not enrolled") || error.includes("No biometric")) {
    showBiometricSetupAlert()
  } else {
    Alert.alert("Authentication Error", error)
  }
}

export const validateBiometricCapabilities = async (): Promise<boolean> => {
  try {
    const capabilities = await BiometricService.checkCapabilities()

    if (!capabilities.hasHardware) {
      showBiometricUnavailableAlert()
      return false
    }

    if (!capabilities.isEnrolled) {
      showBiometricSetupAlert()
      return false
    }

    return true
  } catch (error) {
    Alert.alert("Error", "Failed to check biometric capabilities")
    return false
  }
}
