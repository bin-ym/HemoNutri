import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import UserList from "../../components/admin/UserList";
import { RefreshCw, Plus, X, Save } from "lucide-react";
import api from "../../services/api";

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "patient",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName) {
      newErrors.firstName = t("first_name_required");
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = t("first_name_too_short");
    }
    if (!formData.lastName) {
      newErrors.lastName = t("last_name_required");
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = t("last_name_too_short");
    }
    if (!formData.email) {
      newErrors.email = t("email_required");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("invalid_email");
    }
    if (!formData.role) {
      newErrors.role = t("role_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/admin/add-user",
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          role: formData.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ firstName: "", lastName: "", email: "", role: "patient" });
      setErrors({});
      setShowAddForm(false);
      handleRefresh();
      alert(t("user_added_success"));
    } catch (err) {
      console.error("Add user error:", err.response?.data || err.message);
      setApiError(t(err.response?.data?.error || "failed_add_user"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <div className="max-w-6xl p-6 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            {t("manage_users")}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-white bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105 transition-all duration-300"
              disabled={isLoading}
              aria-label={t("refresh_users")}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {t("refresh")}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 text-white bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105 transition-all duration-300"
              disabled={isLoading}
              aria-label={showAddForm ? t("close_form") : t("add_user")}
            >
              <Plus className="w-5 h-5 mr-2" />
              {showAddForm ? t("close_form") : t("add_user")}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 mb-6 bg-white border border-teal-200 shadow-lg rounded-xl animate-fade-in">
            <h2 className="mb-4 text-2xl font-semibold text-teal-700">
              {t("add_new_user")}
            </h2>
            {apiError && (
              <div
                className="flex items-center justify-between p-4 mb-4 text-red-700 bg-red-100 rounded-lg"
                role="alert"
              >
                <span>{apiError}</span>
                <button
                  onClick={() => setApiError("")}
                  className="text-red-700 hover:text-red-900"
                  aria-label={t("dismiss_error")}
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-teal-700"
                  >
                    {t("first_name")}
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t("enter_first_name")}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    aria-invalid={errors.firstName ? "true" : "false"}
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                    disabled={isLoading}
                    required
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-500">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-teal-700"
                  >
                    {t("last_name")}
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t("enter_last_name")}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    aria-invalid={errors.lastName ? "true" : "false"}
                    aria-describedby={
                      errors.lastName ? "lastName-error" : undefined
                    }
                    disabled={isLoading}
                    required
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="mt-1 text-sm text-red-500">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-teal-700"
                >
                  {t("email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("enter_email")}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-teal-700"
                >
                  {t("role")}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors.role ? "true" : "false"}
                  aria-describedby={errors.role ? "role-error" : undefined}
                  disabled={isLoading}
                  required
                >
                  <option value="patient">{t("patient")}</option>
                  <option value="provider">{t("provider")}</option>
                  <option value="admin">{t("admin")}</option>
                </select>
                {errors.role && (
                  <p id="role-error" className="mt-1 text-sm text-red-500">
                    {errors.role}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className={`flex items-center justify-center flex-1 p-3 text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                  aria-label={t("add_user")}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? t("adding_user") : t("add_user")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-300 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                  disabled={isLoading}
                  aria-label={t("cancel")}
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
          <UserList key={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;