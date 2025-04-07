import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Plus } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderEducation = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: '', description: '', url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login');
          return;
        }
        const res = await api.get('/provider/education');
        setResources(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        console.error('Fetch resources error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || 'Failed to load resources';
        setError(errorMsg);
        if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [navigate]);

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/provider/education', newResource);
      setResources([...resources, res.data]);
      setNewResource({ title: '', description: '', url: '' });
      setError('');
      alert('Resource added successfully!');
    } catch (err) {
      console.error('Add resource error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add resource');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Educational Resources
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Share knowledge with your patients.
          </p>
          <BookOpen className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>

        {error && !resources.length && (
          <div className="p-6 mb-6 border border-red-200 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Resources */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Your Resources</h2>
              <BookOpen className="w-6 h-6 text-teal-500" />
            </div>
            {resources.length === 0 ? (
              <p className="text-center text-gray-500">No resources available yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {resources.map((resource) => (
                  <div
                    key={resource._id}
                    className="p-4 transition-all duration-300 border border-teal-100 rounded-lg shadow-md bg-teal-50 hover:shadow-xl"
                  >
                    <h3 className="text-lg font-semibold text-teal-700">{resource.title}</h3>
                    <p className="mt-1 text-gray-600">{resource.description}</p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-teal-500 hover:underline"
                    >
                      View Resource
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Add Resource */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Add New Resource</h2>
              <Plus className="w-6 h-6 text-teal-500" />
            </div>
            {error && resources.length > 0 && (
              <p className="mb-4 text-center text-red-500">{error}</p>
            )}
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Resource Title"
                  className="w-full p-3 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Brief description of the resource"
                  className="w-full p-3 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="https://example.com/resource"
                  className="w-full p-3 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full p-3 text-white transition duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700"
              >
                Add Resource
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderEducation;