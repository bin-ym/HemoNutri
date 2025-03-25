import Navbar from '../components/Navbar';
import AdminDashboard from '../components/admin/AdminDashboard';
import Notifications from '../components/Notifications';

const AdminPage = () => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <Navbar role="admin" />
    <div className="max-w-4xl mx-auto p-6">
      <AdminDashboard />
      <Notifications /> {/* Updated to show admin-sent notifications */}
    </div>
  </div>
);

export default AdminPage;