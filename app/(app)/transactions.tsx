import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
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

type RangeFilter = 'today' | 'last7days' | 'thisMonth' | 'all';

export default function TransactionsScreen() {
  const [range, setRange] = useState<RangeFilter>('last7days');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const params = useMemo(() => {
    const base: any = {};
    if (range !== 'all') base.range = range;
    if (typeFilter !== 'all') base.type = typeFilter;
    return base;
  }, [range, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get<Transaction[]>('/transactions', { params });
      setTransactions(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [params.range, params.type]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard} elevation="sm">
      <View style={styles.transactionContent}>
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
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
          {item.note ? (
            <ThemedText style={styles.noteText} numberOfLines={1}>
              {item.note}
            </ThemedText>
          ) : null}
          <ThemedText style={styles.dateText}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </ThemedText>
        </View>
        <ThemedText style={[
          styles.amountText,
          { color: item.type === 'income' ? Colors.success : Colors.danger }
        ]}>
          {item.type === 'income' ? '+' : '-'}৳{item.amount.toFixed(0)}
        </ThemedText>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Transactions</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.filtersContainer}>
          <ThemedText style={styles.filterLabel}>Time Period</ThemedText>
          <View style={styles.filterChips}>
            <FilterChip label="Today" active={range === 'today'} onPress={() => setRange('today')} />
            <FilterChip label="Last 7 Days" active={range === 'last7days'} onPress={() => setRange('last7days')} />
            <FilterChip label="This Month" active={range === 'thisMonth'} onPress={() => setRange('thisMonth')} />
            <FilterChip label="All Time" active={range === 'all'} onPress={() => setRange('all')} />
          </View>

          <ThemedText style={styles.filterLabel}>Type</ThemedText>
          <View style={styles.filterChips}>
            <FilterChip label="All" active={typeFilter === 'all'} onPress={() => setTypeFilter('all')} />
            <FilterChip 
              label="Income" 
              active={typeFilter === 'income'} 
              onPress={() => setTypeFilter('income')}
              icon="arrow-upward"
              activeColor={Colors.success}
            />
            <FilterChip 
              label="Expense" 
              active={typeFilter === 'expense'} 
              onPress={() => setTypeFilter('expense')}
              icon="arrow-downward"
              activeColor={Colors.danger}
            />
          </View>
        </View>

        {loading && transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Loading...</ThemedText>
          </View>
        ) : transactions.length === 0 ? (
          <Card style={styles.emptyContainer} elevation="sm">
            <MaterialIcons name="receipt-long" size={64} color={Colors.gray400} />
            <ThemedText style={styles.emptyTitle}>No transactions found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your filters or add a new transaction
            </ThemedText>
          </Card>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTransactions} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  activeColor?: string;
}

function FilterChip({ label, active, onPress, icon, activeColor = Colors.primary }: FilterChipProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.chip, 
        active && { ...styles.chipActive, backgroundColor: activeColor, borderColor: activeColor }
      ]}
      activeOpacity={0.7}
    >
      {icon && (
        <MaterialIcons 
          name={icon} 
          size={16} 
          color={active ? Colors.white : Colors.textSecondary} 
        />
      )}
      <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  filtersContainer: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  filterLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  listContainer: {
    padding: Spacing.base,
    paddingTop: 0,
  },
  transactionCard: {
    padding: Spacing.md,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryText: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 2,
  },
  noteText: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  amountText: {
    ...Typography.h4,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.base,
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
