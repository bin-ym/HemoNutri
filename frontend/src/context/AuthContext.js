import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    console.log('AuthContext: Checking stored auth', { token, role, userId });
    if (token && role && userId) {
      api
        .get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser({ ...response.data, token, role, userId });
          console.log('AuthContext: User set from profile:', response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('AuthContext: Profile fetch error:', err.response?.data || err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    console.log('AuthContext login called with:', identifier);
    const response = await api.post('/auth/login', { identifier, password });
    console.log('AuthContext login response:', response.data);
    const { token, role, userId, isFirstLogin, isTempPassword, resetToken, needsProviderSelection, providers } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    setUser({ token, role, userId, isFirstLogin, isTempPassword, resetToken, needsProviderSelection, providers });
    console.log('AuthContext: User set after login:', { token, role, userId, isFirstLogin, isTempPassword, resetToken, needsProviderSelection, providers });
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);