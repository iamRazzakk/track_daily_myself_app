import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';

type Period = 'weekly' | 'monthly';

type PeriodToggleProps = {
  period: Period;
  onPeriodChange: (period: Period) => void;
};

export function PeriodToggle({ period, onPeriodChange }: PeriodToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, period === 'weekly' && styles.buttonActive]}
        onPress={() => onPeriodChange('weekly')}
        activeOpacity={0.8}
      >
        <ThemedText style={[
          styles.buttonText,
          period === 'weekly' && styles.buttonTextActive
        ]}>
          Weekly
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, period === 'monthly' && styles.buttonActive]}
        onPress={() => onPeriodChange('monthly')}
        activeOpacity={0.8}
      >
        <ThemedText style={[
          styles.buttonText,
          period === 'monthly' && styles.buttonTextActive
        ]}>
          Monthly
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.gray200,
    padding: 4,
    borderRadius: Radius.md,
    gap: 4,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  buttonTextActive: {
    color: Colors.white,
  },
});
