import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { Bell, AlertCircle } from "lucide-react";

const Notifications = ({ role }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Notifications: Fetch error:", err.response?.data || err.message);
        setError(t("failed_load_notifications"));
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [t]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Notifications: Mark read error:", err.response?.data || err.message);
      setError(t("failed_mark_read"));
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 mx-auto border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <p className="mt-2 text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("notifications")}</h2>
      {error && (
        <div className="flex items-center p-3 space-x-2 border border-red-200 rounded-md bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {notifications.length === 0 ? (
        <p className="text-gray-600">{t("no_notifications")}</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-md shadow-sm ${
                notification.read ? "bg-gray-50" : "bg-blue-50"
              } transition-all duration-200`}
            >
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 mt-1 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {t("from")}: {notification.sender?.username || t("system")} |{" "}
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;