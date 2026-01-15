import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

type DataPoint = {
  label: string;
  income?: number;
  expense?: number;
  value?: number;
};

type LineChartProps = {
  data: DataPoint[];
  title?: string;
  showIncome?: boolean;
  showExpense?: boolean;
  height?: number;
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title = 'Trend',
  showIncome = true,
  showExpense = true,
  height = 200,
}) => {
  const chartWidth = screenWidth - Spacing.lg * 2 - Spacing.base * 2;
  const chartHeight = height - 60;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No data available</ThemedText>
        </View>
      </View>
    );
  }

  // Calculate max value for scaling
  const allValues: number[] = [];
  data.forEach(d => {
    if (showIncome && d.income !== undefined) allValues.push(d.income);
    if (showExpense && d.expense !== undefined) allValues.push(d.expense);
    if (d.value !== undefined) allValues.push(Math.abs(d.value));
  });
  
  const maxValue = Math.max(...allValues, 1);
  const minValue = 0;

  // Generate path for a line
  const generatePath = (values: number[]): string => {
    if (values.length === 0) return '';
    
    const stepX = graphWidth / Math.max(values.length - 1, 1);
    
    return values
      .map((value, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + graphHeight - (value / maxValue) * graphHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = (values: number[]): string => {
    if (values.length === 0) return '';
    
    const stepX = graphWidth / Math.max(values.length - 1, 1);
    const linePath = values
      .map((value, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + graphHeight - (value / maxValue) * graphHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    
    // Close the path to create an area
    const lastX = padding.left + (values.length - 1) * stepX;
    const bottomY = padding.top + graphHeight;
    const startX = padding.left;
    
    return `${linePath} L ${lastX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  const incomeValues = showIncome ? data.map(d => d.income || 0) : [];
  const expenseValues = showExpense ? data.map(d => d.expense || 0) : [];
  
  const stepX = graphWidth / Math.max(data.length - 1, 1);

  // Generate grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    y: padding.top + graphHeight - ratio * graphHeight,
    value: Math.round(ratio * maxValue),
  }));

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      
      <View style={[styles.chartContainer, { height }]}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Colors.success} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={Colors.success} stopOpacity="0.05" />
            </LinearGradient>
            <LinearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Colors.danger} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={Colors.danger} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          
          {/* Grid lines */}
          {gridLines.map((grid, idx) => (
            <Line
              key={idx}
              x1={padding.left}
              y1={grid.y}
              x2={chartWidth - padding.right}
              y2={grid.y}
              stroke={Colors.gray300}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}
          
          {/* Income area and line */}
          {showIncome && incomeValues.length > 0 && (
            <>
              <Path
                d={generateAreaPath(incomeValues)}
                fill="url(#incomeGradient)"
              />
              <Path
                d={generatePath(incomeValues)}
                stroke={Colors.success}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {incomeValues.map((value, idx) => (
                <Circle
                  key={`income-${idx}`}
                  cx={padding.left + idx * stepX}
                  cy={padding.top + graphHeight - (value / maxValue) * graphHeight}
                  r={4}
                  fill={Colors.white}
                  stroke={Colors.success}
                  strokeWidth={2}
                />
              ))}
            </>
          )}
          
          {/* Expense area and line */}
          {showExpense && expenseValues.length > 0 && (
            <>
              <Path
                d={generateAreaPath(expenseValues)}
                fill="url(#expenseGradient)"
              />
              <Path
                d={generatePath(expenseValues)}
                stroke={Colors.danger}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {expenseValues.map((value, idx) => (
                <Circle
                  key={`expense-${idx}`}
                  cx={padding.left + idx * stepX}
                  cy={padding.top + graphHeight - (value / maxValue) * graphHeight}
                  r={4}
                  fill={Colors.white}
                  stroke={Colors.danger}
                  strokeWidth={2}
                />
              ))}
            </>
          )}
          
          {/* X-axis labels */}
          {data.map((d, idx) => (
            <SvgText
              key={idx}
              x={padding.left + idx * stepX}
              y={chartHeight - 5}
              fontSize={10}
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              {d.label.slice(-5)}
            </SvgText>
          ))}
        </Svg>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        {showIncome && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <ThemedText style={styles.legendText}>Income</ThemedText>
          </View>
        )}
        {showExpense && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <ThemedText style={styles.legendText}>Expense</ThemedText>
          </View>
        )}
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
  chartContainer: {
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
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
