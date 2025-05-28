// frontend/src/pages/ProviderEducation.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, AlertCircle, Plus, Edit, Trash2, Save, X } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const ProviderEducation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: "", description: "", url: "" });
  const [editingResource, setEditingResource] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      if (!isAuthenticated || !user || user.role !== "provider") {
        navigate("/login", { state: { message: t("please_login_access_page") } });
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/provider/education");
        console.log("Fetched resources:", res.data);
        setResources(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Fetch resources error:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || t("education_error_load");
        setError(errorMsg);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login", { state: { message: t("session_expired") } });
        }
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchResources();
    }
  }, [navigate, t, isAuthenticated, user, authLoading]);

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const payload = {
        title: newResource.title.trim(),
        description: newResource.description.trim(),
        url: newResource.url.trim() || undefined,
      };
      console.log("Creating resource payload:", payload);
      const res = await api.post("/provider/education", payload);
      setResources([...resources, res.data]);
      setNewResource({ title: "", description: "", url: "" });
      setShowModal(false);
      setError("");
      alert(t("resource_added"));
    } catch (err) {
      console.error("Add resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "education_add_error"));
    } finally {
      setIsSubmitting(false);
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
    setIsSubmitting(true);
    try {
      const payload = {
        title: newResource.title.trim(),
        description: newResource.description.trim(),
        url: newResource.url.trim() || undefined,
      };
      console.log("Editing resource payload:", payload);
      const res = await api.put(`/provider/education/${editingResource._id}`, payload);
      setResources(resources.map((r) => (r._id === res.data._id ? res.data : r)));
      setEditingResource(null);
      setNewResource({ title: "", description: "", url: "" });
      setShowModal(false);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Edit resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "education_edit_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm(t("confirm_delete_resource"))) return;
    setError("");
    setIsSubmitting(true);
    try {
      console.log("Deleting resource:", resourceId);
      await api.delete(`/provider/education/${resourceId}`);
      setResources(resources.filter((res) => res._id !== resourceId));
      setError("");
    } catch (err) {
      console.error("Delete resource error:", err.response?.data || err.message);
      setError(t(err.response?.data?.error || "education_delete_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
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
      <div className="flex-grow max-w-4xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-blue-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-3xl font-extrabold text-gray-900 sm:text-4xl animate-fade-in">
            {t("educational_resource")}
          </h1>
          <BookOpen className="relative w-12 h-12 mx-auto mt-4 text-blue-500 animate-bounce-slow" />
        </div>

        {error && (
          <div className="flex items-center p-4 mb-6 space-x-2 border border-red-200 rounded-lg bg-red-50 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">{t("resources")}</h2>
                <BookOpen className="w-6 h-6 ml-2 text-blue-500" />
              </div>
              <button
                onClick={() => {
                  setShowModal(true);
                  setIsEditing(false);
                  setNewResource({ title: "", description: "", url: "" });
                }}
                className="flex items-center px-4 py-2 text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
                disabled={isSubmitting}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("add_resource")}
              </button>
            </div>
            {resources.length === 0 ? (
              <p className="text-center text-gray-600">{t("no_resources_found")}</p>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource._id}
                    className="p-4 transition-all duration-300 bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                        <p className="mt-1 text-gray-600">{resource.description}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-blue-600 hover:underline"
                          >
                            {t("view_resource")}
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="p-2 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105"
                          disabled={isSubmitting}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource._id)}
                          className="p-2 text-white transition-all duration-200 bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
                          disabled={isSubmitting}
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
            <div className="w-full max-w-md p-6 bg-white border border-gray-100 shadow-lg rounded-xl animate-slide-down">
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setNewResource({ title: "", description: "", url: "" });
                  setEditingResource(null);
                }}
                className="absolute text-gray-500 top-4 right-4 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="mb-6 text-2xl font-semibold text-gray-900">
                {isEditing ? t("edit_resource") : t("add_new_resource")}
              </h3>
              <form onSubmit={isEditing ? handleSaveEdit : handleResourceSubmit} className="space-y-6">
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("resource_title")}</label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    placeholder={t("resource_title_placeholder")}
                    className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("description")}</label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    placeholder={t("description_placeholder")}
                    className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("url")} <span className="text-gray-500">({t("optional")})</span>
                  </label>
                  <input
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder={t("url_placeholder")}
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
                    {isEditing ? t("save_resource") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setNewResource({ title: "", description: "", url: "" });
                      setEditingResource(null);
                    }}
                    className="flex items-center justify-center flex-1 px-4 py-2 text-gray-700 transition-all duration-300 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 hover:scale-105"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5 mr-2" />
                    {t("cancel")}
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