import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}