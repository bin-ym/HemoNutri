import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending:', { identifier, password });
      const res = await api.post('/auth/login', { identifier, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role || 'patient');
      if (res.data.isFirstLogin) {
        navigate('/change-password');
      } else {
        const role = res.data.role || 'patient';
        if (role === 'provider') navigate('/provider');
        else if (role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.error || 'Server error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or Username"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        <p className="text-center">
          No account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;