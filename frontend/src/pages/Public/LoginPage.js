import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect messages (e.g., from ProtectedRoute)
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      // Clear the state after displaying
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', {
        identifier: email.trim(),
        password,
      });
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.userId || res.data.id); // Add userId if provided by API
      if (res.data.role === 'provider') {
        navigate('/provider');
      } else if (res.data.role === 'patient') {
        navigate('/dashboard');
      } else if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Unsupported role');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-md p-8 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:shadow-3xl animate-fade-in">
          {/* Header */}
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-teal-700">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your health journey
            </p>
            <LogIn className="absolute top-0 right-0 w-8 h-8 text-teal-500 animate-pulse" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 mb-6 space-x-2 text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
              <AlertCircle className="flex-shrink-0 w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Input */}
            <div className="relative group">
              <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-teal-600">
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter email or username"
                required
              />
              <Mail className="absolute w-5 h-5 text-teal-400 transition-colors left-3 top-10 group-hover:text-teal-600" />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-teal-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
              <Lock className="absolute w-5 h-5 text-teal-400 transition-colors left-3 top-10 group-hover:text-teal-600" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex items-center justify-center w-full p-3 space-x-2 text-white transition-all duration-300 transform bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-semibold">Login</span>
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 space-y-4 text-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full p-3 text-teal-700 transition-all duration-300 bg-teal-100 rounded-lg shadow-md hover:bg-teal-200 hover:text-teal-800 hover:scale-105"
            >
              Create an Account
            </button>
            <p>
              <a
                href="/forgot-password"
                className="text-sm text-teal-500 transition-colors duration-200 hover:text-teal-700 hover:underline"
              >
                Forgot Password?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 