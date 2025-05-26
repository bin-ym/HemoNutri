import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { BookOpen, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const ProviderEducation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: "", description: "", url: "" });
  const [editingResource, setEditingResource] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "provider") {
          navigate("/login", { state: { message: t("please_login_access_page") } });
          return;
        }
        const res = await api.get("/provider/education", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResources(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Fetch resources error:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || t("education_error_load");
        setError(errorMsg);
        if (errorMsg.includes("Token expired") || errorMsg.includes("Token verification error")) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login", { state: { message: t("session_expired") } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [navigate, t]);

  const handleResourceSubmit = async (e) => {
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
      const res = await api.post(
        "/provider/education",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources([...resources, res.data]);
      setNewResource({ title: "", description: "", url: "" });
      setShowModal(false);
      setError("");
      alert(t("resource_added"));
    } catch (err) {
      console.error("Add resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "education_add_error"));
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setNewResource({ title: resource.title, description: resource.description, url: resource.url || "" });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: newResource.title,
        description: newResource.description,
      };
      if (newResource.url) {
        payload.url = newResource.url;
      }
      const res = await api.put(
        `/provider/education/${editingResource._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(
        resources.map((r) => (r._id === res.data._id ? res.data : r))
      );
      setEditingResource(null);
      setNewResource({ title: "", description: "", url: "" });
      setShowModal(false);
      setIsEditing(false);
      setError("");
      alert(t("resource_updated"));
    } catch (err) {
      console.error("Edit resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "education_edit_error"));
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm(t("confirm_delete_resource"))) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/provider/education/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(resources.filter((res) => res._id !== resourceId));
      setError("");
      alert(t("resource_deleted"));
    } catch (err) {
      console.error("Delete resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "education_delete_error"));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-black animate-pulse">{t("education_loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-blue-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-3xl font-extrabold text-black sm:text-4xl md:text-5xl animate-fade-in">
            {t("Educational Resource")}
          </h1>
          <BookOpen className="relative w-12 h-12 mx-auto mt-4 text-blue-500 animate-bounce-slow" />
        </div>

        {error && (
          <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-black sm:text-2xl">{t("Resources")}</h2>
                <BookOpen className="w-6 h-6 ml-2 text-blue-500" />
              </div>
              <button
                onClick={() => {
                  setShowModal(true);
                  setIsEditing(false);
                  setNewResource({ title: "", description: "", url: "" });
                }}
                className="flex items-center px-4 py-2 font-semibold text-white transition-all duration-300 bg-blue-700 rounded-full hover:bg-blue-900 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("add_resource")}
              </button>
            </div>
            {resources.length === 0 ? (
              <p className="text-center text-gray-500">{t("No resources found")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {resources.map((resource) => (
                  <div
                    key={resource._id}
                    className="p-4 transition-all duration-300 border border-blue-100 rounded-lg shadow-md bg-blue-50 hover:shadow-xl hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-black">{resource.title}</h3>
                        <p className="mt-1 text-gray-600">{resource.description}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 font-semibold text-black hover:underline"
                          >
                            {t("view_resource")}
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="p-2 text-white transition-all duration-200 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource._id)}
                          className="p-2 text-white transition-all duration-200 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:scale-105"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-2xl animate-fade-in">
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setNewResource({ title: "", description: "", url: "" });
                  setEditingResource(null);
                }}
                className="absolute text-gray-500 top-4 right-4 hover:text-gray-700"
              >
                ✕
              </button>
              <h3 className="mb-4 text-xl font-bold text-black">
                {isEditing ? t("edit_resource") : t("Add new resource")}
              </h3>
              <form onSubmit={isEditing ? handleSaveEdit : handleResourceSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("resource_title")}</label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    placeholder={t("resource_title_placeholder")}
                    className="w-full p-3 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("Description")}</label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    placeholder={t("description_placeholder")}
                    className="w-full p-3 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("URL")} <span className="text-gray-500">({t("optional")})</span>
                  </label>
                  <input
                    type="text"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder={t("url_placeholder")}
                    className="w-full p-3 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setNewResource({ title: "", description: "", url: "" });
                      setEditingResource(null);
                    }}
                    className="px-4 py-2 text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-semibold text-white transition duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900"
                  >
                    {isEditing ? t("save_resource") : t("save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderEducation;