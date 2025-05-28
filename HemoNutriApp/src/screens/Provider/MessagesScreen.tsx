import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../../api/api';

type RootStackParamList = {
  ProviderConversation: { patientId: string; patientUsername: string };
};

type MessagesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Message = {
  _id: string;
  content: string;
  sender: { _id: string; username: string; role: string };
  recipient: { _id: string; username: string; role: string };
  createdAt: string;
};

const MessagesScreen: React.FC = () => {
  const { colors } = useColors();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/provider/messages');
      setMessages(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load messages');
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const otherUser = item.sender.role === 'provider' ? item.recipient : item.sender;
    return (
      <TouchableOpacity
        style={[styles.messageItem, { backgroundColor: colors.secondary }]}
        onPress={() => navigation.navigate('ProviderConversation', { patientId: otherUser._id, patientUsername: otherUser.username })}
      )}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>{otherUser.username} ({otherUser.role})</Text>
        <Text style={[styles.textContent, { color: colors.textPrimary }]}>{item.content}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text></TouchableOpacity>
      )};
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Messages</Text>
      {loading ? (
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
  },
  textContent: {
    fontSize: 14,
    marginVertical: 2,
  },
  list: {
    marginTop: 20,
  },
  messageItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default MessagesScreen;