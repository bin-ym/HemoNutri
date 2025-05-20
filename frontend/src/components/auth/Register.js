import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const Register = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, password, role });
      navigate('/login');
    } catch (err) {
      setError(t(err.response?.data?.error || 'registration_failed'));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('enter_email')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('enter_password')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('role')}</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="patient">{t('patient')}</option>
            <option value="provider">{t('provider')}</option>
          </select>
        </div>
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full p-2 text-white transition duration-300 bg-teal-500 rounded hover:bg-teal-600"
        >
          {t('register')}
        </button>
      </form>
      <div className="text-center">
        <button
          onClick={() => navigate('/login')}
          className="w-full p-2 text-teal-600 transition duration-300 bg-teal-100 rounded hover:bg-teal-200"
        >
          {t('already_have_account')}
        </button>
      </div>
    </div>
  );
};

export default Register;