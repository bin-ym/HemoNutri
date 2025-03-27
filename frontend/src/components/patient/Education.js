import { useEffect, useState } from 'react';
import api from '../../services/api'; // Updated path

const Education = () => {
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Education token:', token); // Debug
        if (!token) throw new Error('Not logged in');
        const res = await api.get('/patient/resources', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Resources fetched:', res.data); // Debug
        setResources(res.data);
      } catch (err) {
        console.error('Education fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load resources');
      }
    };
    fetchResources();
  }, []);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Educational Resources</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500">No resources available.</p>
      ) : (
        <ul className="space-y-4">
          {resources.map((res) => (
            <li key={res._id} className="text-gray-700">
              <h3 className="font-medium">{res.title}</h3>
              <p>{res.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Education;