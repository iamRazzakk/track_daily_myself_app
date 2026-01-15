import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

type CategoryData = {
  category: string;
  total: number;
  type: string;
};

type PieChartProps = {
  data: CategoryData[];
  title?: string;
  type?: 'income' | 'expense';
  showTopCount?: number;
};

// Pie chart colors
const PIE_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#84CC16', // Lime
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Category Breakdown',
  type = 'expense',
  showTopCount = 5,
}) => {
  const size = Math.min(screenWidth - Spacing.lg * 4, 200);
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = radius * 0.6; // Donut hole

  // Filter and sort data
  const filteredData = data
    .filter(item => item.type === type && item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, showTopCount);

  if (filteredData.length === 0) {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No {type} data available</ThemedText>
        </View>
      </Animated.View>
    );
  }

  const total = filteredData.reduce((sum, item) => sum + item.total, 0);

  // Generate pie slices
  const generateSlices = () => {
    let currentAngle = -90; // Start from top
    
    return filteredData.map((item, idx) => {
      const percentage = (item.total / total) * 100;
      const angle = (item.total / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Calculate path
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      // Inner radius points (for donut)
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Donut path
      const path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;
      
      currentAngle = endAngle;
      
      return {
        path,
        color: PIE_COLORS[idx % PIE_COLORS.length],
        percentage: percentage.toFixed(1),
        category: item.category,
        total: item.total,
      };
    });
  };

  const slices = generateSlices();

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      
      <View style={styles.chartRow}>
        {/* Pie Chart */}
        <View style={styles.pieContainer}>
          <Svg width={size} height={size}>
            <G>
              {slices.map((slice, idx) => (
                <Path
                  key={idx}
                  d={slice.path}
                  fill={slice.color}
                  strokeWidth={2}
                  stroke={Colors.white}
                />
              ))}
            </G>
            {/* Center text */}
            <SvgText
              x={centerX}
              y={centerY - 5}
              fontSize={12}
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              Total
            </SvgText>
            <SvgText
              x={centerX}
              y={centerY + 12}
              fontSize={14}
              fontWeight="600"
              fill={Colors.text}
              textAnchor="middle"
            >
              ৳{total.toFixed(0)}
            </SvgText>
          </Svg>
        </View>
        
        {/* Legend */}
        <View style={styles.legendContainer}>
          {slices.map((slice, idx) => {
            const icon = getCategoryIcon(slice.category);
            return (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
                <View style={styles.legendInfo}>
                  <ThemedText style={styles.legendCategory} numberOfLines={1}>
                    {slice.category}
                  </ThemedText>
                  <ThemedText style={styles.legendPercent}>
                    {slice.percentage}%
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

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
    marginBottom: Spacing.md,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieContainer: {
    flex: 1,
    alignItems: 'center',
  },
  emptyState: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: Spacing.md,
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendCategory: {
    ...Typography.small,
    color: Colors.text,
    flex: 1,
  },
  legendPercent: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
