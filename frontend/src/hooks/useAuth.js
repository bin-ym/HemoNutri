import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useAuth = (requiredRole) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || !role) {
          throw new Error('No token or role found');
        }

        if (requiredRole && role !== requiredRole) {
          throw new Error('Unauthorized role');
        }

        // Validate token with the backend
        await api.get('/auth/verify'); // Assumes you have a verify endpoint
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session validation error:', err.message);
        localStorage.clear();
        setIsAuthenticated(false);
        navigate('/login', { state: { message: err.message === 'Unauthorized role' ? 'Unauthorized access.' : 'Session expired. Please log in again.' } });
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