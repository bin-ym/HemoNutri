import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import api from '../api/api';
import { storeAuthData, clearAuthData, getAuthData } from '../utils/auth';
import { useColors } from '../theme/ThemeContext';
import type { LoginCredentials, AuthResponse } from '../types/auth';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Validation Error', 'Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const credentials: LoginCredentials = { identifier, password };
      console.log('Sending login request with credentials:', credentials);
      console.log('API base URL:', api.defaults.baseURL);
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { token, role, userId, isFirstLogin, error, message } = response.data;
      console.log('Login response:', { token, role, userId, isFirstLogin });

      if (error) {
        throw new Error(message || 'Login failed');
      }

      if (!userId) {
        throw new Error('User ID is missing in the response');
      }

      await storeAuthData(token, role, userId);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', params: { role } }],
        })
      );
    } catch (error: any) {
      console.error('Login error:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      const errorMessage =
        error.message === 'Network Error'
          ? 'Unable to connect to the server. Please check your network or try again later.'
          : error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      Alert.alert('Login Failed', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => handleLogin() },
      ]);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
  try {
    const authData = await getAuthData();
    if (!authData.token) {
      navigation.navigate('Login');
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    navigation.navigate('Login');
  }
};

  const isFormValid = identifier.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Login</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
        placeholder="Username or Email"
        placeholderTextColor={colors.textSecondary}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Username or Email input"
        editable={!loading}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        accessibilityLabel="Password input"
        editable={!loading}
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        color={colors.primary}
        disabled={loading || !isFormValid}
        accessibilityLabel="Login button"
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

export default LoginScreen;