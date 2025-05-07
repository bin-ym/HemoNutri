import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Dynamically set baseURL based on platform
const getBaseURL = (): string => {
  if (Platform.OS === 'android') {
    // Physical Android device (Expo in development or production)
    return 'http://192.168.1.3:5000'; // Use your PC's LAN IP
  } else if (Platform.OS === 'ios') {
    // Physical iOS device (Expo in development or production)
    return 'http://192.168.1.3:5000'; // Use your PC's LAN IP
  } else {
    // Default (e.g., running on simulator or other environment)
    return 'http://localhost:5000';
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `[${new Date().toISOString()}] API Request: ${config.method?.toUpperCase() || 'UNKNOWN'} ${config.url}`
    );
    console.log('Request Headers:', config.headers);
    console.log('Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(
      `[${new Date().toISOString()}] API Response: ${response.config.method?.toUpperCase() || 'UNKNOWN'} ${
        response.config.url
      } - Status: ${response.status}`
    );
    return response;
  },
  async (error) => {
    console.error(`[${new Date().toISOString()}] API Error:`, error.message);
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
      if (error.response.status === 401 && error.response.data.error === 'Token expired') {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
        await AsyncStorage.removeItem('userId');
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
      }
    } else if (error.request) {
      console.log('No response received:', error.request);
      console.log('Error Details:', error.message);
      console.log('Base URL:', api.defaults.baseURL);
      console.log('Platform:', Platform.OS);
      console.log('Development Mode:', __DEV__);
    }
    return Promise.reject(error);
  }
);

export default api;