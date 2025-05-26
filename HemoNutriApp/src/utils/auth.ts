import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthData {
  token: string | null;
  role: string | null;
  userId: string | null;
}

export const storeAuthData = async (token: string, role: string, userId: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      ['token', token],
      ['role', role],
      ['userId', userId],
    ]);
    console.log('Auth data stored successfully:', { token, role, userId });
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw new Error(`Failed to store auth data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['token', 'role', 'userId']);
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw new Error(`Failed to clear auth data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getAuthData = async (): Promise<AuthData> => {
  try {
    const [token, role, userId] = await AsyncStorage.multiGet(['token', 'role', 'userId']);
    return {
      token: token ? token[1] : null,
      role: role ? role[1] : null,
      userId: userId ? userId[1] : null,
    };
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    throw new Error(`Failed to retrieve auth data: ${error instanceof Error ? error.message : String(error)}`);
  }
};