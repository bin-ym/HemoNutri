import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import api from '../api/api';
import { storeAuthData, clearAuthData } from '../utils/auth';
import { colors } from '../theme/colors';
import type { LoginCredentials, AuthResponse } from '../types/auth';

// Define the navigation stack param list
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

      // Reset the navigation stack to 'Tabs' and pass the role
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
        { text: 'Retry', onPress: handleLogin },
      ]);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        color={colors.primary}
        disabled={loading}
      />
      {loading && (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: colors.textPrimary,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default LoginScreen;