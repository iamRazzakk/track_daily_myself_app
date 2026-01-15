import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/categoryIcons';
import api from '@/services/api-client';

type TransactionForm = {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  note: string;
  date: string;
};

type Categories = {
  income: string[];
  expense: string[];
};

export default function AddTransactionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categories>({ income: [], expense: [] });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionForm>({
    defaultValues: {
      amount: '',
      type: 'expense',
      category: '',
      note: '',
      date: new Date().toISOString(),
    },
  });

  const typeValue = watch('type');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Categories>('/categories');
        setCategories(res.data);
      } catch {
        // fallback
        setCategories({
          income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'],
          expense: [
            'Breakfast', 'Lunch', 'Dinner', 'Evening Snacks', 'Tea/Coffee',
            'Smoking', 'Alcohol',
            'Bus', 'Auto/Rickshaw', 'Taxi/Cab', 'Fuel', 'Parking',
            'Bara/Samosa', 'Street Food', 'Sweets',
            'Electricity', 'Water', 'Internet', 'Phone Bill', 'Rent',
            'Groceries', 'Clothes', 'Personal Care', 'Shopping',
            'Movies', 'Entertainment', 'Gaming',
            'Medicine', 'Healthcare', 'Education', 'Books',
            'Travel', 'Gift', 'Other Expense',
          ],
        });
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: TransactionForm) => {
    const amount = parseFloat(data.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount greater than 0',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions', {
        ...data,
        amount,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Transaction added successfully',
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Could not add transaction',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = typeValue === 'income' ? categories.income : categories.expense;
  const noteRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Add Transaction</ThemedText>
            <View style={styles.backButton} />
          </View>

          <View style={styles.content}>
            {/* Type Toggle Pills */}
            <Card style={styles.typeCard} elevation="sm">
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.typePillsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.typePill,
                        value === 'income' && styles.typePillActiveIncome
                      ]}
                      onPress={() => onChange('income')}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons 
                        name="arrow-upward" 
                        size={20} 
                        color={value === 'income' ? Colors.white : Colors.success} 
                      />
                      <ThemedText style={[
                        styles.typePillText,
                        value === 'income' && styles.typePillTextActive
                      ]}>
                        Income
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typePill,
                        value === 'expense' && styles.typePillActiveExpense
                      ]}
                      onPress={() => onChange('expense')}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons 
                        name="arrow-downward" 
                        size={20} 
                        color={value === 'expense' ? Colors.white : Colors.danger} 
                      />
                      <ThemedText style={[
                        styles.typePillText,
                        value === 'expense' && styles.typePillTextActive
                      ]}>
                        Expense
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </Card>

            <ThemedText style={styles.fieldLabel}>Amount</ThemedText>
            <Controller
              control={control}
              rules={{ required: 'Amount is required' }}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.amountInputContainer}>
                  <ThemedText style={styles.currencySymbol}>৳</ThemedText>
                  <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />
          {errors.amount && <ThemedText style={styles.error}>{errors.amount.message}</ThemedText>}

          <ThemedText style={styles.fieldLabel}>Category</ThemedText>
          <Controller
            control={control}
            rules={{ required: 'Category is required' }}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryGrid}>
                {availableCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, cat === value && styles.categoryChipActive]}
                    onPress={() => onChange(cat)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={getCategoryIcon(cat)}
                      size={16}
                      color={cat === value ? Colors.white : Colors.textSecondary}
                    />
                    <ThemedText style={cat === value ? styles.categoryChipTextActive : styles.categoryChipText}>
                      {cat}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.category && <ThemedText style={styles.error}>{errors.category.message}</ThemedText>}

          <ThemedText style={styles.fieldLabel}>Date & Time</ThemedText>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <View style={styles.dateTimeContainer}>
                {/* Date Button */}
                <TouchableOpacity 
                  style={[styles.dateButton, styles.dateButtonHalf]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateButtonContent}>
                    <MaterialIcons name="event" size={20} color={Colors.textSecondary} />
                    <ThemedText style={styles.dateButtonText}>
                      {new Date(value).toLocaleDateString('en-US', {  
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </ThemedText>
                  </View>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
                
                {/* Time Button */}
                <TouchableOpacity 
                  style={[styles.dateButton, styles.dateButtonHalf]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateButtonContent}>
                    <MaterialIcons name="schedule" size={20} color={Colors.textSecondary} />
                    <ThemedText style={styles.dateButtonText}>
                      {new Date(value).toLocaleTimeString('en-US', {  
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </ThemedText>
                  </View>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
                
                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) {
                        const newDate = new Date(selectedDate);
                        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                        setSelectedDate(newDate);
                        onChange(newDate.toISOString());
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
                
                {/* Time Picker */}
                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, time) => {
                      setShowTimePicker(Platform.OS === 'ios');
                      if (time) {
                        const newDate = new Date(selectedDate);
                        newDate.setHours(time.getHours(), time.getMinutes());
                        setSelectedDate(newDate);
                        onChange(newDate.toISOString());
                      }
                    }}
                  />
                )}
              </View>
            )}
          />

          <ThemedText style={styles.fieldLabel}>Note (optional)</ThemedText>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={noteRef}
                style={styles.input}
                placeholder="e.g., Lunch at restaurant"
                returnKeyType="done"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
                editable={!loading}
                value={value}
              />
            )}
          />

            <AppButton
              title="Add Transaction"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  typeCard: {
    padding: Spacing.xs,
  },
  typePillsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
    backgroundColor: Colors.gray100,
  },
  typePillActiveIncome: {
    backgroundColor: Colors.success,
  },
  typePillActiveExpense: {
    backgroundColor: Colors.danger,
  },
  typePillText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  typePillTextActive: {
    color: Colors.white,
  },
  fieldLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    ...Typography.body,
    color: Colors.text,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingLeft: Spacing.base,
  },
  currencySymbol: {
    ...Typography.h3,
    color: Colors.gray700,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    padding: Spacing.md,
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  dateButtonHalf: {
    flex: 1,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateButtonText: {
    ...Typography.body,
    color: Colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.caption,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  error: {
    ...Typography.small,
    color: Colors.danger,
    marginTop: Spacing.xs / 2,
  },
});
