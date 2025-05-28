import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Edit, Trash2, Save, X, AlertCircle, Plus } from "lucide-react";

const AdminResourcesPage = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    console.log("AdminResourcesPage: Token before fetch", { token });
    try {
      const res = await api.get("/admin/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched resources:", res.data);
      setResources(res.data);
    } catch (err) {
      console.error(
        "Resources fetch error:",
        err.response?.data || err.message
      );
      setError(t(err.response?.data?.error || "failed_load_resources"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleEditResource = (resource) => {
    setEditingResource({ ...resource });
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await api.put(
        `/admin/resources/${editingResource._id}`,
        editingResource,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(
        resources.map((r) => (r._id === res.data._id ? res.data : r))
      );
      setEditingResource(null);
    } catch (err) {
      console.error("Save resource error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(t(err.response?.data?.error || "failed_save_resource"));
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm(t("confirm_delete_resource"))) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await api.delete(`/admin/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(resources.filter((res) => res._id !== resourceId));
    } catch (err) {
      console.error("Delete resource error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(t(err.response?.data?.error || "failed_delete_resource"));
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: newResource.title,
        description: newResource.description,
        providerId: localStorage.getItem("userId"),
      };
      if (newResource.url) {
        payload.url = newResource.url;
      }
      const res = await api.post("/admin/resources", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources([...resources, res.data]);
      setNewResource({ title: "", description: "", url: "" });
      setShowCreateForm(false);
    } catch (err) {
      console.error(
        "Create resource error:",
        err.response?.data || err.message
      );
      setError(t(err.response?.data?.error || "failed_create_resource"));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar role="admin" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-black sm:text-4xl animate-fade-in">
            {t("manage_educational_resources")}
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            {t("edit_remove_add_resources")}
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`flex items-center px-4 py-2 text-white bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105 transition-all duration-200 ${
              showCreateForm ? "bg-blue-800" : ""
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            {showCreateForm ? t("close_form") : t("add_resource")}
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 mb-6 bg-white shadow-lg rounded-xl animate-slide-down">
            <h2 className="mb-4 text-2xl font-semibold text-black">
              {t("create_new_resource")}
            </h2>
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("resource_title")}
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder={t("resource_title")}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("resource_description")}
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("resource_description")}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("resource_url")}{" "}
                  <span className="text-gray-500">({t("optional")})</span>
                </label>
                <input
                  type="text"
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder={t("resource_url")}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-200 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {t("create_resource")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-200 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {editingResource && (
          <div className="p-6 mb-6 bg-white shadow-lg rounded-xl animate-slide-down">
            <h2 className="mb-4 text-2xl font-semibold text-black">
              {t("edit_resource")}
            </h2>
            <form onSubmit={handleSaveResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("resource_title")}
                </label>
                <input
                  type="text"
                  value={editingResource.title}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      title: e.target.value,
                    })
                  }
                  placeholder={t("resource_title")}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("resource_description")}
                </label>
                <textarea
                  value={editingResource.description}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("resource_description")}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("resource_url")}{" "}
                  <span className="text-gray-500">({t("optional")})</span>
                </label>
                <input
                  type="text"
                  value={editingResource.url}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      url: e.target.value,
                    })
                  }
                  placeholder={t("resource_url")}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-200 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {t("save_resource")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-200 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-900 rounded-full border-t-transparent animate-spin"></div>
            <p className="ml-4 text-xl font-semibold text-black animate-pulse">
              {t("loading_resources")}
            </p>
          </div>
        ) : error ? (
          <div className="p-4 mb-4 bg-red-100 border border-red-300 rounded-lg shadow-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-black">{error}</p>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center text-gray-700">
            {t("no_resources_available")}
          </p>
        ) : (
          <ul className="space-y-4">
            {resources.map((res) => (
              <li
                key={res._id}
                className="flex items-center justify-between p-4 transition-all duration-200 rounded-lg shadow-md bg-blue-50 hover:bg-blue-100"
              >
                <span className="text-black">
                  <strong>{res.title}:</strong> {res.description} (
                  {t("provider")}: {res.providerId?.username || "Unknown"})
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditResource(res)}
                    className="p-2 text-white transition-all duration-200 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(res._id)}
                    className="p-2 text-white transition-all duration-200 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:scale-105"
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
