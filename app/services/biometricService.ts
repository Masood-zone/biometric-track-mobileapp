import * as LocalAuthentication from "expo-local-authentication"

export interface BiometricCapabilities {
  hasHardware: boolean
  isEnrolled: boolean
  supportedTypes: LocalAuthentication.AuthenticationType[]
}

export class BiometricService {
  static async checkCapabilities(): Promise<BiometricCapabilities> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
    }
  }

  static async authenticate(options?: {
    promptMessage?: string
    cancelLabel?: string
    fallbackLabel?: string
  }): Promise<LocalAuthentication.LocalAuthenticationResult> {
    const capabilities = await this.checkCapabilities()

    if (!capabilities.hasHardware) {
      throw new Error("Biometric hardware not available on this device")
    }

    if (!capabilities.isEnrolled) {
      throw new Error(
        "No biometric credentials enrolled. Please set up fingerprint or face recognition in device settings",
      )
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: options?.promptMessage || "Authenticate to continue",
      cancelLabel: options?.cancelLabel || "Cancel",
      fallbackLabel: options?.fallbackLabel || "Use Passcode",
      requireConfirmation: true,
      disableDeviceFallback: false,
    })

    return result
  }

  static getBiometricTypeString(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face Recognition"
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint"
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris"
    }
    return "Biometric"
  }

  static getSecurityLevelString(securityLevel?: LocalAuthentication.SecurityLevel): string {
    switch (securityLevel) {
      case LocalAuthentication.SecurityLevel.NONE:
        return "None"
      case LocalAuthentication.SecurityLevel.SECRET:
        return "Secret"
      case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
        return "Weak Biometric"
      case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
        return "Strong Biometric"
      default:
        return "Unknown"
    }
  }
}
