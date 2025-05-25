import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Notifications from "../../components/Notifications";
import api from "../../services/api";
import { AlertCircle, RefreshCw } from "lucide-react";

const AdminPage = () => {
  const { t } = useTranslation();
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "admin") {
        console.error("Invalid token or role, redirecting to login");
        navigate("/login", { state: { message: t("please_login_admin") } });
        return;
      }
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Admin data response:", res.data);
      setAdminData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch admin data error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "failed_load_admin_data"));
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate("/login", { state: { message: t("session_expired") } });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-black sm:text-4xl animate-fade-in">
            {t("admin_dashboard")}
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            {t("manage_users_resources_notifications")}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 border-4 border-blue-900 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-xl font-semibold text-black animate-pulse">
                {t("loading_admin_data")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-md p-4 mx-auto bg-red-100 border border-red-300 rounded-lg shadow-md animate-slide-down">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-lg font-medium text-black">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h2 className="mb-4 text-xl font-semibold text-black">Users Overview</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-white bg-blue-900">
                      <th className="p-3 text-left">Username</th>
                      <th className="p-3 text-left">Role</th>
                      <th className="p-3 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-black">{user.username}</td>
                        <td className="p-3 text-black">{user.role}</td>
                        <td className="p-3 text-black">{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <Notifications />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;