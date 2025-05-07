import { useTheme } from './ThemeContext';

// Base color palette (can be used as a fallback or for specific components)
export const colors = {
  primary: '#0D9488', // Matches bg-teal-600, text-teal-600
  secondary: '#2DD4BF', // Matches text-teal-400 for secondary text
  accent: '#5B9BD5', // Kept as is for future use
  background: '#F3F4F6', // Matches bg-gray-100
  surface: '#F3F4F6', // Matches bg-gray-100 for cards
  error: '#FF0000',
  danger: '#FF6B6B',
  textPrimary: '#111827', // Matches text-gray-900 for feature titles
  text: '#1A3C5A', // Kept as is for general text
  textSecondary: '#2DD4BF', // Matches text-teal-400
  textDescription: '#4B5563', // Matches text-gray-600 for descriptions
};


const lightColors = {
  background: '#f5f5f5',
  textPrimary: '#333',
  textSecondary: '#666',
  primary: '#007AFF',
  secondary: '#E5E5EA',
  danger: '#FF3B30',
};

const darkColors = {
  background: '#1C2526',
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  primary: '#40C4FF',
  secondary: '#37474F',
  danger: '#FF6E40',
};

// Type definition for colors to ensure type safety
export type Colors = typeof colors & typeof lightColors & typeof darkColors;

export const useColors = (): typeof lightColors | typeof darkColors => {
  const { theme } = useTheme();
  return theme === 'light' ? lightColors : darkColors;
};