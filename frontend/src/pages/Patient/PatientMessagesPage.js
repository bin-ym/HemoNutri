import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, AlertCircle, Send } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const PatientMessagesPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'patient') {
          navigate('/login');
          return;
        }
        const res = await api.get('/patient/messages');
        setMessages(Array.isArray(res.data) ? res.data : []);
        setError('');
        // Mark messages as read (optional, requires backend support)
        await api.put('/patient/messages/read');
      } catch (err) {
        console.error('Fetch messages error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || 'Failed to load messages';
        setError(errorMsg);
        if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/patient/message', { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
      setError('');
      alert('Message sent successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send message';
      console.error('Send message error:', err.response?.data || err.message);
      setError(errorMsg);
      if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
      }
    }
  };

  const handleReply = async (msgId, providerId) => {
    try {
      const content = replyContent[msgId] || '';
      if (!content.trim()) return;
      const res = await api.post('/patient/message', { content, providerId });
      setMessages([...messages, res.data]);
      setReplyContent((prev) => ({ ...prev, [msgId]: '' }));
      setError('');
      alert('Reply sent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const sentMessages = messages.filter((msg) => msg.sender._id === patientId);
  const receivedMessages = messages.filter((msg) => msg.recipient._id === patientId);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !messages.length) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 border border-red-200 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Messages
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Stay in touch with your provider.
          </p>
          <MessageSquare className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>

        {error && messages.length > 0 && (
          <div className="p-4 mb-6 text-center text-red-500 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Send New Message */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Send a Message</h2>
              <MessageSquare className="w-6 h-6 text-teal-500" />
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center w-full p-3 text-white transition duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Received Messages */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Received Messages</h2>
              <MessageSquare className="w-6 h-6 text-teal-500" />
            </div>
            {receivedMessages.length === 0 ? (
              <p className="text-center text-gray-500">No messages received yet.</p>
            ) : (
              <ul className="space-y-4">
                {receivedMessages.map((msg) => (
                  <li
                    key={msg._id}
                    className="p-4 transition-all duration-300 border border-teal-100 rounded-lg shadow-md bg-teal-50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700">
                          <strong>From:</strong> {msg.providerUsername || 'Provider'}
                        </p>
                        <span className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{msg.content}</p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReply(msg._id, msg.sender._id);
                        }}
                        className="flex mt-2 space-x-2"
                      >
                        <input
                          type="text"
                          value={replyContent[msg._id] || ''}
                          onChange={(e) =>
                            setReplyContent({ ...replyContent, [msg._id]: e.target.value })
                          }
                          placeholder="Type your reply..."
                          className="flex-1 p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="submit"
                          className="p-2 text-white transition duration-300 bg-teal-600 rounded hover:bg-teal-700"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Sent Messages */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Sent Messages</h2>
              <MessageSquare className="w-6 h-6 text-teal-500" />
            </div>
            {sentMessages.length === 0 ? (
              <p className="text-center text-gray-500">No messages sent yet.</p>
            ) : (
              <ul className="space-y-4">
                {sentMessages.map((msg) => (
                  <li
                    key={msg._id}
                    className="p-4 transition-all duration-300 border border-teal-100 rounded-lg shadow-md bg-teal-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700">
                          <strong>To:</strong> {msg.providerUsername || 'Provider'}
                        </p>
                        <p className="text-gray-700">{msg.content}</p>
                      </div>
                      <span className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientMessagesPage; 