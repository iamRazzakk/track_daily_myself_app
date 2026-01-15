import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import {
  Colors,
  Spacing,
  Typography,
  Radius,
  Shadows,
} from "@/constants/theme";

type StatCardProps = {
  label: string;
  value: number;
  type: "income" | "expense" | "neutral";
  icon?: keyof typeof MaterialIcons.glyphMap;
  prefix?: string;
  suffix?: string;
};

export function StatCard({
  label,
  value,
  type,
  icon,
  prefix = "৳",
  suffix = "",
}: StatCardProps) {
  const getCardStyle = () => {
    switch (type) {
      case "income":
        return styles.incomeCard;
      case "expense":
        return styles.expenseCard;
      default:
        return value >= 0 ? styles.incomeCard : styles.expenseCard;
    }
  };

  const getValueStyle = () => {
    switch (type) {
      case "income":
        return styles.incomeValue;
      case "expense":
        return styles.expenseValue;
      default:
        return value >= 0 ? styles.incomeValue : styles.expenseValue;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "income":
        return Colors.success;
      case "expense":
        return Colors.danger;
      default:
        return value >= 0 ? Colors.success : Colors.danger;
    }
  };

  return (
    <View style={[styles.card, getCardStyle()]}>
      <View style={styles.header}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getIconColor() + "20" },
            ]}
          >
            <MaterialIcons name={icon} size={20} color={getIconColor()} />
          </View>
        )}
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
      <ThemedText style={getValueStyle()}>
        {prefix}
        {value.toFixed(2)}
        {suffix}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  incomeCard: {
    backgroundColor: Colors.successBg,
    borderWidth: 1,
    borderColor: Colors.successLight + "50",
  },
  expenseCard: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.dangerLight + "50",
  },
  incomeValue: {
    ...Typography.h3,
    color: Colors.success,
  },
  expenseValue: {
    ...Typography.h3,
    color: Colors.danger,
  },
});
