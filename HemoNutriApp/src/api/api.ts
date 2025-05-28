import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { getAuthData } from '../utils/auth'; // Double-check this path

// Dynamically set baseURL based on platform and environment
const getBaseURL = (): string => {
  if (Platform.OS === 'android') {
    return __DEV__ ? 'http://192.168.122.1:5000' : 'http://192.168.122.245:5000';
  } else if (Platform.OS === 'ios') {
    return __DEV__ ? 'http://localhost:5000' : 'http://192.168.1.4:5000';
  } else {
    return 'http://localhost:5000';
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const authData = await getAuthData(); // Ensure this is a function call
      if (authData.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
    } catch (error) {
      console.error('Failed to get auth data in request interceptor:', error);
    }
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(
      `[${new Date().toISOString()}] API Request: ${config.method?.toUpperCase() || 'UNKNOWN'} ${fullUrl}`
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
      } - Status: ${response.status} - Data: ${JSON.stringify(response.data)}`
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
      console.log('Full Base URL:', api.defaults.baseURL);
      console.log('Requested URL:', error.request.responseURL || error.config.url);
      console.log('Platform:', Platform.OS);
      console.log('Development Mode:', __DEV__);
    }
    return Promise.reject(error);
  }
);

export default api;