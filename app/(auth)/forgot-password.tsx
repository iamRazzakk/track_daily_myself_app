import { Controller, useForm } from 'react-hook-form';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppLogo } from '@/components/AppLogo';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import api from '@/services/api-client';

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Please check your email for the verification code',
      });
      router.push({
        pathname: '/(auth)/verify-reset-otp',
        params: { email: data.email },
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to send OTP',
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
              <MaterialIcons name="lock-reset" size={60} color={Colors.primary} />
            </View>
            <ThemedText style={styles.title}>Forgot Password?</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your email address and we'll send you a verification code to reset your password
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  editable={!loading}
                />
              )}
            />
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Send OTP"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              loading={loading}
            />
            
            <View style={styles.backPrompt}>
              <ThemedText style={styles.promptText}>
                Remember your password?{' '}
                <Link href="/(auth)/login" style={styles.link}>
                  Sign In
                </Link>
              </ThemedText>
            </View>
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
    marginBottom: Spacing.xl,
    gap: Spacing.base,
  },
  actions: {
    gap: Spacing.base,
  },
  backPrompt: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  promptText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  link: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
