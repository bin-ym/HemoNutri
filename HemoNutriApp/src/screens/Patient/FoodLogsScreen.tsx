import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import api from '../../api/api';

// Define the navigation stack param list
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  FoodLogs: undefined;
  MealPlans: undefined;
};

type FoodLog = {
  id: string;
  foodItem: string;
  quantity: string;
  date: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const FoodLogsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  useEffect(() => {
    const fetchFoodLogs = async () => {
      try {
        // Placeholder API call (uncomment when backend route is ready)
        // const response = await api.get('/api/patient/food-logs');
        // setFoodLogs(response.data);

        setFoodLogs([
          { id: '1', foodItem: 'Apple', quantity: '1', date: '2025-04-16' },
          { id: '2', foodItem: 'Chicken Salad', quantity: '200g', date: '2025-04-16' },
        ]);
      } catch (error: any) {
        console.error('Error fetching food logs:', error);
        Alert.alert('Error', 'Failed to load food logs. Please try again.');
      }
    };
    fetchFoodLogs();
  }, []);

  const handleAddFoodLog = () => {
    Alert.alert('Add Food Log', 'This feature will allow you to add a new food log (coming soon).');
  };

  const renderFoodLog = ({ item }: { item: FoodLog }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>{item.foodItem}</Text>
      <Text style={styles.logText}>{item.quantity}</Text>
      <Text style={styles.logText}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Logs</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddFoodLog}>
        <Text style={styles.addButtonText}>Add Food Log</Text>
      </TouchableOpacity>
      {foodLogs.length === 0 ? (
        <Text style={styles.emptyText}>No food logs available.</Text>
      ) : (
        <FlatList
          data={foodLogs}
          renderItem={renderFoodLog}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  logText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FoodLogsScreen;