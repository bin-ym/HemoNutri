import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipientType: 'all',
    recipientIds: [],
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await api.get('/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data.filter((user) => user.role !== 'admin'));
        } catch (err) {
          console.error('Fetch users error:', err.response?.data || err.message);
        }
      };
      fetchUsers();
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: notificationForm.title,
        message: notificationForm.message,
        recipientType: notificationForm.recipientType,
        recipientIds: notificationForm.recipientType === 'specific' ? notificationForm.recipientIds : [],
      };
      await api.post('/admin/notifications', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationForm({ title: '', message: '', recipientType: 'all', recipientIds: [] });
      setShowForm(false);
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Send notification error:', err.response?.data || err.message);
      alert('Failed to send notification.');
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

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="bg-teal-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">HemoNutri</h1>
        <div className="space-x-6 flex items-center">
          {!role && (
            <>
              <button
                onClick={() => handleNavClick('/')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('/about')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('/contact')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Contact
              </button>
              <button
                onClick={() => handleNavClick('/login')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Login
              </button>
            </>
          )}
          {role === 'patient' && (
            <>
              <button
                onClick={() => handleNavClick('/dashboard')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('/dashboard#food-log')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Log Food & Fluid
              </button>
              <button
                onClick={() => handleNavClick('/dashboard#contact')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Contact Provider
              </button>
              <button
                onClick={() => handleNavClick('/dashboard#goals')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Goals & Rewards
              </button>
              <button
                onClick={() => handleNavClick('/education')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Education
              </button>
            </>
          )}
          {role === 'provider' && (
            <button
              onClick={() => handleNavClick('/provider')}
              className="hover:underline bg-transparent border-none text-white cursor-pointer"
            >
              Provider Dashboard
            </button>
          )}
          {role === 'admin' && (
            <>
              <button
                onClick={() => handleNavClick('/admin')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('/admin/users')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Users
              </button>
              <button
                onClick={() => handleNavClick('/admin/resources')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Resources
              </button>
              <button
                onClick={() => handleNavClick('/admin/report')}
                className="hover:underline bg-transparent border-none text-white cursor-pointer"
              >
                Reports
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="hover:underline bg-transparent border-none text-white cursor-pointer"
                >
                  📢 Send Notification
                </button>
                {showForm && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg p-4 z-10">
                    <h3 className="font-semibold mb-2">Send Notification</h3>
                    <form onSubmit={handleSendNotification} className="space-y-2">
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) =>
                          setNotificationForm({ ...notificationForm, title: e.target.value })
                        }
                        placeholder="Title"
                        className="w-full p-1 border rounded text-black"
                      />
                      <textarea
                        value={notificationForm.message}
                        onChange={(e) =>
                          setNotificationForm({ ...notificationForm, message: e.target.value })
                        }
                        placeholder="Message"
                        className="w-full p-1 border rounded text-black"
                      />
                      <div className="max-h-24 overflow-y-auto">
                        <label className="block text-sm">Send To:</label>
                        <select
                          value={notificationForm.recipientType}
                          onChange={(e) =>
                            setNotificationForm({
                              ...notificationForm,
                              recipientType: e.target.value,
                              recipientIds: e.target.value !== 'specific' ? [] : notificationForm.recipientIds,
                            })
                          }
                          className="w-full p-1 border rounded text-black"
                        >
                          <option value="all">All Users</option>
                          <option value="patients">All Patients</option>
                          <option value="providers">All Providers</option>
                          <option value="specific">Specific Users</option>
                        </select>
                        {notificationForm.recipientType === 'specific' && (
                          <div className="mt-2">
                            {users.map((user) => (
                              <div key={user._id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={notificationForm.recipientIds.includes(user._id)}
                                  onChange={() => toggleRecipient(user._id)}
                                />
                                <span className="ml-1">{user.username} ({user.role})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="w-full bg-teal-500 text-white p-1 rounded hover:bg-teal-600"
                        >
                          Send
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="w-full bg-gray-500 text-white p-1 rounded hover:bg-gray-600"
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
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;