import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
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
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async () => {
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
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      Alert.alert('Login Failed', errorMessage);
      await clearAuthData();
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} color={colors.primary} />
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
});

export default LoginScreen;