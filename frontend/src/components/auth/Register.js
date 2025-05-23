import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default role
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    if (score <= 2) {
      return { score: score * 20, label: t("weak"), color: "bg-red-500" };
    } else if (score <= 4) {
      return { score: score * 20, label: t("medium"), color: "bg-yellow-500" };
    } else {
      return { score: 100, label: t("strong"), color: "bg-green-500" };
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.firstName) newErrors.firstName = t('first_name_required');
    if (!formData.lastName) newErrors.lastName = t('last_name_required');
    if (!formData.email) {
      newErrors.email = t('email_required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = t('password_requirements');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_must_match');
    }
    if (!formData.role) newErrors.role = t('role_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage('');
    if (!validateForm()) return;

    console.log('Sending registration data:', formData);
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setApiMessage(response.data.message || t('registration_success'));
      setTimeout(() => {
        navigate('/activate', { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setErrors({ api: t(err.response?.data?.error || 'registration_failed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  return (
    <div className="space-y-6">
      {apiMessage && (
        <div className="p-4 text-green-700 bg-green-100 rounded-lg" role="alert">
          <span>{apiMessage}</span>
        </div>
      )}
      {errors.api && (
        <div className="p-4 text-red-700 bg-red-100 rounded-lg" role="alert">
          <span>{errors.api}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {t('first_name')}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={t('enter_first_name')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1 text-sm text-red-500">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            {t('last_name')}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={t('enter_last_name')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1 text-sm text-red-500">
              {errors.lastName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('enter_email')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isLoading}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t('password')}
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder={t('enter_password')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-blue-400 hover:text-blue-600"
            aria-label={showPassword ? t('hide_passwords') : t('show_passwords')}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <div className="text-sm text-blue-600 mt-1">
            {t('password_requirements')}
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="text-sm font-medium text-gray-700">
                {t('password_strength')}: <span className={`text-${passwordStrength.color.replace('bg-', '')}`}>{passwordStrength.label}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.score}%` }}
                ></div>
              </div>
            </div>
          )}
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-500">
              {errors.password}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t('confirm_password')}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('confirm_password')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            {t('role')}
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.role ? 'true' : 'false'}
            aria-describedby={errors.role ? 'role-error' : undefined}
            disabled={isLoading}
          >
            <option value="patient">{t('patient')}</option>
            <option value="provider">{t('provider')}</option>
            <option value="admin">{t('admin')}</option>
          </select>
          {errors.role && (
            <p id="role-error" className="mt-1 text-sm text-red-500">
              {errors.role}
            </p>
          )}
        </div>
        <button
          type="submit"
          className={`w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? t('registering') : t('register')}
        </button>
      </form>
      <div className="text-center">
        <button
          onClick={() => navigate('/login')}
          className="w-full p-3 text-blue-600 transition duration-300 rounded-lg bg-blue-100 hover:bg-blue-200"
          disabled={isLoading}
        >
          {t('already_have_account')}
        </button>
      </div>
    </div>
  );
};

export default Register;