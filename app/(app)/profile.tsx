import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const profileItems = [
    { icon: '👤', label: 'Full Name', value: user?.name || 'N/A' },
    { icon: '📧', label: 'Email', value: user?.email || 'N/A' },
    { icon: '📅', label: 'Member Since', value: user ? new Date().toLocaleDateString() : 'N/A' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </ThemedText>
            </View>
          )}
          <ThemedText type="subtitle" style={styles.userName}>
            {user?.name}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/(app)/edit-profile')}
          >
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Account Information
          </ThemedText>
          {profileItems.map((item, idx) => (
            <View key={idx} style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <ThemedText style={styles.infoIcon}>{item.icon}</ThemedText>
                <View>
                  <ThemedText style={styles.infoLabel}>{item.label}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                    {item.value}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <ThemedText style={styles.settingIcon}>🔔</ThemedText>
              <ThemedText type="defaultSemiBold">Notifications</ThemedText>
            </View>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <ThemedText style={styles.settingIcon}>🎨</ThemedText>
              <ThemedText type="defaultSemiBold">Appearance</ThemedText>
            </View>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <ThemedText style={styles.settingIcon}>💳</ThemedText>
              <ThemedText type="defaultSemiBold">Categories</ThemedText>
            </View>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <ThemedText style={styles.settingIcon}>ℹ️</ThemedText>
              <ThemedText type="defaultSemiBold">About</ThemedText>
            </View>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Daily Track App v1.0.0</ThemedText>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.6,
  },
  editButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingArrow: {
    fontSize: 24,
    opacity: 0.3,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
  },
});
