import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { useColors } from '../../theme/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList> & BottomTabNavigationProp<TabParamList, 'Provider'>;

type FoodLog = {
  id: string;
  userId?: string | { username: string };
  foodItem: string;
  quantity: string;
  isFluid: boolean;
  date: string;
};

type ScreenSection = {
  id: string;
  type: 'header' | 'overview' | 'logs' | 'quickActions';
  content?: {
    stats?: { patients: number; mealPlans: number };
    logs?: FoodLog[];
  };
};

const ProviderScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stats, setStats] = useState<{ patients: number; mealPlans: number }>({ patients: 0, mealPlans: 0 });
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const colors = useColors();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [patientsResponse, mealPlansResponse, logsResponse] = await Promise.all([
        api.get('/api/provider/patients'),
        api.get('/api/provider/meal-plans'),
        api.get('/api/provider/logs'),
      ]);

      setStats({
        patients: patientsResponse.data.length,
        mealPlans: mealPlansResponse.data.length,
      });

      setRecentLogs(
        logsResponse.data.slice(0, 5).map((log: any) => {
          let userIdData: string | { username: string } | undefined = log.userId;
          if (!log.userId) {
            console.warn(`Log with ID ${log._id} has no userId.`);
            userIdData = { username: 'Unknown' };
          } else if (typeof log.userId === 'string') {
            userIdData = log.userId;
          } else if (!log.userId.username) {
            console.warn(`Log with ID ${log._id} has userId without username:`, log.userId);
            userIdData = { username: 'Unknown' };
          }
          return {
            id: log._id,
            userId: userIdData,
            foodItem: log.foodItem || 'Unknown',
            quantity: log.quantity || '0',
            isFluid: log.isFluid || false,
            date: log.date || new Date().toISOString(),
          };
        })
      );
    } catch (err: any) {
      console.error('API Error:', err.message);
      setError('Failed to load dashboard. Check your network or server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManagePatients = () => navigation.navigate('Patients');
  const handleAddResource = () => navigation.navigate('ProviderEducation');
  const handleRetry = () => fetchData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
  };

  const renderRecentLog = ({ item }: { item: FoodLog }) => {
    const username = typeof item.userId === 'object' && item.userId ? item.userId.username : 'Unknown User';
    return (
      <View style={[styles.logItem, { backgroundColor: colors.background, borderColor: colors.secondary }]}>
        <Text style={[styles.logText, { color: colors.textPrimary }]}>
          {username}: {item.foodItem} - {item.quantity}{item.isFluid ? 'ml' : 'g'}
        </Text>
        <Text style={[styles.logDate, { color: colors.textSecondary }]}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.date)}
        </Text>
      </View>
    );
  };

  const renderSection = ({ item }: { item: ScreenSection }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={[styles.header, { shadowColor: '#000' }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Provider Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Monitor your patients and manage their nutrition.</Text>
          </View>
        );
      case 'overview':
        return (
          <View style={styles.overviewContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.secondary, shadowColor: '#000' }]}>
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: colors.primary }]}>Patients</Text>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.patients}</Text>
              <Button
                title="View All Patients"
                onPress={handleManagePatients}
                type="clear"
                titleStyle={[styles.statButton, { color: colors.primary }]}
                accessibilityLabel="View all patients"
              />
            </View>
          </View>
        );
      case 'logs':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Recent Food Logs</Text>
              <Ionicons name="fast-food-outline" size={24} color={colors.primary} />
            </View>
            {recentLogs.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent logs.</Text>
            ) : (
              <FlatList
                data={recentLogs}
                renderItem={renderRecentLog}
                keyExtractor={(item) => item.id}
                style={styles.list}
                nestedScrollEnabled
              />
            )}
          </View>
        );
      case 'quickActions':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Quick Actions</Text>
              <Ionicons name="flash-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.quickActions}>
              <Button
                title="Manage Patients"
                onPress={handleManagePatients}
                buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
                containerStyle={styles.actionButtonContainer}
                titleStyle={styles.actionButtonTitle}
                accessibilityLabel="Manage patients button"
              />
              <Button
                title="Add Resource"
                onPress={handleAddResource}
                buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
                containerStyle={styles.actionButtonContainer}
                titleStyle={styles.actionButtonTitle}
                accessibilityLabel="Add resource button"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <Button
          title="Retry"
          onPress={handleRetry}
          buttonStyle={[styles.retryButton, { backgroundColor: colors.primary }]}
          containerStyle={styles.retryButtonContainer}
          titleStyle={styles.retryButtonTitle}
          accessibilityLabel="Retry dashboard load"
        />
      </View>
    );
  }

  const sections: ScreenSection[] = [
    { id: '1', type: 'header' },
    { id: '2', type: 'overview', content: { stats } },
    { id: '3', type: 'logs', content: { logs: recentLogs } },
    { id: '4', type: 'quickActions' },
  ];

  return (
    <FlatList
      data={sections}
      renderItem={renderSection}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      ListFooterComponent={<View style={{ height: 20 }} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButtonContainer: {
    width: '60%',
    marginTop: 20,
  },
  retryButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  retryButtonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '45%',
    borderWidth: 1,
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
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statButton: {
    fontSize: 14,
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
  },
  list: {
    flexGrow: 0,
  },
  logItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  logText: {
    fontSize: 16,
    marginBottom: 5,
  },
  logDate: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
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
    borderRadius: 8,
    paddingVertical: 12,
  },
  actionButtonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProviderScreen;