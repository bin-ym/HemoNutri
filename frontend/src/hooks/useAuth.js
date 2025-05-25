import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useAuth = (requiredRole) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      // No token or role → just clear and return silently
      if (!token || !role) {
        localStorage.clear();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        if (requiredRole && role !== requiredRole) {
          throw new Error('Unauthorized role');
        }

        // Validate token with backend
        await api.get('/auth/verify');
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session validation error:', err.message);
        localStorage.clear();
        setIsAuthenticated(false);

        // Only redirect if user had a valid session attempt
        const message =
          err.message === 'Unauthorized role'
            ? 'Unauthorized access.'
            : 'Session expired. Please log in again.';

        navigate('/login', { state: { message } });
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [navigate, requiredRole]);

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login', { state: { message: 'You have been logged out.' } });
  };

  return { isAuthenticated, isLoading, logout };
};

export default useAuth;
