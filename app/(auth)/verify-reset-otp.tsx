import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import api from '@/services/api-client';

const OTP_LENGTH = 6;

export default function VerifyResetOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const pastedOtp = value.slice(0, OTP_LENGTH).split('');
      pastedOtp.forEach((digit, i) => {
        if (i < OTP_LENGTH) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the complete 6-digit code',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { 
        email, 
        otp: otpCode 
      });
      Toast.show({
        type: 'success',
        text1: 'OTP Verified',
        text2: 'You can now reset your password',
      });
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, otp: otpCode },
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: err.response?.data?.message || 'Invalid or expired OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A new verification code has been sent to your email',
      });
      setCountdown(60);
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to resend OTP',
      });
    } finally {
      setResending(false);
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
              <MaterialIcons name="mark-email-read" size={60} color={Colors.primary} />
            </View>
            <ThemedText style={styles.title}>Verify OTP</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter the 6-digit verification code sent to
            </ThemedText>
            <ThemedText style={styles.email}>{email}</ThemedText>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Verify OTP"
              onPress={verifyOtp}
              disabled={loading || otp.some((d) => !d)}
              loading={loading}
            />
            
            <View style={styles.resendContainer}>
              {countdown > 0 ? (
                <ThemedText style={styles.countdownText}>
                  Resend OTP in {countdown}s
                </ThemedText>
              ) : (
                <Pressable onPress={resendOtp} disabled={resending}>
                  <ThemedText style={styles.resendLink}>
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </ThemedText>
                </Pressable>
              )}
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
  },
  email: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  actions: {
    gap: Spacing.base,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  countdownText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  resendLink: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
