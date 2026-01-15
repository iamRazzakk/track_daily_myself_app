import { useState, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

import { AppButton } from "@/components/AppButton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/auth-context";

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Please allow access to your photos to change profile picture",
      });
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Please allow camera access to take a photo",
      });
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Invalid Name",
        text2: "Please enter your name",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: { name: string; profileImage?: string } = { 
        name: name.trim() 
      };

      // Convert image to base64 if a new image was selected
      if (profileImage) {
        const base64 = await FileSystem.readAsStringAsync(profileImage, {
          encoding: 'base64',
        });
        // Add data URI prefix for the backend
        const mimeType = profileImage.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        updateData.profileImage = `data:${mimeType};base64,${base64}`;
      }

      // Update profile via API
      await updateProfile(updateData);

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been updated successfully",
      });

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || error.message || "Could not update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentImage = profileImage || user?.profileImage || null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText style={styles.backButton}>← Back</ThemedText>
              </TouchableOpacity>
              <ThemedText type="title" style={styles.title}>
                Edit Profile
              </ThemedText>
            </View>

            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <View style={styles.avatarContainer}>
                {currentImage ? (
                  <Image source={{ uri: currentImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <ThemedText style={styles.avatarText}>
                      {name?.charAt(0).toUpperCase() ||
                        user?.name?.charAt(0).toUpperCase() ||
                        "?"}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <ThemedText style={styles.imageButtonText}>
                    Choose Photo
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={takePhoto}
                >
                  <ThemedText style={styles.imageButtonText}>
                    Take Photo
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={user?.email || ""}
                  editable={false}
                  placeholderTextColor="#9ca3af"
                />
                <ThemedText style={styles.helpText}>
                  Email cannot be changed
                </ThemedText>
              </View>
            </View>

            {/* Save Button */}
            <AppButton
              title="Save Changes"
              onPress={handleSave}
              disabled={loading}
              loading={loading}
              style={styles.saveButton}
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
    backgroundColor: "#f9fafb",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },  backButton: {
    fontSize: 16,
    color: "#3b82f6",
    marginBottom: 12,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#e5e7eb",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#e5e7eb",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
  },
  imageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
