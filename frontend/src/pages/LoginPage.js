import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { identifier: email, password });
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
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role={null} />
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-600">Login</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter email or username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition duration-300"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-teal-100 text-teal-600 p-2 rounded hover:bg-teal-200 transition duration-300"
            >
              Register
            </button>
            <p>
              <a
                href="/forgot-password"
                className="text-teal-500 hover:underline text-sm"
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