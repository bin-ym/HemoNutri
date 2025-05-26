import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Clock, AlertCircle, Send, Inbox } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const ProviderMessagesPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [conversations, setConversations] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const providerId = localStorage.getItem("userId");
  const chatContainerRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("Not authenticated or no user, skipping fetchMessages", { isAuthenticated, user });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching messages for provider:", { providerId, userRole: user.role });
      const res = await api.get("/provider/messages"); // Updated to match /api/provider/messages
      console.log("Fetched provider messages:", res.data);
      const fetchedMessages = Array.isArray(res.data) ? res.data : [];

      const groupedConversations = fetchedMessages.reduce((acc, msg) => {
        const otherPartyId =
          String(msg.sender._id || msg.sender) === String(providerId)
            ? String(msg.recipient._id || msg.recipient)
            : String(msg.sender._id || msg.sender);
        const otherPartyName =
          String(msg.sender._id || msg.sender) === String(providerId)
            ? msg.patientUsername || msg.recipient.username
            : msg.patientUsername || msg.sender.username;

        if (!acc[otherPartyId]) {
          acc[otherPartyId] = {
            otherPartyId,
            otherPartyName,
            messages: [],
            unreadCount: 0,
            lastMessage: msg,
          };
        }
        acc[otherPartyId].messages.push(msg);
        if (!msg.read && String(msg.recipient._id || msg.recipient) === String(providerId)) {
          acc[otherPartyId].unreadCount += 1;
        }
        if (new Date(msg.createdAt) > new Date(acc[otherPartyId].lastMessage.createdAt)) {
          acc[otherPartyId].lastMessage = msg;
        }
        return acc;
      }, {});

      Object.values(groupedConversations).forEach((conv) => {
        conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });

      setConversations(groupedConversations);
      setError("");

      if (selectedConversation) {
        const selectedMessages = groupedConversations[selectedConversation]?.messages || [];
        const unreadMessages = selectedMessages.filter(
          (msg) => !msg.read && String(msg.recipient._id || msg.recipient) === String(providerId)
        );
        if (unreadMessages.length > 0) {
          // No mark-read endpoint for providers; refresh to update state
          await fetchMessages();
        }
      }
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      setError(
        err.response?.status === 404
          ? t("route_not_found", { url: "/api/provider/messages" })
          : err.response?.data?.error || t("failed_load_messages")
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, providerId, selectedConversation, t]);

  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, authLoading, user, providerId });
    if (isAuthenticated && user && !authLoading) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading, fetchMessages, providerId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedConversation, conversations]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? t("date_unavailable") : date.toLocaleString();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const patientId = selectedConversation;
      const res = await api.post(`/provider/message/${patientId}`, { content: newMessage.trim() }); // Updated to /provider/message/:id
      console.log("Sent message response:", res.data);
      setNewMessage("");
      setError("");
      await fetchMessages();
    } catch (err) {
      console.error("Send error:", err.response?.data || err.message);
      setError(err.response?.data?.error || t("failed_send_message"));
    }
  };

  const handleSelectConversation = (otherPartyId) => {
    setSelectedConversation(otherPartyId);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 border-4 border-blue-700 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xl font-semibold text-blue-700 animate-pulse">{t("loading_messages")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 shadow-lg bg-red-50 rounded-xl animate-slide-down">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-lg font-medium text-red-600">{t("not_authenticated")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && Object.keys(conversations).length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <Navbar role="provider" />
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <Navbar
        role="provider"
        unreadCount={Object.values(conversations).reduce((sum, conv) => sum + conv.unreadCount, 0)}
        logout={logout}
      />
      <div className="flex-grow w-full px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-40 bg-blue-700 rounded-b-full -top-12 opacity-10 blur-3xl"></div>
          <h1 className="relative text-3xl font-extrabold text-blue-700 sm:text-4xl lg:text-5xl animate-fade-in">
            {t("messages_title")}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-base text-gray-600 sm:text-lg">
            {t("messages_subtitle")}
          </p>
          <Inbox className="relative w-12 h-12 mx-auto mt-4 text-blue-500 sm:w-14 sm:h-14 animate-bounce-slow" />
        </div>

        {error && Object.keys(conversations).length > 0 && (
          <div className="p-4 mb-8 text-center text-red-600 rounded-lg shadow-md bg-red-50 animate-fade-in">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-6">
          <section className="w-full lg:w-1/3">
            <div className="p-4 bg-white shadow-xl sm:p-6 rounded-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
                <h2 className="text-xl font-bold tracking-tight text-blue-700 sm:text-2xl animate-fade-in">
                  {t("conversations")}
                </h2>
                <MessageSquare className="w-6 h-6 text-blue-500 sm:w-7 sm:h-7 animate-pulse" />
              </div>
              {Object.keys(conversations).length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500">{t("no_conversations")}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {Object.values(conversations).map((conv) => (
                    <li
                      key={conv.otherPartyId}
                      onClick={() => handleSelectConversation(conv.otherPartyId)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedConversation === conv.otherPartyId
                          ? "bg-blue-100 border-blue-300"
                          : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                      } border shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{conv.otherPartyName}</p>
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(conv.lastMessage.createdAt)}</p>
                          {conv.unreadCount > 0 && (
                            <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="w-full lg:w-2/3">
            <div className="p-4 bg-white shadow-xl sm:p-6 rounded-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
                <h2 className="text-xl font-bold tracking-tight text-blue-700 sm:text-2xl animate-fade-in">
                  {selectedConversation
                    ? t("chat_with", { name: conversations[selectedConversation]?.otherPartyName })
                    : t("select_conversation")}
                </h2>
                <Inbox className="w-6 h-6 text-blue-500 sm:w-7 sm:h-7 animate-pulse" />
              </div>
              {selectedConversation ? (
                <>
                  <div ref={chatContainerRef} className="flex flex-col p-4 mb-6 overflow-y-auto rounded h-96 bg-blue-50">
                    {conversations[selectedConversation].messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`mb-4 flex ${
                          String(msg.sender._id || msg.sender) === String(providerId) ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg shadow-md ${
                            String(msg.sender._id || msg.sender) === String(providerId)
                              ? "bg-blue-200 text-gray-800"
                              : "bg-white text-gray-700"
                          } ${msg.isEmergency ? "border border-red-300" : ""}`}
                        >
                          <p>{msg.content}</p>
                          <p className="mt-1 text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                          {msg.isEmergency && <p className="mt-1 text-xs font-semibold text-red-500">{t("emergency")}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t("write_message")}
                      className="w-full p-4 text-gray-700 transition-all duration-300 border border-blue-200 resize-none bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center w-full px-6 py-3 space-x-2 text-white transition-all duration-300 bg-blue-700 shadow-md rounded-xl hover:bg-blue-900 hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                      <span className="font-semibold">{t("send_message")}</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500">{t("select_conversation_start")}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProviderMessagesPage;