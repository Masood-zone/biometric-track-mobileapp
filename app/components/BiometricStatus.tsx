"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { BiometricService, type BiometricCapabilities } from "../services/biometricService"
import { colors } from "../constants/colors"
import Card from "./Card"

interface BiometricStatusProps {
  onPress?: () => void
}

export default function BiometricStatus({ onPress }: BiometricStatusProps) {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkCapabilities()
  }, [])

  const checkCapabilities = async () => {
    try {
      setLoading(true)
      const caps = await BiometricService.checkCapabilities()
      setCapabilities(caps)
    } catch (error) {
      console.error("Error checking biometric capabilities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!capabilities?.hasHardware) return colors.gray[400]
    if (!capabilities?.isEnrolled) return colors.warning
    return colors.success
  }

  const getStatusText = () => {
    if (loading) return "Checking..."
    if (!capabilities?.hasHardware) return "Not Available"
    if (!capabilities?.isEnrolled) return "Not Set Up"
    return "Ready"
  }

  const getStatusDescription = () => {
    if (loading) return "Checking biometric capabilities..."
    if (!capabilities?.hasHardware) return "This device doesn't support biometric authentication"
    if (!capabilities?.isEnrolled) return "Set up biometric authentication in device settings"
    return `${BiometricService.getBiometricTypeString(capabilities.supportedTypes)} is ready for use`
  }

  const Component = onPress ? TouchableOpacity : View

  return (
    <Component onPress={onPress} style={onPress && styles.touchable}>
      <Card style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.title}>Biometric Authentication</Text>
          </View>
          <Text style={[styles.status, { color: getStatusColor() }]}>{getStatusText()}</Text>
          <Text style={styles.description}>{getStatusDescription()}</Text>
        </View>
      </Card>
    </Component>
  )
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 16,
  },
  container: {
    marginBottom: 0,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  status: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
})
