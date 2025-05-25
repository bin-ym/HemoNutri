import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (retry = true) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    console.log('AuthContext: Refreshing user', { token: token?.slice(0, 10) + '...', role, userId });

    if (!token || !role || !userId) {
      console.log('AuthContext: Missing auth data');
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      console.log('AuthContext: Starting /auth/profile fetch');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5s
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('AuthContext: /auth/profile fetch completed', {
        headers: Object.fromEntries(response.headers?.entries?.() || []),
        status: response.status,
      });

      const userData = {
        ...response.data,
        token,
        role,
        userId,
      };
      setUser(userData);
      console.log('AuthContext: User refreshed:', { email: userData.email, role: userData.role });
      return userData;
    } catch (err) {
      console.error('AuthContext: Refresh error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      if (err.name === 'AbortError') {
        console.log('AuthContext: Fetch canceled due to timeout');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        setUser(null);
        throw new Error('request_canceled');
      }

      if (err.response?.status === 401) {
        console.log('AuthContext: 401, handling error', { error: err.response.data.error });
        if (retry && err.response.data.error !== 'token_expired') {
          console.log('AuthContext: Retrying once');
          return refreshUser(false);
        }
        console.log('AuthContext: Clearing auth due to 401');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        setUser(null);
      }

      throw err;
    } finally {
      setLoading(false);
      console.log('AuthContext: Loading set to false');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        if (isMounted) {
          await refreshUser();
        }
      } catch (err) {
        if (isMounted) {
          console.log('AuthContext: Initial refresh failed', err.message);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      controller.abort();
      console.log('AuthContext: Cleanup useEffect');
    };
  }, []);

  const login = async (identifier, password) => {
    console.log('AuthContext login called with:', identifier);
    const response = await api.post('/auth/login', { identifier, password });
    console.log('AuthContext login response:', response.data);
    const { token, role, userId, isFirstLogin, isTempPassword, resetToken, needsProviderSelection, providers } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    const userData = {
      token,
      role,
      userId,
      isFirstLogin,
      isTempPassword,
      resetToken,
      needsProviderSelection,
      providers,
    };
    setUser(userData);
    console.log('AuthContext: User set after login:', userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
    console.log('AuthContext: User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);