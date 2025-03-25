import { useEffect, useState } from 'react';
import api from '../../services/api';

const Education = () => {
  const [resources, setResources] = useState([]);

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

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Educational Resources</h2>
      <ul className="space-y-4">
        {resources.map((res) => (
          <li key={res._id} className="text-gray-700">
            <h3 className="font-medium">{res.title}</h3>
            <p>{res.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Education;