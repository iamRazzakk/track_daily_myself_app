import { Controller, useForm } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { ThemedText } from "@/components/themed-text";
import { AppLogo } from "@/components/AppLogo";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "Please verify your email to continue",
      });
      // Redirect to email verification
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: data.email },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: err.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppLogo size={80} />
            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>
              Start tracking your finances today
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              rules={{
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              }}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Name"
                  placeholder="Your name"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  editable={!loading}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  ref={emailRef}
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!loading}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  ref={passwordRef}
                  label="Password"
                  placeholder="Create a password"
                  isPassword
                  returnKeyType="done"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  editable={!loading}
                />
              )}
            />
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Register"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              loading={loading}
            />

            <View style={styles.loginPrompt}>
              <ThemedText style={styles.promptText}>
                Already have an account?{" "}
                <Link href="/(auth)/login" style={styles.link}>
                  Login
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    marginBottom: Spacing.xl,
    gap: Spacing.base,
  },
  actions: {
    gap: Spacing.base,
  },
  loginPrompt: {
    alignItems: "center",
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
