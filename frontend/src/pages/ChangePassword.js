import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await api.post('/auth/change-password', { password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = localStorage.getItem('role');
      if (role === 'provider') navigate('/provider');
      else if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Change password error:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
      <p className="text-center mb-4">Please set a new password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;