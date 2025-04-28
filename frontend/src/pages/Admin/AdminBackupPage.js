import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Database, Download, AlertCircle } from "lucide-react";

const AdminBackupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastBackup, setLastBackup] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);

  // Fetch backup history on mount
  useEffect(() => {
    const fetchBackupHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to access this page.");
          window.location.href = '/login';
          return;
        }
        const res = await api.get("/admin/backup/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBackupHistory(res.data);
      } catch (err) {
        console.error("Fetch backup history error:", err.response?.data || err.message);
        const errorMessage = err.response?.data?.error || "Failed to fetch backup history.";
        setError(errorMessage);
        if (err.response?.status === 401) {
          setError("Session expired. Redirecting to login...");
        }
      }
    };
    fetchBackupHistory();
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to create a backup.");
        window.location.href = '/login';
        return;
      }
      const res = await api.get("/admin/backup", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      // Check response status
      if (res.status !== 200) {
        const errorText = await res.data.text();
        let errorMessage = "Failed to create backup";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          console.error("Error parsing response:", parseErr);
        }
        throw new Error(errorMessage);
      }

      // Check Content-Type to ensure it's a file download
      const contentType = res.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Unexpected response format. Expected a JSON file.");
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = res.headers['content-disposition'];
      let filename = `HemoNutri_Backup_${new Date().toISOString().split('T')[0]}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());

      // Refresh backup history
      const historyRes = await api.get("/admin/backup/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackupHistory(historyRes.data);
    } catch (err) {
      console.error("Backup error:", err.message);
      const errorMessage = err.response?.status === 401 ? "Session expired. Redirecting to login..." : err.message || "Failed to create backup. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupId, filename) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to download backups.");
        window.location.href = '/login';
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
      const errorMessage = err.response?.status === 401 ? "Session expired. Redirecting to login..." : "Failed to download backup. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar role="admin" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            Database Backup
          </h1>
          <p className="mt-2 text-lg text-teal-600">
            Create and manage backups of the HemoNutri database
          </p>
        </div>

        <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleBackup}
              disabled={loading}
              className={`flex items-center justify-center px-6 py-3 text-white bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105 transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <Database className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {loading ? "Creating Backup..." : "Create Backup"}
            </button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {lastBackup && (
              <div className="p-4 bg-teal-50 rounded-lg shadow-md">
                <p className="text-teal-600">
                  Last Backup: {lastBackup}
                </p>
              </div>
            )}

            {backupHistory.length > 0 && (
              <div className="mt-6 w-full">
                <h2 className="text-xl font-semibold text-teal-700 mb-4">
                  Backup History
                </h2>
                <div className="space-y-3">
                  {backupHistory.map((backup) => (
                    <div
                      key={backup._id}
                      className="flex justify-between items-center p-3 bg-teal-50 rounded-lg shadow-sm"
                    >
                      <div>
                        <p className="text-teal-600">{backup.filename}</p>
                        <p className="text-sm text-teal-500">
                          {new Date(backup.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadBackup(backup._id, backup.filename)}
                        className="flex items-center px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 hover:scale-105 transition-all duration-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
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