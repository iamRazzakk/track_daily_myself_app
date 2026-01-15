import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/themed-text';
import { 
  PeriodToggle,
  LineChart,
  PieChart,
} from '@/components/charts';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import api from '@/services/api-client';

type Period = 'weekly' | 'monthly';

type SummaryData = {
  period: 'weekly' | 'monthly';
  month?: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  chartData: { date?: string; week?: string; income: number; expense: number; net: number }[];
  categoryBreakdown: { category: string; type: string; total: number }[];
};

export default function SummaryScreen() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const endpoint = period === 'weekly' ? '/summary/weekly' : '/summary/monthly';
      const res = await api.get<SummaryData>(endpoint);
      setData(res.data);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Could not load summary',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Transform chart data for LineChart
  const getLineChartData = () => {
    if (!data) return [];
    return data.chartData.map((item) => ({
      label: item.date || item.week || '',
      income: item.income,
      expense: item.expense,
    }));
  };

  const hasData = data && (data.totalIncome > 0 || data.totalExpense > 0);

  // Calculate savings rate
  const savingsRate = data && data.totalIncome > 0 
    ? ((data.totalIncome - data.totalExpense) / data.totalIncome * 100).toFixed(1)
    : '0';

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `৳${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `৳${(amount / 1000).toFixed(1)}K`;
    }
    return `৳${amount.toFixed(0)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchData(true)}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Summary</ThemedText>
          <ThemedText style={styles.subtitle}>
            {period === 'weekly' ? 'Last 7 days overview' : 'Monthly financial report'}
          </ThemedText>
        </View>

        {/* Period Toggle */}
        <Animated.View 
          entering={FadeInDown.duration(300)} 
          style={styles.toggleContainer}
        >
          <PeriodToggle period={period} onPeriodChange={setPeriod} />
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText style={styles.loadingText}>Loading summary...</ThemedText>
          </View>
        ) : !hasData ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="pie-chart" size={64} color={Colors.gray400} />
            </View>
            <ThemedText style={styles.emptyTitle}>No data yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Start tracking your transactions to see your financial summary with beautiful charts
            </ThemedText>
            <AppButton
              title="Add Transaction"
              onPress={() => router.push('/(app)/add-transaction')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            {/* Overview Cards */}
            <Animated.View 
              entering={FadeInDown.delay(100).duration(300)}
              style={styles.overviewSection}
            >
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <View style={[styles.overviewIconBg, { backgroundColor: Colors.successBg }]}>
                    <MaterialIcons name="arrow-upward" size={20} color={Colors.success} />
                  </View>
                  <ThemedText style={styles.overviewLabel}>Total Income</ThemedText>
                </View>
                <ThemedText style={[styles.overviewValue, { color: Colors.success }]}>
                  {formatCurrency(data.totalIncome)}
                </ThemedText>
              </View>

              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <View style={[styles.overviewIconBg, { backgroundColor: Colors.dangerBg }]}>
                    <MaterialIcons name="arrow-downward" size={20} color={Colors.danger} />
                  </View>
                  <ThemedText style={styles.overviewLabel}>Total Expenses</ThemedText>
                </View>
                <ThemedText style={[styles.overviewValue, { color: Colors.danger }]}>
                  {formatCurrency(data.totalExpense)}
                </ThemedText>
              </View>
            </Animated.View>

            {/* Net Balance & Savings */}
            <Animated.View 
              entering={FadeInDown.delay(150).duration(300)}
              style={styles.balanceSection}
            >
              <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceItem}>
                    <ThemedText style={styles.balanceLabel}>Net Balance</ThemedText>
                    <ThemedText style={[
                      styles.balanceValue,
                      { color: data.net >= 0 ? Colors.success : Colors.danger }
                    ]}>
                      {data.net >= 0 ? '+' : ''}{formatCurrency(data.net)}
                    </ThemedText>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.balanceItem}>
                    <ThemedText style={styles.balanceLabel}>Savings Rate</ThemedText>
                    <ThemedText style={[
                      styles.balanceValue,
                      { color: parseFloat(savingsRate) >= 0 ? Colors.success : Colors.danger }
                    ]}>
                      {savingsRate}%
                    </ThemedText>
                  </View>
                </View>
                
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(Math.abs(parseFloat(savingsRate)), 100)}%`,
                          backgroundColor: parseFloat(savingsRate) >= 0 ? Colors.success : Colors.danger
                        }
                      ]} 
                    />
                  </View>
                  <ThemedText style={styles.progressText}>
                    {parseFloat(savingsRate) >= 20 ? '🎉 Great job!' : parseFloat(savingsRate) >= 0 ? '💪 Keep going!' : '⚠️ Spending more than earning'}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>

            {/* Income vs Expense Line Chart */}
            <Animated.View 
              entering={FadeInDown.delay(200).duration(300)}
              style={styles.chartSection}
            >
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <MaterialIcons name="show-chart" size={24} color={Colors.primary} />
                  <ThemedText style={styles.chartTitle}>
                    {period === 'weekly' ? 'Daily Trend' : 'Weekly Trend'}
                  </ThemedText>
                </View>
                <LineChart 
                  data={getLineChartData()} 
                  title=""
                  showIncome={true}
                  showExpense={true}
                  height={220}
                />
                <View style={styles.legendRow}>
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
            </Animated.View>

            {/* Pie Charts Section */}
            {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
              <>
                {/* Expense Pie Chart */}
                {data.categoryBreakdown.some(c => c.type === 'expense') && (
                  <Animated.View 
                    entering={FadeInDown.delay(300).duration(300)}
                    style={styles.chartSection}
                  >
                    <PieChart 
                      data={data.categoryBreakdown}
                      title="Where Your Money Goes 💸"
                      type="expense"
                      showTopCount={6}
                    />
                  </Animated.View>
                )}

                {/* Income Pie Chart */}
                {data.categoryBreakdown.some(c => c.type === 'income') && (
                  <Animated.View 
                    entering={FadeInDown.delay(400).duration(300)}
                    style={styles.chartSection}
                  >
                    <PieChart 
                      data={data.categoryBreakdown}
                      title="Income Sources 💰"
                      type="income"
                      showTopCount={6}
                    />
                  </Animated.View>
                )}

                {/* Top Categories */}
                <Animated.View 
                  entering={FadeInDown.delay(500).duration(300)}
                  style={styles.chartSection}
                >
                  <View style={styles.topCategoriesCard}>
                    <View style={styles.chartHeader}>
                      <MaterialIcons name="category" size={24} color={Colors.primary} />
                      <ThemedText style={styles.chartTitle}>Top Categories</ThemedText>
                    </View>
                    
                    {data.categoryBreakdown
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 5)
                      .map((cat, idx) => {
                        const maxTotal = Math.max(...data.categoryBreakdown.map(c => c.total));
                        const percentage = (cat.total / maxTotal) * 100;
                        
                        return (
                          <View key={idx} style={styles.categoryRow}>
                            <View style={styles.categoryInfo}>
                              <View style={[
                                styles.categoryRank,
                                { backgroundColor: idx < 3 ? Colors.primary : Colors.gray300 }
                              ]}>
                                <ThemedText style={styles.categoryRankText}>{idx + 1}</ThemedText>
                              </View>
                              <View style={styles.categoryDetails}>
                                <ThemedText style={styles.categoryName}>{cat.category}</ThemedText>
                                <View style={styles.categoryProgressBar}>
                                  <View 
                                    style={[
                                      styles.categoryProgressFill,
                                      { 
                                        width: `${percentage}%`,
                                        backgroundColor: cat.type === 'income' ? Colors.success : Colors.danger
                                      }
                                    ]} 
                                  />
                                </View>
                              </View>
                            </View>
                            <ThemedText style={[
                              styles.categoryAmount,
                              { color: cat.type === 'income' ? Colors.success : Colors.danger }
                            ]}>
                              {cat.type === 'income' ? '+' : '-'}{formatCurrency(cat.total)}
                            </ThemedText>
                          </View>
                        );
                      })}
                  </View>
                </Animated.View>
              </>
            )}

            {/* Quick Actions */}
            <Animated.View 
              entering={FadeInDown.delay(600).duration(300)}
              style={styles.actionsSection}
            >
              <AppButton
                title="View All Transactions"
                onPress={() => router.push('/(app)/transactions')}
                variant="secondary"
                style={styles.actionButton}
              />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  toggleContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
  
  // Overview Section
  overviewSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  overviewIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  overviewValue: {
    ...Typography.h3,
    fontWeight: '700',
  },

  // Balance Section
  balanceSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  balanceLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: Spacing.base,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Chart Section
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chartTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
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

  // Top Categories
  topCategoriesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  categoryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRankText: {
    ...Typography.small,
    color: Colors.white,
    fontWeight: '700',
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 4,
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmount: {
    ...Typography.bodyBold,
    marginLeft: Spacing.sm,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
