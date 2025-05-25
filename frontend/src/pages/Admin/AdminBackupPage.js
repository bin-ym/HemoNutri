import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Database, Download, AlertCircle } from "lucide-react";

const AdminBackupPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastBackup, setLastBackup] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);

  useEffect(() => {
    const fetchBackupHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError(t("please_login_access_page"));
          window.location.href = "/login";
          return;
        }
        const res = await api.get("/admin/backup/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBackupHistory(res.data);
      } catch (err) {
        console.error("Fetch backup history error:", err.response?.data || err.message);
        const errorMessage = err.response?.data?.error || t("failed_fetch_backup_history");
        setError(errorMessage);
        if (err.response?.status === 401) {
          setError(t("session_expired"));
        }
      }
    };
    fetchBackupHistory();
  }, [t]);

  const handleBackup = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t("please_login_create_backup"));
        window.location.href = "/login";
        return;
      }
      const res = await api.get("/admin/backup", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      if (res.status !== 200) {
        const errorText = await res.data.text();
        let errorMessage = t("failed_create_backup");
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          console.error("Error parsing response:", parseErr);
        }
        throw new Error(errorMessage);
      }

      const contentDisposition = res.headers["content-disposition"];
      let filename = `HemoNutri_Backup_${new Date().toISOString().split("T")[0]}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());

      const historyRes = await api.get("/admin/backup/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackupHistory(historyRes.data);
    } catch (err) {
      console.error("Backup error:", err.message);
      const errorMessage = err.response?.status === 401 ? t("session_expired") : err.message || t("failed_create_backup");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupId, filename) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t("please_login_download_backups"));
        window.location.href = "/login";
        return;
      }
      const res = await api.get(`/admin/backup/${backupId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download backup error:", err.response?.data || err.message);
      const errorMessage = err.response?.status === 401 ? t("session_expired") : t("failed_download_backup");
      setError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar role="admin" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-black sm:text-4xl animate-fade-in">
            {t("database_backup")}
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            {t("create_manage_backups")}
          </p>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleBackup}
              disabled={loading}
              className={`flex items-center justify-center px-6 py-3 text-white bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <Database className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {loading ? t("creating_backup") : t("create_backup")}
            </button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg shadow-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-black">{error}</p>
                </div>
              </div>
            )}

            {lastBackup && (
              <div className="p-4 rounded-lg shadow-md bg-blue-50">
                <p className="text-black">
                  {t("last_backup")}: {lastBackup}
                </p>
              </div>
            )}

            {backupHistory.length > 0 && (
              <div className="w-full mt-6">
                <h2 className="mb-4 text-xl font-semibold text-black">
                  {t("backup_history")}
                </h2>
                <div className="space-y-3">
                  {backupHistory.map((backup) => (
                    <div
                      key={backup._id}
                      className="flex items-center justify-between p-3 transition-all duration-200 rounded-lg shadow-sm bg-blue-50 hover:bg-blue-100"
                    >
                      <div>
                        <p className="text-black">{backup.filename}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(backup.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadBackup(backup._id, backup.filename)}
                        className="flex items-center px-4 py-2 text-white transition-all duration-200 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t("download")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBackupPage;