import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Mail, AlertCircle, LogIn } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        identifier: email.trim(),
        password,
      });
      console.log("Login response:", res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId || res.data.id);
      if (res.data.role === "provider") {
        navigate("/provider");
      } else if (res.data.role === "patient") {
        navigate("/dashboard");
      } else if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        setError(t("unsupported_role"));
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "invalid_credentials"));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-md p-8 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:shadow-3xl animate-fade-in">
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-teal-700">
              {t("welcome_back")}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t("sign_in_health_journey")}
            </p>
            <LogIn className="absolute top-0 right-0 w-8 h-8 text-teal-500 animate-pulse" />
          </div>

          {error && (
            <div className="flex items-center p-3 mb-6 space-x-2 text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
              <AlertCircle className="flex-shrink-0 w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-teal-600">
                {t("email_or_username")}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={t("enter_email_or_username")}
                required
              />
              <Mail className="absolute w-5 h-5 text-teal-400 transition-colors left-3 top-10 group-hover:text-teal-600" />
            </div>

            <div className="relative group">
              <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-teal-600">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={t("enter_password")}
                required
              />
              <Lock className="absolute w-5 h-5 text-teal-400 transition-colors left-3 top-10 group-hover:text-teal-600" />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center w-full p-3 space-x-2 text-white transition-all duration-300 transform bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-semibold">{t("login")}</span>
            </button>
          </form>

          <div className="mt-6 space-y-4 text-center">
            <button
              onClick={() => navigate("/register")}
              className="w-full p-3 text-teal-700 transition-all duration-300 bg-teal-100 rounded-lg shadow-md hover:bg-teal-200 hover:text-teal-800 hover:scale-105"
            >
              {t("create_account")}
            </button>
            <p>
              <a
                href="/forgot-password"
                className="text-sm text-teal-500 transition-colors duration-200 hover:text-teal-700 hover:underline"
              >
                {t("forgot_password")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
