import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

type RootStackParamList = {
  OTP: { email: string };
  PatientScreen: undefined;
  ProviderScreen: undefined;
  AdminScreen: undefined;
  Signup: undefined;
  PasswordReset: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const { colors } = useColors();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      setLoading(false);

      // Navigate based on user role
      switch (user.role) {
        case 'patient':
          navigation.navigate('PatientScreen');
          break;
        case 'provider':
          navigation.navigate('ProviderScreen');
          break;
        case 'admin':
          navigation.navigate('AdminScreen');
          break;
        default:
          Alert.alert('Error', 'Unknown user role');
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Login</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        color={colors.primary}
        disabled={loading}
      />
      <View style={styles.links}>
        <Button
          title="Sign Up"
          onPress={() => navigation.navigate('Signup')}
          color={colors.textSecondary}
        />
        <Button
          title="Forgot Password?"
          onPress={() => navigation.navigate('PasswordReset')}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default LoginScreen;