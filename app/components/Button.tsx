import { TouchableOpacity, Text, StyleSheet, type TouchableOpacityProps } from "react-native"
import { colors } from "../constants/colors"

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: "primary" | "secondary" | "danger"
  size?: "small" | "medium" | "large"
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]]

    if (disabled) {
      baseStyle.push(styles.disabled)
    } else {
      baseStyle.push(styles[variant])
    }

    return baseStyle
  }

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]]

    if (disabled) {
      baseStyle.push(styles.disabledText)
    } else {
      baseStyle.push(styles[`${variant}Text`])
    }

    return baseStyle
  }

  return (
    <TouchableOpacity style={[getButtonStyle(), style]} disabled={disabled} {...props}>
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },

  // Disabled
  disabled: {
    backgroundColor: colors.gray[300],
  },

  // Text styles
  text: {
    fontWeight: "600",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Text variants
  primaryText: {
    color: "white",
  },
  secondaryText: {
    color: colors.text.primary,
  },
  dangerText: {
    color: "white",
  },
  disabledText: {
    color: colors.text.light,
  },
})
