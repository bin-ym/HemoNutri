import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MessageSquare, Bell, LogOut, Database, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Navbar = ({ role, unreadCount, totalMessages }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [newMessages, setNewMessages] = useState(totalMessages || 0);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipientType: 'all',
    recipientIds: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        if (role === 'admin') {
          const res = await api.get('/admin/users');
          setUsers(res.data.filter((user) => user.role !== 'admin'));
        }

        if (role === 'patient' || role === 'provider') {
          const endpoint = role === 'patient' ? '/patient/messages' : '/provider/messages';
          const res = await api.get(endpoint);
          const userId = localStorage.getItem('userId');
          const receivedMessages = res.data.filter(
            (msg) => msg.recipient?._id === userId
          );
          setNewMessages(receivedMessages.length);
        }
      } catch (err) {
        console.error('Fetch data error:', err.response?.data || err.message);
      }
    };

    if (isAuthenticated && !totalMessages) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    } else if (totalMessages) {
      setNewMessages(totalMessages);
    }
  }, [role, isAuthenticated, totalMessages]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        recipientType: notificationForm.recipientType,
        recipientIds: notificationForm.recipientType === 'specific' ? notificationForm.recipientIds : [],
      };
      if (!payload.title || !payload.message) throw new Error(t('error_title_message_required'));
      await api.post('/admin/notifications', payload);
      setNotificationForm({ title: '', message: '', recipientType: 'all', recipientIds: [] });
      setShowForm(false);
      alert(t('notification_sent_success'));
    } catch (err) {
      console.error('Send notification error:', err.response?.data || err.message);
      alert(err.response?.data?.error || err.message || t('error_notification_failed'));
    }
  };

  const toggleRecipient = (userId) => {
    setNotificationForm((prev) => {
      const recipientIds = prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter((id) => id !== userId)
        : [...prev.recipientIds, userId];
      return { ...prev, recipientIds };
    });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLanguageDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 transition-all duration-300 transform shadow-lg bg-gradient-to-r from-teal-600 to-teal-800">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <h1
          className="text-3xl font-extrabold tracking-tight text-white transition-colors duration-300 cursor-pointer hover:text-teal-200 animate-fade-in"
          onClick={() => navigate(role === 'patient' ? '/dashboard' : role === 'provider' ? '/provider' : '/')}
        >
          {t('app_name')}
        </h1>
        <div className="flex items-center space-x-4">
          {!role && (
            <>
              <NavButton label={t('home')} icon="🏠" path="/" />
              <NavButton label={t('about')} icon="ℹ️" path="/about" />
              <NavButton label={t('contact')} icon="📞" path="/contact" />
              <NavButton label={t('login')} icon="🔑" path="/login" highlight />
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-900 hover:scale-105"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('language')}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-teal-200 shadow-2xl rounded-xl animate-slide-down">
                    <button
                      onClick={() => changeLanguage('en')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage('am')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage('om')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role === 'patient' && (
            <>
              <NavButton label={t('dashboard')} icon="📊" path="/dashboard" />
              <NavButton label={t('food_logs')} icon="🍽️" path="/food-logs" />
              <NavButton label={t('meal_plan')} icon="📋" path="/meal-plan" />
              <NavButtonWithBadge
                label={t('messages')}
                icon={<MessageSquare className="w-4 h-4" />}
                path="/messages"
                badge={newMessages}
              />
              <NavButton label={t('education')} icon="📚" path="/education" />
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-900 hover:scale-105"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('language')}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-teal-200 shadow-2xl rounded-xl animate-slide-down">
                    <button
                      onClick={() => changeLanguage('en')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage('am')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage('om')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role === 'provider' && (
            <>
              <NavButton label={t('dashboard')} icon="📊" path="/provider" />
              <NavButton label={t('patients')} icon="👥" path="/provider/patients" />
              <NavButtonWithBadge
                label={t('messages')}
                icon={<MessageSquare className="w-4 h-4" />}
                path="/provider/messages"
                badge={newMessages}
              />
              <NavButton label={t('education')} icon="📚" path="/provider/education" />
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-900 hover:scale-105"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('language')}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-teal-200 shadow-2xl rounded-xl animate-slide-down">
                    <button
                      onClick={() => changeLanguage('en')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage('am')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage('om')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role === 'admin' && (
            <>
              <NavButton label={t('dashboard')} icon="📊" path="/admin" />
              <NavButton label={t('users')} icon="👥" path="/admin/users" />
              <NavButton label={t('resources')} icon="📚" path="/admin/resources" />
              <NavButton label={t('reports')} icon="📈" path="/admin/report" />
              <NavButton label={t('backup')} icon={<Database className="w-4 h-4" />} path="/admin/backup" />
              <div className="relative">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg hover:bg-teal-900 hover:scale-105"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {t('notify')}
                </button>
                {showForm && (
                  <div className="absolute right-0 p-4 mt-2 text-black bg-white border border-teal-200 shadow-2xl w-80 rounded-xl animate-slide-down">
                    <h3 className="mb-3 text-lg font-semibold text-teal-700">{t('send_notification')}</h3>
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('title')}</label>
                        <input
                          type="text"
                          value={notificationForm.title}
                          onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                          placeholder={t('notification_title_placeholder')}
                          className="w-full p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('message')}</label>
                        <textarea
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                          placeholder={t('message_placeholder')}
                          className="w-full p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('send_to')}</label>
                        <select
                          value={notificationForm.recipientType}
                          onChange={(e) =>
                            setNotificationForm({
                              ...notificationForm,
                              recipientType: e.target.value,
                              recipientIds: e.target.value !== 'specific' ? [] : notificationForm.recipientIds,
                            })
                          }
                          className="w-full p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="all">{t('all_users')}</option>
                          <option value="patients">{t('all_patients')}</option>
                          <option value="providers">{t('all_providers')}</option>
                          <option value="specific">{t('specific_users')}</option>
                        </select>
                      </div>
                      {notificationForm.recipientType === 'specific' && (
                        <div className="p-2 overflow-y-auto border border-teal-100 rounded max-h-24 bg-teal-50">
                          {users.map((user) => (
                            <div key={user._id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={notificationForm.recipientIds.includes(user._id)}
                                onChange={() => toggleRecipient(user._id)}
                                className="w-4 h-4 mr-2 text-teal-600 border-teal-300 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">
                                {user.username} ({t(user.role)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="flex-1 p-2 text-white transition-all duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105"
                        >
                          {t('send')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="flex-1 p-2 text-white transition-all duration-300 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-900 hover:scale-105"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('language')}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-teal-200 shadow-2xl rounded-xl animate-slide-down">
                    <button
                      onClick={() => changeLanguage('en')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage('am')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage('om')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-teal-100 hover:text-teal-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role && (
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-semibold text-white transition-all duration-300 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ label, icon, path, highlight = false }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center px-4 py-2 text-sm font-medium text-white ${
        highlight ? 'bg-teal-800' : 'bg-teal-700'
      } rounded-lg shadow-md hover:bg-teal-900 transition-all duration-300 hover:scale-105`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
};

const NavButtonWithBadge = ({ label, icon, path, badge }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="relative flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-900 hover:scale-105"
    >
      <span className="flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </span>
      {badge > 0 && (
        <span className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md -top-2 -right-2 animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
};

export default Navbar;