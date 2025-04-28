import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { clearAuthData } from '../../utils/auth';
import { colors } from '../../theme/colors';
import api from '../../api/api';

// Define the stack and tab param lists
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
  ManageMealPlans: undefined;
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
};

type TabParamList = {
  HomeTab: undefined;
  Admin: undefined;
  Patient: undefined;
  Provider: undefined;
  Users: undefined;
  Settings: undefined;
  FoodLogs: undefined;
  MealPlans: undefined;
  Patients: undefined;
  ProviderMealPlans: undefined;
};

// Combine navigation props for stack and tab navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList> & BottomTabNavigationProp<TabParamList, 'Provider'>;

type FoodLog = {
  id: string;
  userId?: string | { username: string };
  foodItem: string;
  quantity: string;
  isFluid: boolean;
  date: string;
};

const ProviderScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stats, setStats] = useState<{ patients: number; mealPlans: number }>({ patients: 0, mealPlans: 0 });
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientsResponse = await api.get('/api/provider/patients');
        const mealPlansResponse = await api.get('/api/provider/meal-plans');
        const logsResponse = await api.get('/api/provider/logs');

        setStats({
          patients: patientsResponse.data.length,
          mealPlans: mealPlansResponse.data.length,
        });

        setRecentLogs(logsResponse.data.slice(0, 5).map((log: any) => {
          console.log('Log entry:', log); // Debug the entire log entry
          let userIdData: string | { username: string } | undefined = log.userId;
          if (!log.userId) {
            console.warn(`Log with ID ${log._id} has no userId.`);
            userIdData = undefined;
          } else if (typeof log.userId === 'string') {
            console.warn(`Log with ID ${log._id} has userId as string: ${log.userId}`);
            userIdData = log.userId;
          } else if (!log.userId.username) {
            console.warn(`Log with ID ${log._id} has userId without username:`, log.userId);
            userIdData = { username: 'Unknown' };
          }
          return {
            id: log._id,
            userId: userIdData,
            foodItem: log.foodItem,
            quantity: log.quantity,
            isFluid: log.isFluid,
            date: log.date,
          };
        }));

        setError('');
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await clearAuthData();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleManagePatients = () => {
    navigation.navigate('Patients');
  };

  const handleManageMealPlans = () => {
    navigation.navigate('ProviderMealPlans');
  };

  const handleAddResource = () => {
    navigation.navigate('ProviderEducation');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
  };

  const renderRecentLog = ({ item }: { item: FoodLog }) => {
    const username = typeof item.userId === 'object' && item.userId ? item.userId.username : 'Unknown User';
    return (
      <View style={styles.logItem}>
        <Text style={styles.logText}>
          {username}: {item.foodItem} - {item.quantity}{item.isFluid ? 'ml' : 'g'}
        </Text>
        <Text style={styles.logDate}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.date)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Provider Dashboard</Text>
        <Text style={styles.subtitle}>Monitor your patients and manage their nutrition.</Text>
      </View>

      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>Patients</Text>
            <Ionicons name="people-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{stats.patients}</Text>
          <Button
            title="View All Patients"
            onPress={handleManagePatients}
            type="clear"
            titleStyle={styles.statButton}
          />
        </View>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>Meal Plans</Text>
            <Ionicons name="list-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{stats.mealPlans}</Text>
          <Button
            title="See All Plans"
            onPress={handleManageMealPlans}
            type="clear"
            titleStyle={styles.statButton}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Food Logs</Text>
          <Ionicons name="fast-food-outline" size={24} color={colors.primary} />
        </View>
        {recentLogs.length === 0 ? (
          <Text style={styles.emptyText}>No recent logs.</Text>
        ) : (
          <FlatList
            data={recentLogs}
            renderItem={renderRecentLog}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Ionicons name="flash-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.quickActions}>
          <Button
            title="Manage Patients"
            onPress={handleManagePatients}
            buttonStyle={styles.actionButton}
            containerStyle={styles.actionButtonContainer}
            titleStyle={styles.actionButtonTitle}
          />
          <Button
            title="Manage Meal Plans"
            onPress={handleManageMealPlans}
            buttonStyle={styles.actionButton}
            containerStyle={styles.actionButtonContainer}
            titleStyle={styles.actionButtonTitle}
          />
          <Button
            title="Add Resource"
            onPress={handleAddResource}
            buttonStyle={styles.actionButton}
            containerStyle={styles.actionButtonContainer}
            titleStyle={styles.actionButtonTitle}
          />
        </View>
      </View>

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={[styles.button, styles.logoutButton]}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitle}
      />
    </View>
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
  errorText: {
    fontSize: 18,
    color: colors.danger,
    marginTop: 10,
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
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '45%',
    borderWidth: 1,
    borderColor: colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  statButton: {
    fontSize: 14,
    color: colors.primary,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButtonContainer: {
    width: '45%',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  actionButtonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProviderScreen;