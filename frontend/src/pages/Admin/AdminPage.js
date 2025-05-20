import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import AdminDashboard from "../../components/admin/AdminDashboard";
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            {t("admin_dashboard")}
          </h1>
          <p className="mt-2 text-lg text-teal-600">
            {t("manage_users_resources_notifications")}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 border-4 border-teal-700 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-xl font-semibold text-teal-700 animate-pulse">
                {t("loading_admin_data")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-md p-6 mx-auto bg-red-100 border border-red-300 rounded-xl animate-slide-down">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <p className="text-lg font-medium text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
              <AdminDashboard adminData={adminData} />
            </div>
            <div className="p-6 mt-6 bg-white border border-teal-200 shadow-lg rounded-xl">
              <Notifications />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;