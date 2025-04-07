import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Display redirect message (e.g., from token expiration)
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', {
        identifier: email,
        password,
      });
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-teal-600">
            Login
          </h2>
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-teal-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50"
                placeholder="Enter email or username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-teal-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 text-white transition duration-300 bg-teal-600 rounded shadow-md hover:bg-teal-700"
            >
              Login
            </button>
          </form>
          <div className="mt-4 space-y-2 text-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full p-2 text-teal-600 transition duration-300 bg-teal-100 rounded hover:bg-teal-200"
            >
              Register
            </button>
            <p>
              <a
                href="/forgot-password"
                className="text-sm text-teal-500 hover:underline"
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