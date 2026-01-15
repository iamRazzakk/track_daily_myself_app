import { Controller, useForm } from 'react-hook-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import api from '@/services/api-client';

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [loading, setLoading] = useState(false);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        email, 
        otp,
        newPassword: data.password,
      });
      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'You can now login with your new password',
      });
      router.replace('/(auth)/login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: err.response?.data?.message || 'Failed to reset password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock" size={60} color={Colors.primary} />
            </View>
            <ThemedText style={styles.title}>Reset Password</ThemedText>
            <ThemedText style={styles.subtitle}>
              Create a new strong password for your account
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              }}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="New Password"
                  placeholder="Enter new password"
                  isPassword
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  editable={!loading}
                />
              )}
            />

            <Controller
              control={control}
              rules={{ 
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              }}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  ref={confirmPasswordRef}
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  isPassword
                  returnKeyType="done"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  editable={!loading}
                />
              )}
            />
          </View>

          <View style={styles.passwordRequirements}>
            <ThemedText style={styles.requirementsTitle}>Password Requirements:</ThemedText>
            <View style={styles.requirementRow}>
              <MaterialIcons 
                name={password.length >= 6 ? 'check-circle' : 'radio-button-unchecked'} 
                size={16} 
                color={password.length >= 6 ? Colors.success : Colors.textSecondary} 
              />
              <ThemedText style={[
                styles.requirementText,
                password.length >= 6 && styles.requirementMet
              ]}>
                At least 6 characters
              </ThemedText>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  form: {
    marginBottom: Spacing.lg,
    gap: Spacing.base,
  },
  passwordRequirements: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  requirementsTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requirementText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  requirementMet: {
    color: Colors.success,
  },
  actions: {
    gap: Spacing.base,
  },
});
