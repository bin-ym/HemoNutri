import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Pencil } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: localStorage.getItem("role") || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    console.log("ProfilePage: useEffect triggered", {
      loading,
      isLoading,
      user: user ? { email: user.email, role: user.role } : null,
    });
    if (loading) {
      console.log("ProfilePage: Waiting for AuthContext loading");
      return;
    }

    const syncProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        console.log("ProfilePage: Checking token and role", {
          token: token?.slice(0, 10) + "...",
          storedRole,
        });

        if (!token) {
          console.log("ProfilePage: No token, setting error");
          setErrors({ api: t("please_login") });
          navigate("/login");
          return;
        }

        if (user && user.email) {
          const userData = {
            username: user.username || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            role: user.role || storedRole || "",
          };
          setProfileData(userData);
          console.log(
            "ProfilePage: Set profileData from AuthContext user:",
            userData
          );
        } else {
          console.log("ProfilePage: Fetching /auth/profile");
          const res = await api.get("/auth/profile");
          console.log("ProfilePage: /auth/profile fetch completed", res.data);
          const userData = {
            username: res.data.username || "",
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            email: res.data.email || "",
            role: res.data.role || storedRole || "",
          };
          setProfileData(userData);
          setUser({ ...user, ...userData });
        }
      } catch (err) {
        console.error("ProfilePage: Fetch error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setErrors({
          api: t(err.response?.data?.error) || t("profile_fetch_failed"),
        });
      } finally {
        setIsLoading(false);
        console.log("ProfilePage: isLoading set to false");
      }
    };

    syncProfile();
  }, [loading, user, setUser, t, navigate]);

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
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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
    console.log("ProfilePage: Submitting profile update", profileData);
    try {
      const response = await api.post("/auth/profile/update", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
      const updatedData = {
        username:
          response.data.username ||
          `${profileData.firstName} ${profileData.lastName}`,
        firstName: response.data.firstName || profileData.firstName,
        lastName: response.data.lastName || profileData.lastName,
        email: profileData.email,
        role: profileData.role,
      };
      setProfileData(updatedData);
      setUser((prev) => ({ ...prev, ...updatedData }));
      setApiMessage(t("profile_updated_success"));
      setIsEditingProfile(false);
      console.log("ProfilePage: Profile updated:", updatedData);
    } catch (err) {
      console.error("ProfilePage: Update profile error:", err.response?.data);
      setErrors({
        api: t(err.response?.data?.error) || t("profile_update_failed"),
      });
    } finally {
      setIsLoading(false);
      console.log("ProfilePage: isLoading set to false after update");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setApiMessage("");
    setErrors({});
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    console.log("ProfilePage: Submitting password change");
    try {
      await api.post("/auth/change-password", {
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
      console.log("ProfilePage: Password changed successfully");
    } catch (err) {
      console.error("ProfilePage: Change password error:", err.response?.data);
      setErrors({
        api: t(err.response?.data?.error) || t("password_change_failed"),
      });
    } finally {
      setIsLoading(false);
      console.log("ProfilePage: isLoading set to false after password change");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log("ProfilePage: Updated profileData:", newData);
      return newData;
    });
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

  const toggleEditProfile = () => {
    setIsEditingProfile(!isEditingProfile);
    setErrors({});
    setApiMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role={profileData.role} />
      <main className="flex items-center justify-center flex-grow px-4 py-8">
        {isLoading || loading ? (
          <div className="text-center">
            <p className="text-blue-600">{t("loading_profile")}</p>
          </div>
        ) : (
          <section className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl animate-fade-in">
            <h1
              className="mb-8 text-3xl font-semibold text-center text-blue-600"
              role="heading"
              aria-level="1"
            >
              {t("Profile")}
            </h1>
            {apiMessage && (
              <div
                className="p-4 mb-6 text-green-700 bg-green-100 rounded-lg"
                role="alert"
              >
                {apiMessage}
              </div>
            )}
            {errors.api && (
              <div
                className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg"
                role="alert"
              >
                {errors.api}
                {(errors.api === t("invalid_token") ||
                  errors.api === t("request_canceled") ||
                  errors.api === t("token_expired")) && (
                  <p className="mt-2">
                    <button
                      onClick={() => navigate("/login")}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {t("go_to_login")}
                    </button>
                  </p>
                )}
              </div>
            )}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-blue-600">
                {t("User information")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("email")}
                  </label>
                  <p className="p-3 bg-gray-100 rounded-lg">
                    {profileData.email || t("not_available")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("role")}
                  </label>
                  <p className="p-3 bg-gray-100 rounded-lg">
                    {profileData.role || t("not_available")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("name")}
                  </label>
                  {isEditingProfile ? (
                    <div className="mt-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("first_name")}
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          placeholder={t("enter_first_name")}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          aria-invalid={errors.firstName ? "true" : "false"}
                          aria-describedby={
                            errors.firstName ? "firstName-error" : undefined
                          }
                          disabled={isLoading}
                        />
                        {errors.firstName && (
                          <p
                            id="firstName-error"
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("last_name")}
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          placeholder={t("enter_last_name")}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          aria-invalid={errors.lastName ? "true" : "false"}
                          aria-describedby={
                            errors.lastName ? "lastName-error" : undefined
                          }
                          disabled={isLoading}
                        />
                        {errors.lastName && (
                          <p
                            id="lastName-error"
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleProfileSubmit}
                          className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {t("save")}
                        </button>
                        <button
                          type="button"
                          onClick={toggleEditProfile}
                          className="p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                      <p>{profileData.username || t("not_available")}</p>
                      <button
                        onClick={toggleEditProfile}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={t("edit_profile")}
                      >
                        <Pencil size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-blue-600">
                {t("Change password")}
              </h2>
              <div className="relative">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("current_password")}
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder={t("enter_current_password")}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={errors.currentPassword ? "true" : "false"}
                  aria-describedby={
                    errors.currentPassword ? "currentPassword-error" : undefined
                  }
                  disabled={isLoading}
                />
                {errors.currentPassword && (
                  <p
                    id="currentPassword-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              <div className="relative">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("new_password")}
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword} // Fixed: Changed from profileData.newPassword
                  onChange={handlePasswordChange}
                  placeholder={t("enter_new_password")}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors.newPassword ? "true" : "false"}
                  aria-describedby={
                    errors.newPassword ? "newPassword-error" : undefined
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-blue-600 right-3 top-10 hover:text-blue-800"
                  aria-label={
                    showPassword ? t("hide_passwords") : t("show_passwords")
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="mt-1 text-sm text-blue-600">
                  {t("password_requirements")}
                </div>
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700">
                      {t("password_strength")}:{" "}
                      <span
                        className={`text-${passwordStrength.color.replace(
                          "bg-",
                          ""
                        )}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {errors.newPassword && (
                  <p
                    id="newPassword-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("confirm_new_password")}
                </label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  placeholder={t("confirm_new_password")}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmNewPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={errors.confirmNewPassword ? "true" : "false"}
                  aria-describedby={
                    errors.confirmNewPassword
                      ? "confirmNewPassword-error"
                      : undefined
                  }
                  disabled={isLoading}
                />
                {errors.confirmNewPassword && (
                  <p
                    id="confirmNewPassword-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.confirmNewPassword}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className={`w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? t("changing") : t("change_password")}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
