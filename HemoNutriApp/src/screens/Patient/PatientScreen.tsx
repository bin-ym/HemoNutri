import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { clearAuthData } from '../../utils/auth';
import { useColors } from '../../theme/ThemeContext'; // Fixed import path
import api from '../../api/api';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  FoodLogs: undefined;
  MealPlans: undefined;
  Messages: undefined;
};

type FoodLog = {
  id: string;
  foodItem: string;
  quantity: string;
  date: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const PatientScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const patientStyles = styles(colors); // Create styles object by calling the function
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, messagesRes] = await Promise.all([
          api.get('/api/patient/food-logs'),
          api.get('/api/patient/messages'),
        ]);
        setFoodLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 5) : []);
        setMessages(Array.isArray(messagesRes.data) ? messagesRes.data.slice(0, 5) : []);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
        if (err.response?.data?.error?.includes('Token expired')) {
          await clearAuthData();
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigation]);

  const handleLogout = async () => {
    await clearAuthData();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const renderFoodLog = ({ item }: { item: FoodLog }) => (
    <View style={patientStyles.card}>
      <Text style={patientStyles.cardText}>{item.foodItem} - {item.quantity}</Text>
      <Text style={patientStyles.cardSubText}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.date)}
      </Text>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={patientStyles.card}>
      <Text style={patientStyles.cardText}>{item.content}</Text>
      <Text style={patientStyles.cardSubText}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.createdAt)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={patientStyles.container}>
        <View style={patientStyles.loadingContainer}>
          <Ionicons name="refresh-circle" size={40} color={colors.primary} style={patientStyles.spinner} />
          <Text style={patientStyles.loadingText}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={patientStyles.container}>
        <View style={patientStyles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={colors.danger} />
          <Text style={patientStyles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={patientStyles.container}>
      <View style={patientStyles.header}>
        <Text style={patientStyles.title}>Your Dashboard</Text>
        <Text style={patientStyles.subtitle}>Stay on top of your nutrition and health.</Text>
        <Ionicons name="fast-food" size={40} color={colors.primary} style={patientStyles.headerIcon} />
      </View>

      <View style={patientStyles.overviewContainer}>
        <TouchableOpacity
          style={patientStyles.overviewCard}
          onPress={() => navigation.navigate('FoodLogs')}
        >
          <View style={patientStyles.cardHeader}>
            <Text style={patientStyles.cardTitle}>Food Logs</Text>
            <Ionicons name="fast-food" size={24} color={colors.primary} />
          </View>
          <Text style={patientStyles.cardValue}>{foodLogs.length}</Text>
          <Text style={patientStyles.cardLink}>View All Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={patientStyles.overviewCard}
          onPress={() => navigation.navigate('Messages')}
        >
          <View style={patientStyles.cardHeader}>
            <Text style={patientStyles.cardTitle}>Messages</Text>
            <Ionicons name="chatbox-outline" size={24} color={colors.primary} />
          </View>
          <Text style={patientStyles.cardValue}>{messages.length}</Text>
          <Text style={patientStyles.cardLink}>View Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={patientStyles.overviewCard} onPress={() => Alert.alert('Coming Soon', 'Goals feature will be available soon!')}>
          <View style={patientStyles.cardHeader}>
            <Text style={patientStyles.cardTitle}>Goals</Text>
            <Ionicons name="flag-outline" size={24} color={colors.primary} />
          </View>
          <Text style={patientStyles.cardValue}>Coming Soon</Text>
          <Text style={patientStyles.cardLink}>Set Goals</Text>
        </TouchableOpacity>
      </View>

      <View style={patientStyles.section}>
        <View style={patientStyles.sectionHeader}>
          <Text style={patientStyles.sectionTitle}>Recent Food Logs</Text>
          <Ionicons name="fast-food" size={24} color={colors.primary} />
        </View>
        {foodLogs.length === 0 ? (
          <Text style={patientStyles.emptyText}>No recent logs.</Text>
        ) : (
          <FlatList
            data={foodLogs}
            renderItem={renderFoodLog}
            keyExtractor={(item) => item.id}
            style={patientStyles.list}
          />
        )}
      </View>

      <View style={patientStyles.section}>
        <View style={patientStyles.sectionHeader}>
          <Text style={patientStyles.sectionTitle}>Recent Messages</Text>
          <Ionicons name="chatbox-outline" size={24} color={colors.primary} />
        </View>
        {messages.length === 0 ? (
          <Text style={patientStyles.emptyText}>No recent messages.</Text>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={patientStyles.list}
          />
        )}
      </View>

      <TouchableOpacity style={patientStyles.logoutButton} onPress={handleLogout}>
        <Text style={patientStyles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    headerIcon: {
      marginTop: 10,
    },
    overviewContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    overviewCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    cardLink: {
      marginTop: 8,
      color: colors.primary,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    section: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary,
    },
    list: {
      flexGrow: 0,
    },
    card: {
      backgroundColor: colors.secondary,
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
    },
    cardText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    cardSubText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    logoutButton: {
      backgroundColor: colors.danger,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spinner: {
      marginBottom: 10,
    },
    loadingText: {
      fontSize: 18,
      color: colors.primary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 20,
      margin: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.danger,
      marginTop: 10,
      textAlign: 'center',
    },
  });

export default PatientScreen;