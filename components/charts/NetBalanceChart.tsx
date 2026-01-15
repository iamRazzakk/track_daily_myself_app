import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";

type NetBalanceData = {
  label: string;
  net: number;
};

type NetBalanceChartProps = {
  data: NetBalanceData[];
  title?: string;
};

export function NetBalanceChart({ data, title }: NetBalanceChartProps) {
  const maxNet = Math.max(
    ...data.map((d) => Math.abs(d.net)),
    1 // Prevent division by zero
  );

  return (
    <View style={styles.container}>
      {title && <ThemedText style={styles.title}>{title}</ThemedText>}

      <View style={styles.chartContainer}>
        {data.map((item, idx) => {
          const isPositive = item.net >= 0;
          const barWidth = Math.abs((item.net / maxNet) * 100);

          return (
            <Animated.View
              key={idx}
              style={styles.row}
              entering={FadeInRight.delay(idx * 80).duration(400)}
            >
              <ThemedText style={styles.label}>
                {item.label.split(" ")[0].substring(0, 3)}
              </ThemedText>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.max(barWidth, 2)}%`,
                      backgroundColor: isPositive
                        ? Colors.success
                        : Colors.danger,
                    },
                  ]}
                />
              </View>

              <ThemedText
                style={[
                  styles.value,
                  { color: isPositive ? Colors.success : Colors.danger },
                ]}
              >
                {isPositive ? "+" : ""}৳{item.net.toFixed(0)}
              </ThemedText>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  chartContainer: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  label: {
    ...Typography.small,
    color: Colors.textSecondary,
    width: 32,
    fontWeight: "600",
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.gray200,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: Radius.md,
  },
  value: {
    ...Typography.caption,
    fontWeight: "700",
    width: 70,
    textAlign: "right",
  },
});
