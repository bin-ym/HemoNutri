import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, AlertCircle, Send, Inbox } from 'lucide-react';
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

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'patient') {
        navigate('/login', { state: { message: 'Please log in as a patient.' } });
        return;
      }
      console.log('Patient ID from localStorage:', patientId);
      const res = await api.get('/patient/messages');
      console.log('Fetched patient messages:', res.data);
      const fetchedMessages = Array.isArray(res.data) ? res.data : [];
      setMessages(fetchedMessages);
      await api.put('/patient/messages/read');
      setError('');
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load messages');
      if (err.response?.data?.error.includes('Token expired') || err.response?.data?.error.includes('Token verification error')) {
        localStorage.clear();
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, patientId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await api.post('/patient/message', { content: newMessage.trim() });
      console.log('Sent message response:', res.data);
      setMessages([res.data, ...messages]);
      setNewMessage('');
      setError('');
      alert('Message sent successfully!');
      await fetchMessages();
    } catch (err) {
      console.error('Send error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleReply = async (msgId) => {
    const content = replyContent[msgId]?.trim();
    if (!content) return;
    try {
      const res = await api.post('/patient/message', { content });
      console.log('Reply sent response:', res.data);
      setMessages([res.data, ...messages]);
      setReplyContent((prev) => ({ ...prev, [msgId]: '' }));
      setError('');
      alert('Reply sent successfully!');
      await fetchMessages();
    } catch (err) {
      console.error('Reply error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xl font-semibold text-teal-700 animate-pulse">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !messages.length) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 shadow-lg bg-red-50 rounded-xl animate-slide-down">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-lg font-medium text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-40 bg-teal-600 rounded-b-full -top-12 opacity-10 blur-3xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">Messages</h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Communicate with your healthcare provider.
          </p>
          <Inbox className="relative mx-auto mt-4 text-teal-500 w-14 h-14 animate-bounce-slow" />
        </div>

        {error && messages.length > 0 && (
          <div className="p-4 mb-8 text-center text-red-600 rounded-lg shadow-md bg-red-50 animate-fade-in">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">New Message</h2>
              <MessageSquare className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full p-4 text-gray-700 bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 resize-none"
                rows="4"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center w-full px-6 py-3 space-x-2 text-white bg-gradient-to-r from-teal-500 to-teal-700 rounded-xl shadow-md hover:from-teal-600 hover:to-teal-800 transition-all duration-300 hover:scale-105"
              >
                <Send className="w-5 h-5" />
                <span className="font-semibold">Send Message</span>
              </button>
            </form>
          </div>
        </section>

        <section className="mb-12">
          <div className="p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Conversation</h2>
              <Inbox className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500">No messages yet</p>
              </div>
            ) : (
              <ul className="space-y-6">
                {messages.map((msg) => {
                  console.log('Rendering message:', {
                    msgId: msg._id,
                    sender: msg.sender,
                    patientId: patientId,
                    isSenderPatient: String(msg.sender._id || msg.sender) === String(patientId),
                    providerUsername: msg.providerUsername,
                    patientUsername: msg.patientUsername,
                  });
                  return (
                    <li
                      key={msg._id}
                      className={`p-4 rounded-xl shadow-md transition-all duration-300 ${msg.isEmergency ? 'border-red-300 bg-red-50' : 'border-teal-200 bg-teal-50 hover:bg-teal-100'}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800">
                            {String(msg.sender._id || msg.sender) === String(patientId)
                              ? `You: ${msg.patientUsername}`
                              : `Provider: ${msg.providerUsername}`}
                            {msg.isEmergency && <span className="ml-2 font-bold text-red-500">🚨 Emergency</span>}
                          </p>
                          <span className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{msg.content}</p>
                        {String(msg.recipient._id || msg.recipient) === String(patientId) && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleReply(msg._id);
                            }}
                            className="flex mt-3 space-x-3"
                          >
                            <input
                              type="text"
                              value={replyContent[msg._id] || ''}
                              onChange={(e) => setReplyContent({ ...replyContent, [msg._id]: e.target.value })}
                              placeholder="Reply to this message..."
                              className="flex-1 p-3 text-gray-700 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                            />
                            <button
                              type="submit"
                              className="p-3 text-white bg-teal-600 rounded-xl shadow-md hover:bg-teal-700 transition-all duration-300 hover:scale-105"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </form>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientMessagesPage;