import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';

type TargetCardProps = {
  title: string;
  currentAmount: number;
  targetAmount: number;
  type: 'expense' | 'income';
  onPress?: () => void;
};

export const TargetCard: React.FC<TargetCardProps> = ({
  title,
  currentAmount,
  targetAmount,
  type,
  onPress,
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  
  const isExpense = type === 'expense';
  const hasTarget = targetAmount > 0;
  
  let progress = hasTarget ? (currentAmount / targetAmount) * 100 : 0;
  progress = Math.min(progress, 100);
  
  const isOverBudget = isExpense && currentAmount > targetAmount;
  const isOnTrack = isExpense 
    ? currentAmount <= targetAmount 
    : currentAmount >= targetAmount;
  
  const progressColor = hasTarget
    ? isOverBudget 
      ? Colors.danger 
      : isOnTrack 
        ? Colors.success 
        : Colors.warning
    : Colors.gray400;

  const statusText = !hasTarget
    ? 'Tap to set'
    : isExpense
      ? isOverBudget
        ? `Over by ৳${(currentAmount - targetAmount).toFixed(0)}`
        : `৳${(targetAmount - currentAmount).toFixed(0)} left`
      : currentAmount >= targetAmount
        ? 'Goal reached!'
        : `৳${(targetAmount - currentAmount).toFixed(0)} to go`;

  return (
    <TouchableOpacity 
      style={[styles.container, { padding: isSmallScreen ? 8 : 10 }]} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.title, { fontSize: isSmallScreen ? 10 : 11 }]} numberOfLines={1}>
          {title}
        </ThemedText>
        {onPress && (
          <MaterialIcons name="edit" size={12} color={Colors.textTertiary} />
        )}
      </View>
      
      <ThemedText style={[styles.currentAmount, { fontSize: isSmallScreen ? 16 : 18 }]}>
        ৳{currentAmount.toFixed(0)}
      </ThemedText>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { height: isSmallScreen ? 4 : 5 }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: hasTarget ? `${Math.min(progress, 100)}%` : '0%',
                backgroundColor: progressColor,
              }
            ]} 
          />
        </View>
      </View>
      
      <ThemedText style={[styles.status, { color: progressColor, fontSize: isSmallScreen ? 9 : 10 }]} numberOfLines={1}>
        {statusText}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  currentAmount: {
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBackground: {
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  status: {
    fontWeight: '600',
  },
});
