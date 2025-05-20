import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { useColors } from '../../theme/ThemeContext';
import { getAuthData } from '../../utils/auth';

type Message = {
  _id: string;
  sender: { _id: string; username: string; role: string };
  recipient: { _id: string; username: string; role: string };
  content: string;
  createdAt: string;
  read: boolean;
};

const ConversationScreen: React.FC = () => {
  const route = useRoute();
  const { userId, username, role } = route.params as { userId: string; username: string; role: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const colors = useColors(); // Get dynamic colors

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const { role } = await getAuthData();
        setCurrentUserRole(role);
      } catch (err) {
        console.error('Error fetching auth data:', err);
        setError('Failed to load user role');
      }
    };
    fetchAuthData();
  }, []);

  useEffect(() => {
    if (!currentUserRole || !userId) {
      console.log('Missing userId or currentUserRole:', { userId, currentUserRole });
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const endpoint =
          currentUserRole === 'patient'
            ? `/api/patient/conversations/${userId}`
            : `/api/provider/messages/${userId}`;
        console.log('Fetching messages from:', endpoint);
        const response = await api.get(endpoint);
        setMessages(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.response?.data?.error || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [userId, currentUserRole]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserRole) return;
    try {
      const endpoint =
        currentUserRole === 'patient'
          ? `/api/patient/message`
          : `/api/provider/message/${userId}`;
      const payload = currentUserRole === 'patient' ? { content: newMessage, recipientId: userId } : { content: newMessage };
      await api.post(endpoint, payload);
      setNewMessage('');
      // Refresh messages
      const response = await api.get(
        currentUserRole === 'patient'
          ? `/api/patient/conversations/${userId}`
          : `/api/provider/messages/${userId}`
      );
      setMessages(response.data);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSentByCurrentUser = item.sender.role === currentUserRole;
    return (
      <View
        style={[
          styles.messageItem,
          isSentByCurrentUser ? styles.messageRight : styles.messageLeft,
          { backgroundColor: isSentByCurrentUser ? '#d1e7dd' : '#e6f0fa' }, // Moved static colors here
        ]}
      >
        <Text style={[styles.messageContent, { color: colors.textPrimary }]}>{item.content}</Text>
        <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  if (loading || !currentUserRole) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="refresh-circle" size={40} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.secondary }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Chat with {username} ({role})</Text>
      </View>

      {error && (
        <View style={[styles.errorMessage, { backgroundColor: colors.errorBackground }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      {messages.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbox-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages yet. Start a conversation!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messageList}
          inverted
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary, backgroundColor: '#fff' }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={sendMessage}
          accessibilityLabel="Send message button"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Static styles that don't depend on colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    marginLeft: 10,
  },
  messageList: {
    flex: 1,
  },
  messageItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '70%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageContent: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  sendButton: {
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
});

export default ConversationScreen;