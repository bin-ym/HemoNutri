import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import { Plus, X, Save, Trash2, AlertCircle } from "lucide-react";
import api from "../../services/api";

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredUsers = res.data.filter((user) => user.role !== "admin");
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Fetch users error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName) newErrors.firstName = t("first_name_required");
    else if (formData.firstName.length < 2)
      newErrors.firstName = t("first_name_too_short");
    if (!formData.lastName) newErrors.lastName = t("last_name_required");
    else if (formData.lastName.length < 2)
      newErrors.lastName = t("last_name_too_short");
    if (!formData.email) newErrors.email = t("email_required");
    else if (!emailRegex.test(formData.email))
      newErrors.email = t("invalid_email");
    if (!formData.role) newErrors.role = t("role_required");

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
      const response = await api.post(
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
      fetchUsers();
      
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t("confirm_delete_user"))) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Delete user error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar role="admin" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <h1 className="text-3xl font-bold text-black">{t("manage_users")}</h1>
          <div className="flex mt-4 space-x-4 sm:mt-0">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center px-4 py-2 text-white bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 transition-all duration-200 ${
                showAddForm ? "bg-blue-800" : ""
              }`}
              disabled={isLoading}
              aria-label={showAddForm ? t("close_form") : t("add_user")}
            >
              <Plus className="w-5 h-5 mr-2" />
              {showAddForm ? t("close_form") : t("add_user")}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 mb-6 bg-white shadow-lg rounded-xl animate-slide-down">
            <h2 className="mb-4 text-2xl font-semibold text-black">
              {t("add_new_user")}
            </h2>
            {apiError && (
              <div
                className="flex items-center justify-between p-4 mb-4 text-black bg-red-100 rounded-lg shadow-md"
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-black"
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
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
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
                    <p
                      id="firstName-error"
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-black"
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
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
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
                    <p
                      id="lastName-error"
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black"
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
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
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
                  className="block text-sm font-medium text-black"
                >
                  {t("role")}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors.role ? "true" : "false"}
                  aria-describedby={errors.role ? "role-error" : undefined}
                  disabled={isLoading}
                  required
                >
                  <option value="patient">{t("patient")}</option>
                  <option value="provider">{t("provider")}</option>
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
                  className={`flex items-center justify-center flex-1 p-3 text-white bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 transition-all duration-200 ${
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
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-200 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
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

        <div className="p-6 bg-white shadow-lg rounded-xl">
          {users.length === 0 ? (
            <p className="text-center text-gray-700">
              {t("no_non_admin_users")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white border-collapse rounded-lg shadow-md">
                <thead>
                  <tr className="text-white bg-blue-900">
                    <th className="p-3 font-semibold text-left">
                      {t("username")}
                    </th>
                    <th className="p-3 font-semibold text-left">{t("role")}</th>
                    <th className="p-3 font-semibold text-left">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`border-t ${
                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      } hover:bg-blue-100 transition-all duration-200`}
                    >
                      <td className="p-3 text-black">{user.username}</td>
                      <td className="p-3 text-black capitalize">
                        {t(user.role)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center px-3 py-1 text-white transition-all duration-200 bg-red-500 rounded-lg shadow-sm hover:bg-red-600 hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t("delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
