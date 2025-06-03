import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import api from '../api/api';
import { storeAuthData, clearAuthData, getAuthData } from '../utils/auth';
import { useColors } from '../theme/ThemeContext';
import type { LoginCredentials, AuthResponse } from '../types/auth';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ResetPassword: { token: string };
  SelectProvider: { providers: any[]; userId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = await getAuthData();
        if (authData.token && authData.role) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Tabs', params: { role: authData.role } }],
            })
          );
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, [navigation]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Validation Error', 'Please enter both username/email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) && identifier.length < 3) {
      Alert.alert('Validation Error', 'Invalid email or username.');
      return;
    }

    setLoading(true);
    try {
      const credentials: LoginCredentials = { identifier, password };
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { token, role, userId, isFirstLogin, error, message } = response.data;

      if (error) {
        throw new Error(message || 'Login failed');
      }

      if (!userId) {
        throw new Error('User ID is missing in the response');
      }

      await storeAuthData(token, role, userId);

      if (isFirstLogin) {
        navigation.navigate('ResetPassword', { token });
        return;
      }

      if (response.data.needsProviderSelection) {
        navigation.navigate('SelectProvider', { providers: response.data.providers, userId });
        return;
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', params: { role } }],
        })
      );
    } catch (error: any) {
      const errorMessage =
        error.message === 'Network Error'
          ? 'Unable to connect to the server. Please check your network.'
          : error.response?.data?.message || error.message || 'Login failed.';
      Alert.alert('Login Failed', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: handleLogin },
      ]);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = identifier.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Login</Text>
      <View style={styles.inputContainer}>
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
        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          accessibilityLabel="Password input"
          editable={!loading}
        />
        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        color={colors.primary}
        disabled={loading || !isFormValid}
        accessibilityLabel="Login button"
      />
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword', { token: '' })}>
        <Text style={[styles.forgotPassword, { color: colors.primary }]}>Forgot Password?</Text>
      </TouchableOpacity>
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
  inputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    paddingLeft: 40,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  forgotPassword: {
    marginTop: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default LoginScreen;