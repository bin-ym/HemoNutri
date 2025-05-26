import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageSquare, Bell, LogOut, Database, Globe, User, Phone, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import HemoNutriLogo from "../assets/HemoNutri.jpg";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ role }) => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    recipientType: "all",
    recipientIds: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showEmergencyDropdown, setShowEmergencyDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive username from user object
  const username = user?.username || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          navigate("/login");
          return;
        }

        if (role === "admin") {
          const res = await api.get("/admin/users");
          setUsers(res.data.filter((user) => user.role !== "admin"));
        }

        if ((role === "patient" || role === "provider") && user?._id) {
          const endpoint = role === "patient" ? "/patient/messages" : "/provider/messages";
          const res = await api.get(endpoint);
          const userId = user._id || localStorage.getItem("userId");
          const unreadMessages = res.data.filter(
            (msg) => String(msg.recipient?._id || msg.recipient) === String(userId) && !msg.read
          );
          setUnreadCount(unreadMessages.length);
        }
      } catch (err) {
        console.error("Fetch data error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userId");
          navigate("/login");
        }
      }
    };

    if (isAuthenticated && !loading && user) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [role, isAuthenticated, loading, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        recipientType: notificationForm.recipientType,
        recipientIds:
          notificationForm.recipientType === "specific"
            ? notificationForm.recipientIds
            : [],
      };
      if (!payload.title || !payload.message)
        throw new Error(t("error_title_message_required"));
      await api.post("/admin/notifications", payload);
      setNotificationForm({
        title: "",
        message: "",
        recipientType: "all",
        recipientIds: [],
      });
      setShowForm(false);
      alert(t("notification_sent_success"));
    } catch (err) {
      console.error(
        "Send notification error:",
        err.response?.data || err.message
      );
      alert(
        err.response?.data?.error ||
          err.message ||
          t("error_notification_failed")
      );
    }
  };

  const toggleRecipient = (userId) => {
    setNotificationForm((prev) => {
      const recipientIds = prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter((id) => id !== userId)
        : [...prev.recipientIds, userId];
      return { ...prev, recipientIds };
    });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLanguageDropdown(false);
  };

  const emergencyContacts = [
    { name: t("emergency_medical"), number: "+251-911-123-456" },
    { name: t("local_hospital"), number: "+251-922-789-012" },
    { name: t("support_center"), number: "+251-933-456-789" },
  ];

  // Don't render authenticated links if loading or no user
  if (role && (loading || !user)) {
    return (
      <nav className="sticky top-0 z-50 px-4 py-3 transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={HemoNutriLogo}
              alt="HemoNutri Logo"
              className="w-8 h-8 rounded-full shadow-md md:w-10 md:h-10"
            />
            <h1 className="text-xl font-extrabold tracking-tight text-white transition-colors duration-300 hover:text-blue-200 animate-fade-in md:text-3xl">
              {t("app_name")}
            </h1>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 px-4 py-3 transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo and Title */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() =>
            navigate(
              role === "patient"
                ? "/dashboard"
                : role === "provider"
                ? "/provider"
                : "/"
            )
          }
        >
          <img
            src={HemoNutriLogo}
            alt="HemoNutri Logo"
            className="w-8 h-8 rounded-full shadow-md md:w-10 md:h-10"
          />
          <h1 className="text-xl font-extrabold tracking-tight text-white transition-colors duration-300 hover:text-blue-200 animate-fade-in md:text-3xl">
            {t("app_name")}
          </h1>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
            aria-label={isMobileMenuOpen ? t("close_menu") : t("open_menu")}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`md:flex md:items-center md:space-x-3 ${
            isMobileMenuOpen
              ? "flex flex-col absolute top-14 left-0 w-full bg-blue-700 p-4 space-y-4 md:space-y-0 md:bg-transparent md:p-0 md:static md:flex-row"
              : "hidden md:flex"
          }`}
        >
          {!role && (
            <>
              <NavButton label={t("home")} icon="🏠" path="/" />
              <a
                href="#about"
                className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
              >
                <span className="mr-2">ℹ️</span>
                {t("about")}
              </a>
              <a
                href="#contact"
                className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
              >
                <span className="mr-2">📞</span>
                {t("contact")}
              </a>
              <NavButton label={t("login")} icon="🔑" path="/login" highlight />
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t("language")}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-blue-200 shadow-2xl rounded-xl animate-slide-down md:w-48">
                    <button
                      onClick={() => changeLanguage("en")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage("am")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage("om")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                    <button
                      onClick={() => changeLanguage("ti")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> ትግርኛ
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role === "patient" && (
            <>
              <NavButton label={t("dashboard")} icon="📊" path="/dashboard" />
              <NavButton label={t("meal_plan")} icon="📋" path="/meal-plan" />
              <NavButtonWithBadge
                t={t}
                label={t("messages")}
                icon={<MessageSquare className="w-4 h-4" />}
                path="/messages"
                badge={unreadCount}
              />
              <NavButton label={t("education")} icon="📚" path="/education" />
              <div className="relative">
                <button
                  onClick={() => setShowEmergencyDropdown(!showEmergencyDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
                  aria-label={t("emergency_contact")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {t("emergency_contact")}
                </button>
                {showEmergencyDropdown && (
                  <div className="absolute right-0 z-50 w-64 mt-2 overflow-hidden bg-white border border-blue-200 shadow-2xl rounded-xl animate-slide-down md:w-72">
                    {emergencyContacts.map((contact, index) => (
                      <a
                        key={index}
                        href={`tel:${contact.number}`}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                      >
                        <span className="mr-2">{contact.name}:</span> {contact.number}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 bg-blue-700 rounded-lg hover:bg-blue-900 hover:scale-105"
                aria-label={t("profile")}
              >
                <User className="w-4 h-4 mr-2" />
                <span>{username || t("profile")}</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
                  aria-label={t("language")}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t("language")}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-blue-200 shadow-2xl rounded-xl animate-slide-down md:w-48">
                    <button
                      onClick={() => changeLanguage("en")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage("am")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage("om")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                    <button
                      onClick={() => changeLanguage("ti")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> ትግርኛ
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role === "provider" && (
            <>
              <NavButton label={t("dashboard")} icon="📊" path="/provider" />
              <NavButton
                label={t("patients")}
                icon="👥"
                path="/provider/patients"
              />
              <NavButtonWithBadge
                t={t}
                label={t("messages")}
                icon={<MessageSquare className="w-4 h-4" />}
                path="/provider/messages"
                badge={unreadCount}
              />
              <NavButton
                label={t("education")}
                icon="📚"
                path="/provider/education"
              />
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 bg-blue-700 rounded-lg hover:bg-blue-900 hover:scale-105"
                aria-label={t("profile")}
              >
                <User className="w-4 h-4 mr-2" />
                <span>{username || t("profile")}</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
                  aria-label={t("language")}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t("language")}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-blue-200 shadow-2xl rounded-xl animate-slide-down md:w-48">
                    <button
                      onClick={() => changeLanguage("en")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage("am")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage("om")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                    <button
                      onClick={() => changeLanguage("ti")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> ትግርኛ
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role === "admin" && (
            <>
              <NavButton label={t("dashboard")} icon="📊" path="/admin" />
              <NavButton label={t("users")} icon="👥" path="/admin/users" />
              <NavButton
                label={t("resources")}
                icon="📚"
                path="/admin/resources"
              />
              <NavButton
                label={t("reports")}
                icon="📈"
                path="/admin/report"
              />
              <NavButton
                label={t("backup")}
                icon={<Database className="w-4 h-4" />}
                path="/admin/backup"
              />
              <div className="relative">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
                  aria-label={t("notify")}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {t("notify")}
                </button>
                {showForm && (
                  <div className="absolute right-0 p-4 mt-2 text-black bg-white border border-blue-200 shadow-2xl w-72 rounded-xl animate-slide-down md:w-80">
                    <h3 className="mb-3 text-lg font-semibold text-blue-700">
                      {t("send_notification")}
                    </h3>
                    <form
                      onSubmit={handleSendNotification}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("title")}
                        </label>
                        <input
                          type="text"
                          value={notificationForm.title}
                          onChange={(e) =>
                            setNotificationForm({
                              ...notificationForm,
                              title: e.target.value,
                            })
                          }
                          placeholder={t("notification_title_placeholder")}
                          className="w-full p-2 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("message")}
                        </label>
                        <textarea
                          value={notificationForm.message}
                          onChange={(e) =>
                            setNotificationForm({
                              ...notificationForm,
                              message: e.target.value,
                            })
                          }
                          placeholder={t("message_placeholder")}
                          className="w-full p-2 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("send_to")}
                        </label>
                        <select
                          value={notificationForm.recipientType}
                          onChange={(e) =>
                            setNotificationForm({
                              ...notificationForm,
                              recipientType: e.target.value,
                              recipientIds:
                                e.target.value !== "specific"
                                  ? []
                                  : notificationForm.recipientIds,
                            })
                          }
                          className="w-full p-2 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">{t("all_users")}</option>
                          <option value="patients">{t("all_patients")}</option>
                          <option value="providers">
                            {t("all_providers")}
                          </option>
                          <option value="specific">
                            {t("specific_users")}
                          </option>
                        </select>
                      </div>
                      {notificationForm.recipientType === "specific" && (
                        <div className="p-2 overflow-y-auto border border-blue-100 rounded max-h-24 bg-blue-50">
                          {users.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                checked={notificationForm.recipientIds.includes(
                                  user._id
                                )}
                                onChange={() => toggleRecipient(user._id)}
                                className="w-4 h-4 mr-2 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {user.username} ({t(user.role)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="flex-1 p-2 text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
                        >
                          {t("send")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="flex-1 p-2 text-white transition-all duration-300 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 bg-blue-700 rounded-lg hover:bg-blue-900 hover:scale-105"
                aria-label={t("profile")}
              >
                <User className="w-4 h-4 mr-2" />
                <span>{username || t("profile")}</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:bg-transparent md:shadow-none"
                  aria-label={t("language")}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t("language")}
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden bg-white border border-blue-200 shadow-2xl rounded-xl animate-slide-down md:w-48">
                    <button
                      onClick={() => changeLanguage("en")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage("am")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage("om")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> Afaan Oromo
                    </button>
                    <button
                      onClick={() => changeLanguage("ti")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <span className="mr-2">🇪🇹</span> ትግርኛ
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {role && (
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-semibold text-white transition-all duration-300 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:scale-105"
              aria-label={t("logout")}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("logout")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ label, icon, path, highlight = false }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center px-3 py-2 text-sm font-medium text-white ${
        highlight ? "bg-blue-800" : "bg-blue-700"
      } rounded-lg shadow-md hover:bg-blue-900 transition-all duration-300 hover:scale-105 w-full md:w-auto md:bg-transparent md:shadow-none`}
      aria-label={label}
    >
      {typeof icon === "string" ? <span className="mr-2">{icon}</span> : <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

const NavButtonWithBadge = ({ t, label, icon, path, badge }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="relative flex items-center w-full px-3 py-2 text-sm font-medium text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 md:w-auto md:bg-transparent md:shadow-none"
      aria-label={`${label} ${badge > 0 ? t("with_notifications", { count: badge }) : ""}`}
    >
      <span className="flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </span>
      {badge > 0 && (
        <span className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md -top-1 -right-1 animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
};

export default Navbar;