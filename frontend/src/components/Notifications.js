import { useEffect, useState } from 'react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="mt-2 text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {notifications.map((note) => (
            <li
              key={note._id}
              className={`p-2 rounded shadow-sm ${note.read ? 'bg-gray-100' : 'bg-yellow-100'}`}
            >
              <div className="font-semibold">{note.title}</div>
              <div>{note.message}</div>
              <div className="text-sm text-gray-600">
                From: {note.sender?.username || 'Unknown'} |{' '}
                {new Date(note.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;