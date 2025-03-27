import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminDashboard from '../components/admin/AdminDashboard'; // Import the component
import Notifications from '../components/Notifications';
import api from '../services/api';

const AdminPage = () => {
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Admin token:', token); // Debug
        if (!token || localStorage.getItem('role') !== 'admin') {
          console.error('Invalid token or role, redirecting to login');
          navigate('/login');
          return;
        }
        const res = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Admin data response:', res.data); // Debug
        setAdminData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch admin data error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load admin data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error('Auth failure, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);

  if (loading) return <p className="text-center mt-10">Loading admin data...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="admin" />
      <div className="max-w-6xl mx-auto p-6 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-teal-600">Admin Dashboard</h1>
        <AdminDashboard adminData={adminData} />
        <div className="mt-6">
          <Notifications />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;