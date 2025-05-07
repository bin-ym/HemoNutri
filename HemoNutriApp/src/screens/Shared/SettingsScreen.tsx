import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { clearAuthData, getAuthData } from '../../utils/auth';
import { useColors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import api from '../../api/api';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState<{ username: string; role: string } | null>(null);
  const [editedUsername, setEditedUsername] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [language, setLanguage] = useState('English'); // Placeholder
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchingUser(true);
        const authData = await getAuthData();

        // Check if authData is null or undefined
        if (authData) {
          // Try different fields to get the provider's name
          const displayName = authData.username || authData.name || authData.displayName || 'Provider';
          setUserData({
            username: displayName,
            role: authData.role || 'Unknown',
          });
          setEditedUsername(displayName);
        } else {
          // Handle the case where authData is null (e.g., user not logged in)
          setUserData({ username: 'Provider', role: 'Unknown' });
          setEditedUsername('Provider');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserData({ username: 'Provider', role: 'Unknown' });
        setEditedUsername('Provider');
      } finally {
        setFetchingUser(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    if (!editedUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }

    try {
      setProfileSaving(true);
      // Assuming there's an API endpoint to update the username
      await api.put('/api/user/update-profile', { username: editedUsername });
      setUserData((prev) => prev ? { ...prev, username: editedUsername } : prev);
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await clearAuthData();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (fetchingUser) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.header, { backgroundColor: colors.background === '#f5f5f5' ? '#fff' : '#2E3A3B' }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your preferences</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.background === '#f5f5f5' ? '#fff' : '#2E3A3B' }]}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={60} color={colors.primary} />
        </View>
        {isEditingProfile ? (
          <>
            <TextInput
              style={[styles.profileInput, { color: colors.textPrimary, borderColor: colors.secondary }]}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Enter your username"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.profileButtonContainer}>
              <TouchableOpacity
                style={[styles.profileButton, { backgroundColor: colors.primary }, profileSaving && styles.profileButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={profileSaving}
                activeOpacity={0.8}
              >
                {profileSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.profileButtonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileButton, { backgroundColor: colors.danger }]}
                onPress={() => {
                  setEditedUsername(userData?.username || 'Provider');
                  setIsEditingProfile(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.profileButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userData?.username || 'Provider'}</Text>
            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>{userData?.role || 'Unknown'}</Text>
            <TouchableOpacity
              style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditingProfile(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil-outline" size={16} color="#fff" style={styles.editProfileIcon} />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Preferences</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.background === '#f5f5f5' ? '#fff' : '#2E3A3B' }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.background === '#f5f5f5' ? '#fff' : '#2E3A3B' }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Email Notifications</Text>
          </View>
          <Switch
            value={emailNotificationsEnabled}
            onValueChange={setEmailNotificationsEnabled}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={emailNotificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.background === '#f5f5f5' ? '#fff' : '#2E3A3B' }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Dark Mode</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={theme === 'dark' ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.background === '#f5f5f5' ? '#fff' : '#2E3A3B' }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="language-outline" size={24} color={colors.textPrimary} style={styles.settingIcon} />
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Language</Text>
          </View>
          <View style={styles.languageContainer}>
            <Text style={[styles.languageText, { color: colors.textSecondary }]}>{language}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.danger }, loading && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIconContainer: {
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 14,
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editProfileIcon: {
    marginRight: 8,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: '80%',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  profileButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    gap: 10,
  },
  profileButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonDisabled: {
    opacity: 0.7,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    marginRight: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;