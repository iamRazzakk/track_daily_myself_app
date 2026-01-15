import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
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

type DashboardResponse = {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  recentTransactions: Transaction[];
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardResponse>('/summary/dashboard');
      setData(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionCard} activeOpacity={0.7}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: item.type === 'income' ? Colors.successBg : Colors.dangerBg }
        ]}>
          <MaterialIcons
            name={getCategoryIcon(item.category)}
            size={24}
            color={item.type === 'income' ? Colors.success : Colors.danger}
          />
        </View>
        <View style={styles.transactionDetails}>
          <ThemedText style={styles.transactionCategory}>{item.category}</ThemedText>
          {item.note && (
            <ThemedText style={styles.transactionNote} numberOfLines={1}>
              {item.note}
            </ThemedText>
          )}
          <ThemedText style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[
        styles.transactionAmount,
        { color: item.type === 'income' ? Colors.success : Colors.danger }
      ]}>
        {item.type === 'income' ? '+' : '-'}৳{item.amount.toFixed(0)}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Hello, {user?.name || 'User'} 👋</ThemedText>
            <ThemedText style={styles.headerSubtext}>Welcome back!</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(app)/profile')}
          >
            <MaterialIcons name="account-circle" size={40} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard} elevation="lg">
          <View style={styles.balanceCardInner}>
            <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
            <ThemedText style={styles.balanceAmount}>
              ৳{data?.totalBalance.toFixed(2) || '0.00'}
            </ThemedText>
            <View style={styles.balanceChange}>
              <MaterialIcons 
                name={data && data.monthNet >= 0 ? 'trending-up' : 'trending-down'} 
                size={16} 
                color={data && data.monthNet >= 0 ? Colors.success : Colors.danger} 
              />
              <ThemedText style={[
                styles.balanceChangeText,
                { color: data && data.monthNet >= 0 ? Colors.success : Colors.danger }
              ]}>
                ৳{Math.abs(data?.monthNet || 0).toFixed(0)} this month
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} elevation="sm">
            <View style={[styles.statIcon, { backgroundColor: Colors.successBg }]}>
              <MaterialIcons name="arrow-downward" size={20} color={Colors.success} />
            </View>
            <ThemedText style={styles.statLabel}>Income</ThemedText>
            <ThemedText style={[styles.statValue, { color: Colors.success }]}>
              ৳{data?.monthIncome.toFixed(0) || '0'}
            </ThemedText>
            <ThemedText style={styles.statPeriod}>This month</ThemedText>
          </Card>

          <Card style={styles.statCard} elevation="sm">
            <View style={[styles.statIcon, { backgroundColor: Colors.dangerBg }]}>
              <MaterialIcons name="arrow-upward" size={20} color={Colors.danger} />
            </View>
            <ThemedText style={styles.statLabel}>Expenses</ThemedText>
            <ThemedText style={[styles.statValue, { color: Colors.danger }]}>
              ৳{data?.monthExpense.toFixed(0) || '0'}
            </ThemedText>
            <ThemedText style={styles.statPeriod}>This month</ThemedText>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={() => router.push('/(app)/add-transaction')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={24} color={Colors.white} />
              <ThemedText style={styles.actionButtonText}>Add Transaction</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.info }]}
              onPress={() => router.push('/(app)/summary')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="pie-chart" size={24} color={Colors.white} />
              <ThemedText style={styles.actionButtonText}>View Summary</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(app)/transactions')}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          {loading && !data ? (
            <Card style={styles.emptyCard}>
              <ThemedText style={styles.emptyText}>Loading...</ThemedText>
            </Card>
          ) : !data?.recentTransactions || data.recentTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <MaterialIcons name="receipt-long" size={48} color={Colors.gray400} />
              <ThemedText style={styles.emptyTitle}>No transactions yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start tracking by adding your first transaction
              </ThemedText>
            </Card>
          ) : (
            <View style={styles.transactionsList}>
              {data.recentTransactions.map((item) => (
                <View key={item._id}>
                  {renderTransaction({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.sm,
  },
  greeting: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs / 2,
  },
  headerSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.primary,
  },
  balanceCardInner: {
    paddingVertical: Spacing.lg,
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    ...Typography.h1,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceChangeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  statValue: {
    ...Typography.h4,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  statPeriod: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  quickActions: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  actionButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  recentSection: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 2,
  },
  transactionNote: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  transactionAmount: {
    ...Typography.h4,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
