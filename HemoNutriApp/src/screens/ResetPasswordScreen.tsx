import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { useColors } from '../theme/ThemeContext';
import { CommonActions } from '@react-navigation/native';

type RootStackParamList = {
  ResetPassword: { token: string };
  Tabs: { role: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const colors = useColors();
  const { token } = route.params;

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please enter both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: password });
      Alert.alert('Success', 'Password reset successfully.');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Password</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
        placeholder="New Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        accessibilityLabel="New Password input"
        editable={!loading}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
        placeholder="Confirm Password"
        placeholderTextColor={colors.textSecondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        accessibilityLabel="Confirm Password input"
        editable={!loading}
      />
      <Button
        title={loading ? 'Resetting...' : 'Reset Password'}
        onPress={handleResetPassword}
        color={colors.primary}
        disabled={loading}
        accessibilityLabel="Reset Password button"
      />
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loadingIndicator}
          accessibilityLabel="Loading indicator"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default ResetPasswordScreen;