import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';

type BarChartData = {
  label: string;
  income: number;
  expense: number;
};

type BarChartProps = {
  data: BarChartData[];
  title?: string;
};

export function BarChart({ data, title }: BarChartProps) {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income, d.expense)),
    1 // Prevent division by zero
  );

  return (
    <View style={styles.container}>
      {title && <ThemedText style={styles.title}>{title}</ThemedText>}
      
      <View style={styles.chartContainer}>
        {data.map((item, idx) => {
          const incomeWidth = (item.income / maxValue) * 100;
          const expenseWidth = (item.expense / maxValue) * 100;
          
          return (
            <Animated.View 
              key={idx} 
              style={styles.barRow}
              entering={FadeInDown.delay(idx * 50).duration(300)}
            >
              <ThemedText style={styles.barLabel}>
                {item.label.split(' ')[0].substring(0, 3)}
              </ThemedText>
              
              <View style={styles.barsContainer}>
                {/* Income Bar */}
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      styles.incomeBar, 
                      { width: `${Math.max(incomeWidth, 0)}%` }
                    ]} 
                  />
                </View>
                
                {/* Expense Bar */}
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      styles.expenseBar, 
                      { width: `${Math.max(expenseWidth, 0)}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.valuesContainer}>
                <ThemedText style={styles.incomeText}>
                  +৳{item.income.toFixed(0)}
                </ThemedText>
                <ThemedText style={styles.expenseText}>
                  -৳{item.expense.toFixed(0)}
                </ThemedText>
              </View>
            </Animated.View>
          );
        })}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <ThemedText style={styles.legendText}>Income</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <ThemedText style={styles.legendText}>Expense</ThemedText>
        </View>
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
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    width: 32,
    fontWeight: '600',
  },
  barsContainer: {
    flex: 1,
    gap: 4,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.sm,
  },
  incomeBar: {
    backgroundColor: Colors.success,
  },
  expenseBar: {
    backgroundColor: Colors.danger,
  },
  valuesContainer: {
    width: 70,
    alignItems: 'flex-end',
  },
  incomeText: {
    ...Typography.small,
    color: Colors.success,
    fontWeight: '600',
    fontSize: 10,
  },
  expenseText: {
    ...Typography.small,
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
});
