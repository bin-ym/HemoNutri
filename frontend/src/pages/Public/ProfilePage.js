import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const ProfilePage = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrors({ api: t("please_login") });
          return;
        }
        const res = await api.get("/auth/profile");
        setProfileData({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
        });
      } catch (err) {
        console.error("Fetch profile error:", err.response?.data);
        setErrors({ api: t(err.response?.data?.error || "profile_fetch_failed") });
      }
    };
    fetchProfile();
  }, [t]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    if (score <= 2) {
      return { score: score * 20, label: t("weak"), color: "bg-red-500" };
    } else if (score <= 4) {
      return { score: score * 20, label: t("medium"), color: "bg-yellow-500" };
    } else {
      return { score: 100, label: t("strong"), color: "bg-green-500" };
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!profileData.firstName) newErrors.firstName = t("first_name_required");
    if (!profileData.lastName) newErrors.lastName = t("last_name_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t("current_password_required");
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = t("new_password_required");
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      newErrors.newPassword = t("password_requirements");
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = t("passwords_must_match");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setApiMessage("");
    setErrors({});
    if (!validateProfileForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/profile/update", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
      setApiMessage(t("profile_updated_success"));
    } catch (err) {
      console.error("Update profile error:", err.response?.data);
      setErrors({ api: t(err.response?.data?.error || "profile_update_failed") });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setApiMessage("");
    setErrors({});
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setApiMessage(t("password_changed_success"));
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordStrength({ score: 0, label: "", color: "" });
    } catch (err) {
      console.error("Change password error:", err.response?.data);
      setErrors({ api: t(err.response?.data?.error || "password_change_failed") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role={role} />
      <main className="flex items-center justify-center flex-grow px-4 py-8">
        <section className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl animate-fade-in">
          <h1 className="mb-8 text-3xl font-semibold text-center text-teal-600" role="heading" aria-level="1">
            {t("profile")}
          </h1>
          {apiMessage && (
            <div className="p-4 mb-6 text-green-700 bg-green-100 rounded-lg" role="alert">
              {apiMessage}
            </div>
          )}
          {errors.api && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg" role="alert">
              {errors.api}
            </div>
          )}
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-teal-600">{t("edit_profile")}</h2>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t("first_name")}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={profileData.firstName}
                onChange={handleProfileChange}
                placeholder={t("enter_first_name")}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.firstName ? "true" : "false"}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t("last_name")}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={profileData.lastName}
                onChange={handleProfileChange}
                placeholder={t("enter_last_name")}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.lastName ? "true" : "false"}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-500">
                  {errors.lastName}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full p-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? t("updating") : t("update_profile")}
            </button>
          </form>
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-teal-600">{t("change_password")}</h2>
            <div className="relative">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                {t("current_password")}
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder={t("enter_current_password")}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.currentPassword ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.currentPassword ? "true" : "false"}
                aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                disabled={isLoading}
              />
              {errors.currentPassword && (
                <p id="currentPassword-error" className="mt-1 text-sm text-red-500">
                  {errors.currentPassword}
                </p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                {t("new_password")}
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder={t("enter_new_password")}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.newPassword ? "true" : "false"}
                aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-teal-400 hover:text-teal-600"
                aria-label={showPassword ? t("hide_passwords") : t("show_passwords")}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="text-sm text-teal-600 mt-1">
                {t("password_requirements")}
              </div>
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-700">
                    {t("password_strength")}: <span className={`text-${passwordStrength.color.replace("bg-", "")}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {errors.newPassword && (
                <p id="newPassword-error" className="mt-1 text-sm text-red-500">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                {t("confirm_new_password")}
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                placeholder={t("confirm_new_password")}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.confirmNewPassword ? "true" : "false"}
                aria-describedby={errors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
                disabled={isLoading}
              />
              {errors.confirmNewPassword && (
                <p id="confirmNewPassword-error" className="mt-1 text-sm text-red-500">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full p-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? t("changing") : t("change_password")}
            </button>
          </form>
        </section>
      </main>
      <footer className="py-4 text-sm text-center text-gray-500">
        {t("footer_text", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
};

export default ProfilePage;