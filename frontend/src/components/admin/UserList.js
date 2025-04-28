import { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserPlus, X, Trash2, AlertCircle } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'patient' });
  const [addError, setAddError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Avoid fetching if no token
      const res = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Raw API response:', res.data);
      const filteredUsers = res.data.filter((user) => user.role !== 'admin');
      console.log('Filtered users:', filteredUsers);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Fetch users error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // Poll every 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error('Delete user error:', err.response?.data || err.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers([...users, res.data.user]);
      setNewUser({ username: '', email: '', role: 'patient' });
      setShowAddForm(false);
      setAddError('');
    } catch (err) {
      console.error('Add user error:', err.response?.data || err.message);
      setAddError(err.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            User Management
          </h1>
          <p className="mt-2 text-lg text-teal-600">
            Manage patients and providers in HemoNutri
          </p>
        </div>

        <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center justify-center px-6 py-3 text-white rounded-lg shadow-md transition-all duration-300 hover:scale-105 mb-6 ${
              showAddForm
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-teal-700 hover:bg-teal-800'
            }`}
          >
            {showAddForm ? (
              <>
                <X className="w-5 h-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Add User
              </>
            )}
          </button>

          {showAddForm && (
            <form
              onSubmit={handleAddUser}
              className="mb-8 p-6 bg-teal-50 border border-teal-200 rounded-lg shadow-md space-y-4 animate-slide-down"
            >
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full p-2 border border-teal-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                  className="w-full p-2 border border-teal-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 border border-teal-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="patient">Patient</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
              {addError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{addError}</p>
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3 text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 transition-all duration-300"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add User
              </button>
            </form>
          )}

          {users.length === 0 ? (
            <p className="text-teal-600 text-center">No non-admin users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-teal-700 text-white">
                    <th className="p-3 text-left font-semibold">Username</th>
                    <th className="p-3 text-left font-semibold">Role</th>
                    <th className="p-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`border-t ${
                        index % 2 === 0 ? 'bg-teal-50' : 'bg-white'
                      } hover:bg-teal-100 transition-all duration-200`}
                    >
                      <td className="p-3 text-teal-800">{user.username}</td>
                      <td className="p-3 text-teal-800 capitalize">{user.role}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center px-3 py-1 text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 hover:scale-105 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;