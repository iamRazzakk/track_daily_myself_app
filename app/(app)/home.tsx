import { useEffect, useState, useCallback } from 'react';
import { 
  ActivityIndicator, 
  RefreshControl, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View,
  useWindowDimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { TargetCard } from '@/components/TargetCard';
import { AppButton } from '@/components/AppButton';
import { useAuth } from '@/contexts/auth-context';
import { Colors, Radius, Shadows } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/categoryIcons';
import api from '@/services/api-client';

type Transaction = {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note?: string;
  date: string;
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 414;
  
  // Responsive values
  const horizontalPadding = isSmallScreen ? 12 : 16;
  const cardPadding = isSmallScreen ? 12 : 16;
  const balanceFontSize = isSmallScreen ? 24 : isMediumScreen ? 28 : 32;
  const iconSize = isSmallScreen ? 18 : 20;
  const quickActionSize = isSmallScreen ? 40 : isMediumScreen ? 44 : 48;
  const transactionIconSize = isSmallScreen ? 32 : 36;

  const { user, updateTargets, refreshUser } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetType, setTargetType] = useState<'expense' | 'income'>('expense');
  const [targetValue, setTargetValue] = useState('');
  const [savingTarget, setSavingTarget] = useState(false);

  const fetchTodayTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Transaction[]>('/transactions', { 
        params: { range: 'today' } 
      });
      setTransactions(res.data);
      
      const todayIncome = res.data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const todayExpense = res.data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalIncome: todayIncome,
        totalExpense: todayExpense,
        balance: todayIncome - todayExpense,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Could not load transactions',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayTransactions();
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTodayTransactions]);

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const openTargetModal = (type: 'expense' | 'income') => {
    setTargetType(type);
    const currentValue = type === 'expense' 
      ? user?.dailyExpenseTarget 
      : user?.dailyIncomeTarget;
    setTargetValue(currentValue ? currentValue.toString() : '');
    setShowTargetModal(true);
  };

  const saveTarget = async () => {
    setSavingTarget(true);
    try {
      const value = parseFloat(targetValue) || 0;
      await updateTargets(
        targetType === 'expense' 
          ? { dailyExpenseTarget: value }
          : { dailyIncomeTarget: value }
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Daily ${targetType} target updated`,
      });
      setShowTargetModal(false);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Could not update target',
      });
    } finally {
      setSavingTarget(false);
    }
  };

  const renderTransaction = (item: Transaction, index: number) => {
    const icon = getCategoryIcon(item.category);
    const isIncome = item.type === 'income';
    
    return (
      <Animated.View 
        key={item._id}
        entering={FadeInDown.delay(index * 50).duration(300)}
      >
        <TouchableOpacity 
          style={[styles.transactionCard, { padding: isSmallScreen ? 8 : 10 }]}
          activeOpacity={0.7}
          onPress={() => router.push(`/(app)/transactions`)}
        >
          <View style={[
            styles.iconContainer,
            { 
              backgroundColor: isIncome ? Colors.successBg : Colors.dangerBg,
              width: transactionIconSize,
              height: transactionIconSize,
            }
          ]}>
            <MaterialIcons 
              name={icon} 
              size={iconSize} 
              color={isIncome ? Colors.success : Colors.danger} 
            />
          </View>
          
          <View style={styles.transactionInfo}>
            <ThemedText style={[styles.categoryText, { fontSize: isSmallScreen ? 13 : 14 }]} numberOfLines={1}>
              {item.category}
            </ThemedText>
            <ThemedText style={[styles.timeText, { fontSize: isSmallScreen ? 10 : 11 }]}>
              {new Date(item.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </ThemedText>
          </View>
          
          <ThemedText style={[
            styles.amountText,
            { 
              color: isIncome ? Colors.success : Colors.danger,
              fontSize: isSmallScreen ? 13 : 15,
            }
          ]}>
            {isIncome ? '+' : '-'}৳{item.amount.toFixed(0)}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Calculate quick action width dynamically
  const quickActionWidth = (width - horizontalPadding * 2 - 8 * 3) / 4;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchTodayTransactions}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={[styles.greeting, { fontSize: isSmallScreen ? 11 : 12 }]}>
              {greeting()}
            </ThemedText>
            <ThemedText style={[styles.userName, { fontSize: isSmallScreen ? 18 : 20 }]} numberOfLines={1}>
              {user?.name || 'User'}
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.profileButton, { width: isSmallScreen ? 36 : 40, height: isSmallScreen ? 36 : 40 }]}
            onPress={() => router.push('/(app)/profile')}
          >
            <MaterialIcons name="person" size={isSmallScreen ? 18 : 20} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Balance Card - Compact Design */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.balanceCard, { padding: cardPadding }]}>
            <View style={styles.balanceTop}>
              <View style={styles.balanceMain}>
                <ThemedText style={[styles.balanceLabel, { fontSize: isSmallScreen ? 11 : 12 }]}>
                  Today&apos;s Balance
                </ThemedText>
                <ThemedText style={[
                  styles.balanceAmount,
                  { 
                    color: stats.balance >= 0 ? Colors.white : Colors.dangerLight,
                    fontSize: balanceFontSize,
                  }
                ]}>
                  ৳{Math.abs(stats.balance).toFixed(0)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.dateText, { fontSize: isSmallScreen ? 10 : 11 }]}>
                {today.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </ThemedText>
            </View>
            
            <View style={[styles.balanceStats, { padding: isSmallScreen ? 8 : 10 }]}>
              <View style={styles.balanceStat}>
                <MaterialIcons name="arrow-upward" size={isSmallScreen ? 12 : 14} color={Colors.success} />
                <ThemedText style={[styles.balanceStatValue, { fontSize: isSmallScreen ? 13 : 14 }]}>
                  ৳{stats.totalIncome.toFixed(0)}
                </ThemedText>
              </View>
              
              <View style={styles.balanceDivider} />
              
              <View style={styles.balanceStat}>
                <MaterialIcons name="arrow-downward" size={isSmallScreen ? 12 : 14} color={Colors.danger} />
                <ThemedText style={[styles.balanceStatValue, { fontSize: isSmallScreen ? 13 : 14 }]}>
                  ৳{stats.totalExpense.toFixed(0)}
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Daily Targets Section */}
        <Animated.View 
          entering={FadeInDown.delay(150).duration(400)} 
          style={styles.targetsSection}
        >
          <ThemedText style={[styles.sectionTitle, { fontSize: isSmallScreen ? 14 : 15 }]}>
            Today&apos;s Targets
          </ThemedText>
          <View style={[styles.targetsGrid, { gap: isSmallScreen ? 6 : 8 }]}>
            <View style={styles.targetCardWrapper}>
              <TargetCard
                title="Expense Limit"
                currentAmount={stats.totalExpense}
                targetAmount={user?.dailyExpenseTarget || 0}
                type="expense"
                onPress={() => openTargetModal('expense')}
              />
            </View>
            <View style={styles.targetCardWrapper}>
              <TargetCard
                title="Income Goal"
                currentAmount={stats.totalIncome}
                targetAmount={user?.dailyIncomeTarget || 0}
                type="income"
                onPress={() => openTargetModal('income')}
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickAction, { width: quickActionWidth }]}
              onPress={() => router.push('/(app)/add-transaction')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickActionIcon, 
                { 
                  backgroundColor: Colors.primaryLight + '20',
                  width: quickActionSize,
                  height: quickActionSize,
                }
              ]}>
                <MaterialIcons name="add" size={isSmallScreen ? 18 : 20} color={Colors.primary} />
              </View>
              <ThemedText style={[styles.quickActionText, { fontSize: isSmallScreen ? 10 : 11 }]}>Add</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { width: quickActionWidth }]}
              onPress={() => router.push('/(app)/transactions')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickActionIcon, 
                { 
                  backgroundColor: Colors.successBg,
                  width: quickActionSize,
                  height: quickActionSize,
                }
              ]}>
                <MaterialIcons name="receipt-long" size={isSmallScreen ? 18 : 20} color={Colors.success} />
              </View>
              <ThemedText style={[styles.quickActionText, { fontSize: isSmallScreen ? 10 : 11 }]}>History</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { width: quickActionWidth }]}
              onPress={() => router.push('/(app)/summary')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickActionIcon, 
                { 
                  backgroundColor: Colors.warningBg,
                  width: quickActionSize,
                  height: quickActionSize,
                }
              ]}>
                <MaterialIcons name="insights" size={isSmallScreen ? 18 : 20} color={Colors.warning} />
              </View>
              <ThemedText style={[styles.quickActionText, { fontSize: isSmallScreen ? 10 : 11 }]}>Summary</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { width: quickActionWidth }]}
              onPress={() => router.push('/(app)/profile')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickActionIcon, 
                { 
                  backgroundColor: Colors.infoBg,
                  width: quickActionSize,
                  height: quickActionSize,
                }
              ]}>
                <MaterialIcons name="settings" size={isSmallScreen ? 18 : 20} color={Colors.info} />
              </View>
              <ThemedText style={[styles.quickActionText, { fontSize: isSmallScreen ? 10 : 11 }]}>Settings</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Today's Transactions */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.transactionsSection}
        >
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { fontSize: isSmallScreen ? 14 : 15 }]}>
              Today&apos;s Transactions
            </ThemedText>
            <View style={styles.transactionCount}>
              <ThemedText style={[styles.transactionCountText, { fontSize: isSmallScreen ? 10 : 11 }]}>
                {transactions.length}
              </ThemedText>
            </View>
          </View>
          
          {loading && transactions.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : transactions.length === 0 ? (
            <View style={[styles.emptyState, { paddingVertical: isSmallScreen ? 16 : 20 }]}>
              <MaterialIcons name="receipt" size={isSmallScreen ? 32 : 36} color={Colors.gray400} />
              <ThemedText style={[styles.emptyTitle, { fontSize: isSmallScreen ? 12 : 13 }]}>
                No transactions yet
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { fontSize: isSmallScreen ? 10 : 11 }]}>
                Tap Add to record your first transaction
              </ThemedText>
            </View>
          ) : (
            <View style={[styles.transactionsList, { gap: isSmallScreen ? 4 : 6 }]}>
              {transactions.slice(0, 5).map((item, index) => (
                renderTransaction(item, index)
              ))}
              
              {transactions.length > 5 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/(app)/transactions')}
                >
                  <ThemedText style={[styles.viewAllText, { fontSize: isSmallScreen ? 11 : 12 }]}>
                    View All ({transactions.length})
                  </ThemedText>
                  <MaterialIcons name="arrow-forward" size={isSmallScreen ? 14 : 16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Target Edit Modal */}
      <Modal
        visible={showTargetModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTargetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: isSmallScreen ? 16 : 20 }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { fontSize: isSmallScreen ? 16 : 18 }]}>
                Set Daily {targetType === 'expense' ? 'Expense Limit' : 'Income Goal'}
              </ThemedText>
              <TouchableOpacity onPress={() => setShowTargetModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={[styles.modalSubtitle, { fontSize: isSmallScreen ? 12 : 13 }]}>
              {targetType === 'expense' 
                ? 'Set a daily spending limit to stay on budget'
                : 'Set a daily income goal to track your earnings'}
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.currencySymbol, { fontSize: isSmallScreen ? 20 : 24 }]}>৳</ThemedText>
              <TextInput
                style={[styles.targetInput, { fontSize: isSmallScreen ? 20 : 24 }]}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.gray400}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setShowTargetModal(false)}
                style={styles.modalButton}
              />
              <AppButton
                title="Save"
                onPress={saveTarget}
                loading={savingTarget}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  greeting: {
    color: Colors.textSecondary,
  },
  userName: {
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  profileButton: {
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginBottom: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  balanceMain: {
    flex: 1,
  },
  balanceLabel: {
    color: Colors.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontWeight: '700',
    color: Colors.white,
    marginTop: 2,
  },
  dateText: {
    color: Colors.white,
    opacity: 0.7,
  },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.sm,
  },
  balanceStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  balanceStatValue: {
    color: Colors.white,
    fontWeight: '600',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  targetsSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  targetsGrid: {
    flexDirection: 'row',
  },
  targetCardWrapper: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickActionText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  transactionsSection: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionCount: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  transactionCountText: {
    color: Colors.white,
    fontWeight: '600',
  },
  transactionsList: {},
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  categoryText: {
    color: Colors.text,
    fontWeight: '600',
  },
  timeText: {
    color: Colors.textTertiary,
  },
  amountText: {
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.text,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: Colors.text,
    fontWeight: '600',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    color: Colors.textSecondary,
    marginRight: 8,
  },
  targetInput: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
