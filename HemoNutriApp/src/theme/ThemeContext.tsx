import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

const baseColors = {
  primary: '#0D9488',
  secondary: '#2DD4BF',
  accent: '#5B9BD5',
  background: '#F3F4F6',
  surface: '#F3F4F6',
  error: '#FF0000',
  danger: '#FF6B6B',
  textPrimary: '#111827',
  text: '#1A3C5A',
  textSecondary: '#2DD4BF',
  textDescription: '#4B5563',
};

const lightColors = {
  ...baseColors,
  background: '#f5f5f5',
  textPrimary: '#333',
  textSecondary: '#666',
  primary: '#007AFF',
  secondary: '#E5E5EA',
  danger: '#FF3B30',
  warningBackground: '#fef2f2',
  errorBackground: '#ffe6e6',
  neutral: '#D1D5DB',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
  ...baseColors,
  background: '#1C2526',
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  primary: '#40C4FF',
  secondary: '#37474F',
  danger: '#FF6E40',
  warningBackground: '#3B2A2A',
  errorBackground: '#3B1A1A',
  neutral: '#4B5563',
  white: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export type Colors = typeof lightColors & typeof darkColors;

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isThemeLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        } else {
          const systemTheme = Appearance.getColorScheme();
          setTheme(systemTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (err) {
        console.error('Error loading theme:', err);
        setTheme('light');
      } finally {
        setIsThemeLoaded(true);
      }
    };

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!AsyncStorage.getItem('theme')) {
        setTheme(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });

    loadTheme();

    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  };

  if (!isThemeLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Loading theme...</Text>
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isThemeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useColors = (): Colors => {
  const { theme } = useTheme();
  return theme === 'light' ? lightColors : darkColors;
};