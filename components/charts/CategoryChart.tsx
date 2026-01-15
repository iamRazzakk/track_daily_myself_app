import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/categoryIcons';

type CategoryData = {
  category: string;
  type: string;
  total: number;
};

type CategoryChartProps = {
  data: CategoryData[];
  title?: string;
  showTopCount?: number;
  type?: 'expense' | 'income' | 'all';
};

const CHART_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

export function CategoryChart({ 
  data, 
  title, 
  showTopCount = 5, 
  type = 'expense' 
}: CategoryChartProps) {
  const filteredData = type === 'all' 
    ? data 
    : data.filter(c => c.type === type);
  
  const topCategories = filteredData.slice(0, showTopCount);
  
  const totalAmount = filteredData.reduce((sum, c) => sum + c.total, 0);
  const maxAmount = Math.max(...topCategories.map(c => c.total), 1);

  if (topCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.total}>
            Total: ৳{totalAmount.toFixed(0)}
          </ThemedText>
        </View>
      )}
      
      <View style={styles.chartContainer}>
        {topCategories.map((item, idx) => {
          const percentage = (item.total / maxAmount) * 100;
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          const icon = getCategoryIcon(item.category);
          
          return (
            <Animated.View 
              key={idx} 
              style={styles.categoryRow}
              entering={FadeInDown.delay(idx * 60).duration(300)}
            >
              <View style={styles.categoryInfo}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                  <MaterialIcons name={icon} size={16} color={color} />
                </View>
                <ThemedText style={styles.categoryName} numberOfLines={1}>
                  {item.category}
                </ThemedText>
              </View>
              
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { width: `${percentage}%`, backgroundColor: color }
                  ]} 
                />
              </View>
              
              <View style={styles.valueContainer}>
                <ThemedText style={styles.value}>৳{item.total.toFixed(0)}</ThemedText>
                <ThemedText style={styles.percentage}>
                  {((item.total / totalAmount) * 100).toFixed(0)}%
                </ThemedText>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  total: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chartContainer: {
    gap: Spacing.md,
  },
  categoryRow: {
    gap: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  barContainer: {
    height: 12,
    backgroundColor: Colors.gray200,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  value: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '700',
  },
  percentage: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
});
