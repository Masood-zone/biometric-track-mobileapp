import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import {
  BiometricService,
  type BiometricCapabilities,
} from "../services/biometricService";
import Button from "./Button";
import Card from "./Card";

interface BiometricPromptProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (error: string) => void;
  title?: string;
  subtitle?: string;
}

export default function BiometricPrompt({
  visible,
  onSuccess,
  onCancel,
  onError,
  title = "Biometric Authentication",
  subtitle = "Use your biometric to authenticate",
}: BiometricPromptProps) {
  const [capabilities, setCapabilities] =
    useState<BiometricCapabilities | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (visible) {
      checkBiometricCapabilities();
    }
  }, [visible]);

  const checkBiometricCapabilities = async () => {
    try {
      const caps = await BiometricService.checkCapabilities();
      setCapabilities(caps);

      if (!caps.hasHardware || !caps.isEnrolled) {
        onError(
          !caps.hasHardware
            ? "Biometric authentication not available on this device"
            : "No biometric credentials enrolled. Please set up biometric authentication in device settings"
        );
      }
    } catch (error: any) {
      onError(error.message || "Failed to check biometric capabilities");
    }
  };

  const handleAuthenticate = async () => {
    if (!capabilities?.hasHardware || !capabilities?.isEnrolled) {
      return;
    }

    try {
      setAuthenticating(true);
      const result = await BiometricService.authenticate({
        promptMessage: subtitle,
        cancelLabel: "Cancel",
        fallbackLabel: "Use Device Passcode",
      });

      if (result.success) {
        onSuccess();
      } else {
        if (result.error === "UserCancel") {
          onCancel();
        } else {
          onError(result.error || "Authentication failed");
        }
      }
    } catch (error: any) {
      onError(error.message || "Authentication failed");
    } finally {
      setAuthenticating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Card style={styles.promptCard}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {/* Biometric Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.biometricIcon}>
                <Text style={styles.iconText}>👆</Text>
              </View>
              {capabilities && (
                <Text style={styles.biometricType}>
                  {BiometricService.getBiometricTypeString(
                    capabilities.supportedTypes
                  )}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title={authenticating ? "Authenticating..." : "Authenticate"}
                onPress={handleAuthenticate}
                disabled={
                  authenticating ||
                  !capabilities?.hasHardware ||
                  !capabilities?.isEnrolled
                }
                style={styles.authButton}
              />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={onCancel}
                style={styles.cancelButton}
              />
            </View>

            {/* Status */}
            {capabilities && !capabilities.hasHardware && (
              <Text style={styles.errorText}>
                Biometric hardware not available
              </Text>
            )}
            {capabilities &&
              capabilities.hasHardware &&
              !capabilities.isEnrolled && (
                <Text style={styles.errorText}>
                  No biometric credentials enrolled
                </Text>
              )}
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  promptCard: {
    width: "100%",
    maxWidth: 350,
  },
  content: {
    alignItems: "center",
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  iconContainer: {
    alignItems: "center",
    gap: 12,
  },
  biometricIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 32,
  },
  biometricType: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  authButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: "center",
    lineHeight: 16,
  },
});
