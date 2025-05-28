import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";
import { Lock, Mail, AlertCircle, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionExpired = query.get("sessionExpired");
    if (sessionExpired) {
      setApiError(t("session_expired"));
      window.history.replaceState({}, document.title, location.pathname);
    } else if (location.state?.message) {
      setApiError(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, t]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = t("identifier_required");
    if (!formData.password) newErrors.password = t("password_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    console.log("handleSubmit: validateForm exists", typeof validateForm);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(formData.identifier.trim(), formData.password);
      console.log("LoginPage: Login response", response);
      // Store token, userId, and role in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", response.userId);
      localStorage.setItem("role", response.role);
      console.log("LoginPage: Stored in localStorage", {
        token: response.token.slice(0, 10) + "...",
        userId: response.userId,
        role: response.role,
      });

      // Refresh user to get latest profile data
      await refreshUser();

      if (response.isTempPassword) {
        navigate(`/reset-password?token=${response.resetToken}`, { replace: true });
        return;
      }

      let redirectPath;
      if (response.needsProviderSelection) {
        redirectPath = "/select-provider";
        navigate(redirectPath, {
          state: { providers: response.providers, userId: response.userId },
          replace: true,
        });
      } else {
        // Use role from response for now, but profile fetch will sync
        redirectPath =
          response.role === "provider"
            ? "/provider"
            : response.role === "admin"
            ? "/admin"
            : "/dashboard";
        const storedRedirect = localStorage.getItem("redirectPath");
        if (storedRedirect) {
          redirectPath = storedRedirect;
          localStorage.removeItem("redirectPath");
        }
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error("LoginPage: Login error", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setApiError(
        t(err.response?.data?.error || err.message || "login_failed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-md p-8 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:shadow-3xl animate-fade-in">
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-700">{t("welcome_back")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("sign_in_health_journey")}</p>
            <LogIn className="absolute top-0 right-0 w-8 h-8 text-blue-500 animate-pulse" />
          </div>

          {apiError && (
            <div className="flex items-center p-3 mb-6 space-x-2 text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
              <AlertCircle className="flex-shrink-0 w-5 h-5" />
              <p className="text-sm font-medium">{apiError}</p>
              <button
                onClick={() => setApiError("")}
                className="text-red-600 hover:text-red-800"
                aria-label={t("dismiss_error")}
              >
                ✕
              </button>
            </div>
          )}

          <div className="space-y-6">
            <div className="relative group">
              <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-blue-600">{t("email_or_username")}</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                className={`w-full p-3 pl-10 transition-all duration-200 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.identifier ? "border-red-500" : "border-blue-200"
                }`}
                placeholder={t("enter_email_or_username")}
                disabled={isLoading}
                required
              />
              <Mail className="absolute w-5 h-5 text-blue-400 transition-colors left-3 top-10 group-hover:text-blue-600" />
              {errors.identifier && <p className="mt-1 text-sm text-red-500">{errors.identifier}</p>}
            </div>

            <div className="relative group">
              <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-blue-600">{t("password")}</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 pl-10 pr-10 transition-all duration-200 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-blue-200"
                }`}
                placeholder={t("enter_password")}
                disabled={isLoading}
                required
              />
              <Lock className="absolute w-5 h-5 text-blue-400 transition-colors left-3 top-10 group-hover:text-blue-600" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-blue-400 right-3 top-10 hover:text-blue-600"
                aria-label={showPassword ? t("hide_password") : t("show_password")}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <button
              onClick={handleSubmit}
              className={`flex items-center justify-center w-full p-3 space-x-2 text-white transition-all duration-300 transform bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <LogIn className="w-5 h-5" />
              <span className="font-semibold">{isLoading ? t("logging_in") : t("login")}</span>
            </button>
          </div>

          <div className="mt-6 space-y-4 text-center">
            <p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-500 transition-colors duration-200 hover:text-blue-700 hover:underline"
                disabled={isLoading}
              >
                {t("forgot_password")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;