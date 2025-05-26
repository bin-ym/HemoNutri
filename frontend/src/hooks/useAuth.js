import { useState, useEffect } from 'react';
import api from '../services/api';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateSession = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    console.log('useAuth: Validating session', { tokenExists: !!token, role, userId });

    if (!token || !role || !userId) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get('auth/profile');
      console.log('useAuth: Profile fetched', response.data);
      const userData = {
        ...response.data,
        token,
        role: response.data.role || role,
        userId,
      };
      setUser(userData);
      localStorage.setItem('role', userData.role); // Sync role
      return userData;
    } catch (err) {
      console.error('useAuth: Profile fetch failed', err.message);
      if (err.response?.status === 404 || err.response?.status === 401) {
        console.log('useAuth: Using localStorage data');
        setUser({
          email: 'unknown',
          role,
          userId,
          token,
        });
      } else {
        setUser(null);
      }
      throw err;
    } finally {
      setLoading(false);
      console.log('useAuth: Loading set to false');
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get('auth/verify');
        console.log('useAuth: Token verified');
        await validateSession();
      } catch (err) {
        console.error('useAuth: Token verification failed', err.message);
        setUser(null);
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  return { user, loading, validateSession };
};

export default useAuth;