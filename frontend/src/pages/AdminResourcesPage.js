import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/admin/resources', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResources(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResources();
  }, []);

  const handleEditResource = (resource) => {
    setEditingResource(resource);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await api.put(
        `/admin/resources/${editingResource._id}`,
        editingResource,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(resources.map((r) => (r._id === res.data._id ? res.data : r)));
      setEditingResource(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }); // Fixed: Added closing curly brace before closing parenthesis
      setResources(resources.filter((res) => res._id !== resourceId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="admin" />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Educational Resources</h1>
        {resources.length === 0 ? (
          <p>No resources available. Add some from the Dashboard.</p>
        ) : editingResource ? (
          <form onSubmit={handleSaveResource} className="mt-4 space-y-4">
            <input
              type="text"
              value={editingResource.title}
              onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
              placeholder="Resource Title"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={editingResource.content}
              onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
              placeholder="Resource Content"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingResource(null)}
                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <ul className="mt-4 space-y-2">
            {resources.map((res) => (
              <li key={res._id} className="p-2 bg-gray-100 rounded shadow-sm flex justify-between items-center">
                <span>
                  {res.title}: {res.content} (Added by {res.createdBy?.username || 'Unknown'})
                </span>
                <div>
                  <button
                    onClick={() => handleEditResource(res)}
                    className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteResource(res._id)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    Delete
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