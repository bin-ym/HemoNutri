import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setMessage('');
    setError('');
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage(res.data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2s
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-center text-teal-600">Reset Password</h2>
          {message && <p className="mb-4 text-center text-green-500">{message}</p>}
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 text-white transition duration-300 bg-teal-500 rounded hover:bg-teal-600"
            >
              Reset Password
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full p-2 text-teal-600 transition duration-300 bg-teal-100 rounded hover:bg-teal-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;