import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, AlertOctagon, Send, Inbox } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderMessagesPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const providerId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login', { state: { message: 'Please log in as a provider.' } });
          return;
        }
        console.log('Provider ID:', providerId);
        const res = await api.get('/provider/messages');
        console.log('Fetched provider messages:', res.data);
        setMessages(Array.isArray(res.data) ? res.data : []);
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
    };
    fetchMessages();
  }, [navigate, providerId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const handleReply = async (msgId, recipientId) => {
    const content = replyContent[msgId]?.trim();
    if (!content) return;
    try {
      const res = await api.post(`/provider/message/${recipientId}`, { content });
      console.log('Reply sent:', res.data);
      setMessages([res.data, ...messages]);
      setReplyContent((prev) => ({ ...prev, [msgId]: '' }));
      setError('');
      alert('Reply sent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const sentMessages = messages.filter((msg) => String(msg.sender?._id || msg.sender) === String(providerId));
  const receivedMessages = messages.filter((msg) => String(msg.recipient?._id || msg.recipient) === String(providerId));

  console.log('Sent Messages:', sentMessages);
  console.log('Received Messages:', receivedMessages);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
        <Navbar role="provider" />
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
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 shadow-lg bg-red-50 rounded-xl animate-slide-down">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="w-8 h-8 text-red-500" />
              <p className="text-lg font-medium text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-40 bg-teal-600 rounded-b-full -top-12 opacity-10 blur-3xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">Messages</h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Communicate with your patients.
          </p>
          <Inbox className="relative mx-auto mt-4 text-teal-500 w-14 h-14 animate-bounce-slow" />
        </div>

        {error && messages.length > 0 && (
          <div className="p-4 mb-8 text-center text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
            <div className="flex items-center justify-center space-x-2">
              <AlertOctagon className="w-6 h-6" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Inbox</h2>
              <Inbox className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            {receivedMessages.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <Inbox className="w-6 h-6 mr-2" /> No new messages
              </p>
            ) : (
              <ul className="space-y-6">
                {receivedMessages.map((msg) => (
                  <li
                    key={msg._id}
                    className={`p-4 bg-teal-50 border ${msg.isEmergency ? 'border-red-300' : 'border-teal-200'} rounded-lg shadow-md hover:bg-teal-100 transition-all duration-300`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800">
                          <span className="text-teal-600">From:</span>{' '}
                          {msg.patientUsername || msg.sender?.username || 'Patient'}
                          {msg.isEmergency && <span className="ml-2 font-bold text-red-500">🚨 Emergency</span>}
                        </p>
                        <span className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{msg.content}</p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReply(msg._id, msg.sender?._id || msg.sender);
                        }}
                        className="flex mt-3 space-x-3"
                      >
                        <input
                          type="text"
                          value={replyContent[msg._id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [msg._id]: e.target.value })}
                          placeholder="Reply to this message..."
                          className="flex-1 p-3 transition-all duration-200 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="submit"
                          className="p-3 text-white transition-all duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105"
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

        <section className="mb-12">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Sent</h2>
              <MessageSquare className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            {sentMessages.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <MessageSquare className="w-6 h-6 mr-2" /> No sent messages
              </p>
            ) : (
              <ul className="space-y-6">
                {sentMessages.map((msg) => (
                  <li
                    key={msg._id}
                    className={`p-4 bg-teal-50 border ${msg.isEmergency ? 'border-red-300' : 'border-teal-200'} rounded-lg shadow-md hover:bg-teal-100 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-800">
                          <span className="text-teal-600">To:</span>{' '}
                          {msg.patientUsername || msg.recipient?.username || 'Patient'}
                          {msg.isEmergency && <span className="ml-2 font-bold text-red-500">🚨 Emergency</span>}
                        </p>
                        <p className="text-gray-700">{msg.content}</p>
                      </div>
                      <span className="flex items-center text-sm text-gray-500">
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

export default ProviderMessagesPage;