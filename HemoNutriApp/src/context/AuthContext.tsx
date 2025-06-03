import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import api from '../api/api';
import { storeAuthData, clearAuthData, getAuthData } from '../utils/auth';
import type { LoginCredentials, AuthResponse } from '../types/auth';

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authData = await getAuthData();
        if (authData.token && authData.role && authData.userId) {
          setToken(authData.token);
          setRole(authData.role);
          setUserId(authData.userId);
          setIsAuthenticated(true);
          api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
        }
      } catch (error) {
        console.error('Auth init failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, password: string): Promise<AuthResponse> => {
    try {
      const credentials: LoginCredentials = { identifier, password };
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { token, role, userId, error, message } = response.data;

      if (error) {
        throw new Error(message || 'Login failed');
      }

      await storeAuthData(token, role, userId);
      setToken(token);
      setRole(role);
      setUserId(userId);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
      setToken(null);
      setRole(null);
      setUserId(null);
      setIsAuthenticated(false);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};