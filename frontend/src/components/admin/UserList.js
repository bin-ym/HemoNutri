import { useEffect, useState } from 'react';
import api from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'patient' });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Raw API response:', res.data);
        const filteredUsers = res.data.filter((user) => user.role !== 'admin');
        console.log('Filtered users:', filteredUsers);
        setUsers(filteredUsers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error(err);
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
      console.error('Add user error:', err.response?.data);
      setAddError(err.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User List</h1>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {showAddForm ? 'Cancel' : 'Add User'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddUser} className="mb-6 p-4 bg-gray-100 rounded shadow-sm space-y-4">
          <div>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient">Patient</option>
              <option value="provider">Provider</option>
            </select>
          </div>
          {addError && <p className="text-red-500 text-sm">{addError}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Add User
          </button>
        </form>
      )}

      {users.length === 0 ? (
        <p>No non-admin users found.</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow-sm rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;  