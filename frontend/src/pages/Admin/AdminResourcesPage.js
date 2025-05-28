// frontend/src/pages/AdminResourcesPage.js
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Edit, Trash2, Save, X, AlertCircle, Plus } from "lucide-react";

const AdminResourcesPage = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({ title: "", description: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched resources:", res.data);
      setResources(res.data);
    } catch (err) {
      console.error("Resources fetch error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "failed_load_resources"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleEditResource = (resource) => {
    setEditingResource({
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      url: resource.url || "",
      providerId: resource.providerId?._id || resource.providerId,
    });
    console.log("Editing resource:", resource);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: editingResource.title,
        description: editingResource.description,
        url: editingResource.url || undefined,
        providerId: editingResource.providerId,
      };
      console.log("Saving resource payload:", payload);
      const res = await api.put(
        `/admin/resources/${editingResource._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(
        resources.map((r) => (r._id === res.data._id ? res.data : r))
      );
      setEditingResource(null);
    } catch (err) {
      console.error("Save resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "failed_save_resource"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm(t("confirm_delete_resource"))) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(resources.filter((res) => res._id !== resourceId));
    } catch (err) {
      console.error("Delete resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "failed_delete_resource"));
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: newResource.title,
        description: newResource.description,
        providerId: localStorage.getItem("userId"),
        url: newResource.url ? newResource.url : undefined,
      };
      console.log("Creating resource payload:", payload);
      const res = await api.post(
        "/admin/resources",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources([...resources, res.data]);
      setNewResource({ title: "", description: "", url: "" });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Create resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "failed_create_resource"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <div className="flex-grow max-w-4xl p-6 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl animate-fade-in">
            {t("manage_educational_resources")}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t("edit_remove_add_resources")}
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center px-4 py-2 text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
            disabled={isSubmitting}
          >
            <Plus className="w-5 h-5 mr-2" />
            {showCreateForm ? t("close_form") : t("add_resource")}
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 mb-8 bg-white border border-gray-100 shadow-lg rounded-xl animate-slide-down">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              {t("create_new_resource")}
            </h2>
            <form onSubmit={handleCreateResource} className="space-y-6">
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("resource_title")}
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder={t("resource_title")}
                  className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("resource_description")}
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({ ...newResource, description: e.target.value })
                  }
                  placeholder={t("resource_description")}
                  className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="5"
                  required
                />
              </div>
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("resource_url")} <span className="text-gray-500">({t("optional")})</span>
                </label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder={t("resource_url")}
                  className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 px-4 py-2 text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg className="w-5 h-5 mr-2 text-white animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {t("create_resource")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center justify-center flex-1 px-4 py-2 text-gray-700 transition-all duration-300 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 hover:scale-105"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {editingResource && (
          <div className="p-6 mb-8 bg-white border border-gray-100 shadow-lg rounded-xl animate-slide-down">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              {t("edit_resource")}
            </h2>
            <form onSubmit={handleSaveResource} className="space-y-6">
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("resource_title")}
                </label>
                <input
                  type="text"
                  value={editingResource.title}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, title: e.target.value })
                  }
                  placeholder={t("resource_title")}
                  className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("resource_description")}
                </label>
                <textarea
                  value={editingResource.description}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, description: e.target.value })
                  }
                  placeholder={t("resource_description")}
                  className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="5"
                  required
                />
              </div>
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t("resource_url")} <span className="text-gray-500">({t("optional")})</span>
                </label>
                <input
                  type="url"
                  value={editingResource.url}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, url: e.target.value })
                  }
                  placeholder={t("resource_url")}
                  className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 px-4 py-2 text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg className="w-5 h-5 mr-2 text-white animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {t("save_resource")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="flex items-center justify-center flex-1 px-4 py-2 text-gray-700 transition-all duration-300 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 hover:scale-105"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="flex items-center p-4 mb-6 space-x-2 border border-red-200 rounded-lg bg-red-50 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-12 h-12 text-blue-600 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="ml-4 text-xl font-medium text-gray-900">
              {t("loading_resources")}
            </p>
          </div>
        ) : resources.length === 0 ? (
          <p className="text-lg text-center text-gray-600">
            {t("no_resources_available")}
          </p>
        ) : (
          <ul className="space-y-4">
            {resources.map((res) => (
              <li
                key={res._id}
                className="flex items-center justify-between p-4 transition-all duration-300 bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg"
              >
                <span className="text-gray-900">
                  <strong className="font-semibold">{res.title}:</strong> {res.description} ({t("provider")}:{" "}
                  {res.providerId?.username || "Unknown"})
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditResource(res)}
                    className="p-2 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(res._id)}
                    className="p-2 text-white transition-all duration-200 bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminResourcesPage;