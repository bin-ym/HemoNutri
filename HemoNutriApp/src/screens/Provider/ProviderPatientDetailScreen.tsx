import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { colors } from '../../theme/colors';

// Define the navigation stack param list
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
  ManageMealPlans: undefined;
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProviderPatientDetail'>;

type Patient = {
  id: string;
  username: string;
  email: string;
};

type FoodLog = {
  id: string;
  foodItem: string;
  quantity: string;
  isFluid: boolean;
  date: string;
};

type Message = {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  isEmergency: boolean;
};

type MealItem = {
  name: string;
  quantity: string;
  isFluid: boolean;
};

type MealPlanForm = {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
};

const ProviderPatientDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { patientId } = route.params as { patientId: string };
  const providerId = 'provider_1'; // Mock provider ID; replace with actual provider ID from auth
  const [patient, setPatient] = useState<Patient | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mealPlanForm, setMealPlanForm] = useState<MealPlanForm>({
    breakfast: [{ name: '', quantity: '', isFluid: false }],
    lunch: [{ name: '', quantity: '', isFluid: false }],
    dinner: [{ name: '', quantity: '', isFluid: false }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // Fetch patient details
        const patientResponse = await api.get(`/api/provider/patient/${patientId}`);
        setPatient({
          id: patientResponse.data._id,
          username: patientResponse.data.username,
          email: patientResponse.data.email,
        });

        // Fetch food logs
        const foodLogsResponse = await api.get(`/api/provider/patient/${patientId}/food-logs`);
        setFoodLogs(foodLogsResponse.data.map((log: any) => ({
          id: log._id,
          foodItem: log.foodItem,
          quantity: log.quantity,
          isFluid: log.isFluid,
          date: log.date,
        })));

        // Fetch messages
        const messagesResponse = await api.get(`/api/provider/messages/${patientId}`);
        setMessages(messagesResponse.data.map((msg: any) => ({
          id: msg._id,
          senderId: msg.sender._id,
          senderUsername: msg.sender.username,
          content: msg.content,
          createdAt: msg.createdAt,
          isEmergency: msg.isEmergency || false,
        })));

        // Fetch existing meal plan (if any)
        const mealPlanResponse = await api.get(`/api/provider/meal-plan/${patientId}`);
        if (mealPlanResponse.data) {
          setMealPlanForm({
            breakfast: mealPlanResponse.data.breakfast,
            lunch: mealPlanResponse.data.lunch,
            dinner: mealPlanResponse.data.dinner,
          });
        }

        setError('');
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const handleMealPlanChange = (mealType: keyof MealPlanForm, index: number, field: keyof MealItem, value: string | boolean) => {
    setMealPlanForm((prev) => {
      const updatedMeal = [...prev[mealType]];
      updatedMeal[index] = { ...updatedMeal[index], [field]: value };
      return { ...prev, [mealType]: updatedMeal };
    });
  };

  const addMealItem = (mealType: keyof MealPlanForm) => {
    setMealPlanForm((prev) => ({
      ...prev,
      [mealType]: [...prev[mealType], { name: '', quantity: '', isFluid: false }],
    }));
  };

  const handleMealPlanSubmit = async () => {
    try {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        for (const item of mealPlanForm[mealType]) {
          if (!item.name || !item.quantity) {
            Alert.alert('Error', 'Please fill in all meal plan fields.');
            return;
          }
        }
      }
      await api.post(`/api/provider/meal-plan/${patientId}`, mealPlanForm);
      Alert.alert('Success', 'Meal plan updated successfully!');
      setError('');
    } catch (err: any) {
      console.error('Meal plan submit error:', err);
      setError('Failed to update meal plan');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

    try {
      const response = await api.post(`/api/provider/message/${patientId}`, { content: newMessage });
      setMessages([{
        id: response.data._id,
        senderId: providerId,
        senderUsername: 'Provider',
        content: newMessage,
        createdAt: response.data.createdAt,
        isEmergency: false,
      }, ...messages]);
      setNewMessage('');
      Alert.alert('Success', 'Message sent successfully!');
      setError('');
    } catch (err: any) {
      console.error('Send message error:', err);
      setError('Failed to send message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const renderFoodLog = ({ item }: { item: FoodLog }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>
        {item.foodItem} - {item.quantity}{item.isFluid ? 'ml' : 'g'}
      </Text>
      <Text style={styles.logDate}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.date)}
      </Text>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageItem, item.isEmergency ? styles.emergencyMessage : null]}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>
          {item.senderId === providerId ? 'You' : item.senderUsername}
          {item.isEmergency && <Text style={styles.emergencyLabel}> 🚨 Emergency</Text>}
        </Text>
        <Text style={styles.messageDate}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading patient details...</Text>
      </View>
    );
  }

  if (error && !patient) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Patient Details: {patient?.username || 'Unknown'}</Text>
        <Text style={styles.subtitle}>Email: {patient?.email || 'N/A'}</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Food Logs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Food Logs</Text>
          <Ionicons name="fast-food-outline" size={24} color={colors.primary} />
        </View>
        {foodLogs.length === 0 ? (
          <Text style={styles.emptyText}>No logs available</Text>
        ) : (
          <FlatList
            data={foodLogs}
            renderItem={renderFoodLog}
            keyExtractor={(item) => item.id}
            style={styles.list}
            nestedScrollEnabled
          />
        )}
      </View>

      {/* Set Meal Plan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Set Meal Plan</Text>
          <Ionicons name="list-outline" size={24} color={colors.primary} />
        </View>
        {['breakfast', 'lunch', 'dinner'].map((mealType) => (
          <View key={mealType} style={styles.mealSection}>
            <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
            {mealPlanForm[mealType as keyof MealPlanForm].map((item, index) => (
              <View key={index} style={styles.mealItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Food/Drink Name"
                  value={item.name}
                  onChangeText={(value) => handleMealPlanChange(mealType as keyof MealPlanForm, index, 'name', value)}
                />
                <TextInput
                  style={[styles.input, styles.quantityInput]}
                  placeholder="Quantity"
                  value={item.quantity}
                  onChangeText={(value) => handleMealPlanChange(mealType as keyof MealPlanForm, index, 'quantity', value)}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.unitButton, item.isFluid ? styles.unitButtonFluid : styles.unitButtonSolid]}
                  onPress={() => handleMealPlanChange(mealType as keyof MealPlanForm, index, 'isFluid', !item.isFluid)}
                >
                  <Text style={styles.unitButtonText}>{item.isFluid ? 'ml' : 'g'}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => addMealItem(mealType as keyof MealPlanForm)}
            >
              <Text style={styles.addItemText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.submitButton} onPress={handleMealPlanSubmit}>
          <Text style={styles.submitButtonText}>Save Meal Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <Ionicons name="chatbox-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message here..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {messages.length === 0 ? (
          <Text style={styles.emptyText}>No messages yet</Text>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.list}
            nestedScrollEnabled
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    marginLeft: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  list: {
    flexGrow: 0,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  logText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 5,
  },
  logDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mealSection: {
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#fff',
  },
  quantityInput: {
    flex: 0,
    width: 80,
  },
  unitButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  unitButtonSolid: {
    backgroundColor: '#e0e0e0',
  },
  unitButtonFluid: {
    backgroundColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  addItemButton: {
    marginTop: 10,
  },
  addItemText: {
    fontSize: 16,
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#fff',
    minHeight: 50,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  messageItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  emergencyMessage: {
    borderColor: colors.danger,
    backgroundColor: '#ffe6e6',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emergencyLabel: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  messageDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  messageContent: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default ProviderPatientDetailScreen;