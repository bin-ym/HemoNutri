import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { useColors } from '../../theme/ThemeContext'; // Corrected import path

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  FoodLogs: undefined;
  MealPlans: undefined;
  Messages: undefined;
  Conversation: { userId: string; username: string; role: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/patient/messages');
        const usersMap: { [key: string]: User } = {};
        response.data.forEach((msg: any) => {
          const sender = msg.sender;
          if ((sender.role === 'provider' || sender.role === 'admin') && !usersMap[sender._id]) {
            usersMap[sender._id] = {
              id: sender._id,
              username: sender.username || `Unknown ${sender.role.charAt(0).toUpperCase() + sender.role.slice(1)}`,
              email: sender.email || 'No email provided',
              role: sender.role,
            };
          }
        });
        const userData = Object.values(usersMap);
        setUsers(userData);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        console.log('Navigating to Conversation with:', { userId: item.id, username: item.username, role: item.role });
        navigation.navigate('Conversation', { userId: item.id, username: item.username, role: item.role });
      }}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userRole}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh-circle" size={40} color={colors.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Select a user to chat with.</Text>
      </View>

      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {users.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No users to chat with yet.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 18,
      color: colors.textSecondary,
      marginTop: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 10,
      textAlign: 'center',
    },
    errorMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorBackground,
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
      textAlign: 'center',
    },
    list: {
      flexGrow: 0,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.secondary,
      justifyContent: 'space-between',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 5,
    },
    userRole: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

export default MessagesScreen;