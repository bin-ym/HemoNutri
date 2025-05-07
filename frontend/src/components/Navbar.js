import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MessageSquare, Bell, LogOut, Database } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ role, unreadCount, totalMessages }) => {
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
        // The api.js interceptor will handle 401 errors and redirect to login
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
      if (!payload.title || !payload.message) throw new Error('Title and message are required');
      await api.post('/admin/notifications', payload);
      setNotificationForm({ title: '', message: '', recipientType: 'all', recipientIds: [] });
      setShowForm(false);
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Send notification error:', err.response?.data || err.message);
      alert(err.response?.data?.error || err.message || 'Failed to send notification');
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

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 transition-all duration-300 transform shadow-lg bg-gradient-to-r from-teal-600 to-teal-800">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <h1
          className="text-3xl font-extrabold tracking-tight text-white transition-colors duration-300 cursor-pointer hover:text-teal-200 animate-fade-in"
          onClick={() => navigate(role === 'patient' ? '/dashboard' : role === 'provider' ? '/provider' : '/')}
        >
          HemoNutri
        </h1>
        <div className="flex items-center space-x-4">
          {!role && (
            <>
              <NavButton label="Home" icon="🏠" path="/" />
              <NavButton label="About" icon="ℹ️" path="/about" />
              <NavButton label="Contact" icon="📞" path="/contact" />
              <NavButton label="Login" icon="🔑" path="/login" highlight />
            </>
          )}
          {role === 'patient' && (
            <>
              <NavButton label="Dashboard" icon="📊" path="/dashboard" />
              <NavButton label="Food Logs" icon="🍽️" path="/food-logs" />
              <NavButton label="Meal Plan" icon="📋" path="/meal-plan" />
              <NavButtonWithBadge
                label="Messages"
                icon={<MessageSquare className="w-4 h-4" />}
                path="/messages"
                badge={newMessages}
              />
              <NavButton label="Education" icon="📚" path="/education" />
            </>
          )}
          {role === 'provider' && (
            <>
              <NavButton label="Dashboard" icon="📊" path="/provider" />
              <NavButton label="Patients" icon="👥" path="/provider/patients" />
              <NavButtonWithBadge
                label="Messages"
                icon={<MessageSquare className="w-4 h-4" />}
                path="/provider/messages"
                badge={newMessages}
              />
              <NavButton label="Education" icon="📚" path="/provider/education" />
            </>
          )}
          {role === 'admin' && (
            <>
              <NavButton label="Dashboard" icon="📊" path="/admin" />
              <NavButton label="Users" icon="👥" path="/admin/users" />
              <NavButton label="Resources" icon="📚" path="/admin/resources" />
              <NavButton label="Reports" icon="📈" path="/admin/report" />
              <NavButton label="Backup" icon={<Database className="w-4 h-4" />} path="/admin/backup" />
              <div className="relative">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-teal-700 rounded-lg hover:bg-teal-900 hover:scale-105"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify
                </button>
                {showForm && (
                  <div className="absolute right-0 p-4 mt-2 text-black bg-white border border-teal-200 shadow-2xl w-80 rounded-xl animate-slide-down">
                    <h3 className="mb-3 text-lg font-semibold text-teal-700">Send Notification</h3>
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={notificationForm.title}
                          onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                          placeholder="Notification Title"
                          className="w-full p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                          placeholder="Your message here..."
                          className="w-full p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Send To</label>
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
                          <option value="all">All Users</option>
                          <option value="patients">All Patients</option>
                          <option value="providers">All Providers</option>
                          <option value="specific">Specific Users</option>
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
                                {user.username} ({user.role})
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
                          Send
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="flex-1 p-2 text-white transition-all duration-300 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
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
              Logout
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