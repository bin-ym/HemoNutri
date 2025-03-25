import { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [report, setReport] = useState(null);
  const [userActivity, setUserActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, resourcesRes, activityRes] = await Promise.all([
          api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/resources', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/user-activity', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data);
        setResources(resourcesRes.data);
        setUserActivity(activityRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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

  const handleDeleteResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(resources.filter((res) => res._id !== resourceId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* User Management */}
      <h2 className="text-xl font-semibold mt-6">User Accounts</h2>
      <ul className="mt-2 space-y-2">
        {users.map((user) => (
          <li key={user._id} className="p-2 bg-gray-100 rounded shadow-sm flex justify-between items-center">
            <span>{user.username} - {user.role}</span>
            {user.role !== 'admin' && (
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* User Activity */}
      <h2 className="text-xl font-semibold mt-6">User Activity (Food Logs)</h2>
      <ul className="mt-2 space-y-2">
        {userActivity.map((log) => (
          <li key={log._id} className="p-2 bg-gray-100 rounded shadow-sm">
            {log.user.username} logged: {log.foodItem} - {log.quantity}g on{' '}
            {new Date(log.date).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {/* Content Management */}
      <h2 className="text-xl font-semibold mt-6">Educational Resources</h2>
      <ul className="mt-4 space-y-2">
        {resources.map((res) => (
          <li key={res._id} className="p-2 bg-gray-100 rounded shadow-sm flex justify-between items-center">
            <span>
              {res.title}: {res.content} (Added by {res.createdBy?.username || 'Unknown'})
            </span>
            <button
              onClick={() => handleDeleteResource(res._id)}
              className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Usage Report */}
      <h2 className="text-xl font-semibold mt-6">System Usage Report</h2>
      <button
        onClick={handleGenerateReport}
        className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Generate Report
      </button>
      {report && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow-sm">
          <p>Users: {report.users}</p>
          <p>Food Logs: {report.foodLogs}</p>
          <p>Educational Resources: {report.resources}</p>
          <p>Generated: {new Date(report.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;