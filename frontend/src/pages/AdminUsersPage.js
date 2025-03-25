import Navbar from '../components/Navbar';
import UserList from '../components/admin/UserList';

const AdminUsersPage = () => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <Navbar role="admin" />
    <UserList />
  </div>
);

export default AdminUsersPage;