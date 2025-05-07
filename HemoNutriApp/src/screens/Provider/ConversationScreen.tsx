import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { getAuthData } from '../../utils/auth';
import { colors } from '../../theme/colors';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
  ManageMealPlans: undefined;
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
  Messages: undefined;
  Conversation: { patientId: string };
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
  const { patientId } = route.params as { patientId: string };
  const [providerId, setProviderId] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        item.isEmergency ? styles.emergencyMessage : null,
      ]}
    >
      <Text style={styles.messageSender}>
        {item.senderId === providerId ? 'You' : item.senderUsername}
        {item.isEmergency && <Text style={styles.emergencyLabel}> 🚨 Emergency</Text>}
      </Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageDate}>
        <Ionicons name="time-outline" size={12} color={colors.textSecondary} /> {formatDate(item.createdAt)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversation with {patient?.username || 'Patient'}</Text>
      </View>
      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={messages.slice().reverse()}
        renderItem={({ item }) => renderMessage(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        inverted
      />
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message here..."
          placeholderTextColor={colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.emergencyToggle, isEmergency ? styles.emergencyToggleActive : null]}
          onPress={() => setIsEmergency(!isEmergency)}
        >
          <Ionicons
            name="warning-outline"
            size={24}
            color={isEmergency ? colors.danger : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    color: colors.primary,
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
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
    color: colors.danger,
    marginLeft: 10,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: colors.primary,
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
    backgroundColor: '#e0f7fa',
    alignSelf: 'flex-start',
  },
  messageRight: {
    backgroundColor: '#c8e6c9',
    alignSelf: 'flex-end',
  },
  emergencyMessage: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: '#ffcccb',
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  emergencyLabel: {
    color: colors.danger,
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    fontWeight: '400',
  },
  messageContent: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
    maxHeight: 100,
    marginRight: 10,
  },
  emergencyToggle: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  emergencyToggleActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  sendButton: {
    backgroundColor: colors.primary,
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