import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      setMessage(res.data.message || 'A password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset request.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role={null} />
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-600">Forgot Password</h2>
          {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter email or username"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition duration-300"
            >
              Send Reset Link
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-teal-100 text-teal-600 p-2 rounded hover:bg-teal-200 transition duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;