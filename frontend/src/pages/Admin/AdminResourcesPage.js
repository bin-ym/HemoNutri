import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Edit, Trash2, Save, X, AlertCircle, Plus } from "lucide-react";

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({ title: "", description: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      setError(err.response?.data?.error || "Failed to load resources");
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
      console.error("Save resource error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to save resource");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(resources.filter((res) => res._id !== resourceId));
    } catch (err) {
      console.error("Delete resource error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to delete resource");
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/admin/resources",
        { ...newResource, providerId: localStorage.getItem("userId") }, // Use logged-in admin as provider
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources([...resources, res.data]);
      setNewResource({ title: "", description: "", url: "" });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Create resource error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create resource");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <div className="max-w-4xl p-6 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            Manage Educational Resources
          </h1>
          <p className="mt-2 text-lg text-teal-600">Edit, remove, or add resources</p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center px-4 py-2 text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showCreateForm ? "Close Form" : "Add Resource"}
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 mb-6 bg-white border border-teal-200 shadow-lg rounded-xl animate-fade-in">
            <h2 className="mb-4 text-2xl font-semibold text-teal-700">
              Create New Resource
            </h2>
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder="Resource Title"
                  className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700">
                  Description
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({ ...newResource, description: e.target.value })
                  }
                  placeholder="Resource Description"
                  className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700">
                  URL
                </label>
                <input
                  type="text"
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder="Resource URL"
                  className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-300 bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Create Resource
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center justify-center flex-1 p-3 text-white transition-all duration-300 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 hover:scale-105"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-teal-700 rounded-full border-t-transparent animate-spin"></div>
            <p className="ml-4 text-xl font-semibold text-teal-700 animate-pulse">
              Loading resources...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 mb-4 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center text-teal-600">
            No resources available. Add some above!
          </p>
        ) : (
          <ul className="space-y-4">
            {resources.map((res) => (
              <li
                key={res._id}
                className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg shadow-md bg-teal-50 hover:bg-teal-100"
              >
                <span className="text-teal-600">
                  <strong>{res.title}:</strong> {res.description} (Provided by{" "}
                  {res.providerId?.username || "Unknown"})
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditResource(res)}
                    className="p-2 text-white transition-all duration-300 bg-teal-700 rounded-lg hover:bg-teal-800 hover:scale-105"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(res._id)}
                    className="p-2 text-white transition-all duration-300 bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
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