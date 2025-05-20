import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { getAuthData } from '../../utils/auth';
import { useColors } from '../../theme/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
  ManageMealPlans: undefined;
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
  Messages: undefined;
  Conversation: { userId: string; username: string; role: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Conversation'>;

type Patient = {
  id: string;
  username: string;
  email: string;
};

type Message = {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  isEmergency: boolean;
};

const ConversationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { userId: patientId, username, role } = route.params as { userId: string; username: string; role: string };
  const [providerId, setProviderId] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const colors = useColors();

  // Debug log to verify colors
  console.log('ConversationScreen - Colors:', colors);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authData = await getAuthData();
      const userId = authData.userId ?? '';
      setProviderId(userId);

      const [patientResponse, messagesResponse] = await Promise.all([
        api.get(`/api/provider/patient/${patientId}`),
        api.get(`/api/provider/messages/${patientId}`),
      ]);

      setPatient({
        id: patientResponse.data._id,
        username: patientResponse.data.username,
        email: patientResponse.data.email,
      });

      setMessages(
        messagesResponse.data.map((msg: any) => ({
          id: msg._id,
          senderId: msg.sender._id,
          senderUsername: msg.sender.username,
          content: msg.content,
          createdAt: msg.createdAt,
          isEmergency: msg.isEmergency || false,
        }))
      );
      setError('');
    } catch (err) {
      console.error('Fetch data error:', (err as Error).message);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

    try {
      const response = await api.post(`/api/provider/message/${patientId}`, {
        content: newMessage,
        isEmergency,
      });
      setMessages([
        ...messages,
        {
          id: response.data._id,
          senderId: providerId,
          senderUsername: 'You',
          content: newMessage,
          createdAt: response.data.createdAt,
          isEmergency,
        },
      ]);
      setNewMessage('');
      setIsEmergency(false);
      Alert.alert('Success', 'Message sent successfully!');
      setError('');
    } catch (err) {
      console.error('Send message error:', (err as Error).message);
      setError('Failed to send message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Date unavailable'
      : date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const renderMessage = (item: Message) => (
    <View
      style={[
        styles.messageCard,
        item.senderId === providerId ? styles.messageRight : styles.messageLeft,
        item.isEmergency && { borderColor: colors.danger, backgroundColor: colors.errorBackground },
        { backgroundColor: item.senderId === providerId ? '#c8e6c9' : '#e0f7fa' }, // Moved static colors here
      ]}
    >
      <Text style={[styles.messageSender, { color: colors.textPrimary }]}>
        {item.senderId === providerId ? 'You' : item.senderUsername}
        {item.isEmergency && <Text style={[styles.emergencyLabel, { color: colors.danger }]}> 🚨 Emergency</Text>}
      </Text>
      <Text style={[styles.messageContent, { color: colors.textPrimary }]}>{item.content}</Text>
      <Text style={[styles.messageDate, { color: colors.textSecondary }]}>
        <Ionicons name="time-outline" size={12} color={colors.textSecondary} /> {formatDate(item.createdAt)}
      </Text>
    </View>
  );

  if (!colors || !colors.background) {
    console.error('Colors are undefined in ConversationScreen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Error: Theme not loaded. Please restart the app.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchData}
          accessibilityLabel="Retry loading conversation"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.secondary }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Conversation with {patient?.username || 'Patient'}</Text>
      </View>
      {error && (
        <View style={[styles.errorMessage, { backgroundColor: colors.errorBackground }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}
      <FlatList
        data={messages.slice().reverse()}
        renderItem={({ item }) => renderMessage(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        inverted
      />
      <View style={[styles.messageInputContainer, { backgroundColor: colors.background, borderTopColor: colors.secondary }]}>
        <TextInput
          style={[styles.messageInput, { borderColor: colors.secondary, color: colors.textPrimary, backgroundColor: colors.secondary }]}
          placeholder="Type your message here..."
          placeholderTextColor={colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={[styles.emergencyToggle, { borderColor: colors.secondary, backgroundColor: colors.secondary }, isEmergency && { backgroundColor: colors.danger, borderColor: colors.danger }]}
          onPress={() => setIsEmergency(!isEmergency)}
          accessibilityLabel={isEmergency ? "Disable emergency mode" : "Enable emergency mode"}
        >
          <Ionicons
            name="warning-outline"
            size={24}
            color={isEmergency ? colors.danger : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
          accessibilityLabel="Send message button"
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Static styles that don't depend on colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  emergencyLabel: {
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '400',
  },
  messageContent: {
    fontSize: 16,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    minHeight: 50,
    maxHeight: 100,
    marginRight: 10,
  },
  emergencyToggle: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  sendButton: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ConversationScreen;