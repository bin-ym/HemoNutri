import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAuthData = async (token: string, role: string, userId: string) => {
  try {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('role', role);
    await AsyncStorage.setItem('userId', userId);
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('userId');
    console.log('Auth data cleared successfully'); // Debug log
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role');
    const userId = await AsyncStorage.getItem('userId');
    return { token, role, userId };
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    return { token: null, role: null, userId: null };
  }
};  