import { useState } from "react";
import Navbar from "../../components/Navbar";
import UserList from "../../components/admin/UserList";
import { RefreshCw } from "lucide-react";

const AdminUsersPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <div className="max-w-6xl p-6 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            Manage Users
          </h1>
          <p className="mt-2 text-lg text-teal-600">View and manage system users</p>
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
        <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
          <UserList key={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;