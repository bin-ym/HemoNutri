import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
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

type MealPlan = {
  id: string;
  title: string;
  description: string;
  date: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const MealPlansScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        // Placeholder API call (uncomment when backend route is ready)
        // const response = await api.get('/api/patient/meal-plans');
        // setMealPlans(response.data);

        setMealPlans([
          { id: '1', title: 'Low Iron Diet', description: 'Breakfast: Oatmeal, Lunch: Spinach Salad', date: '2025-04-16' },
          { id: '2', title: 'High Protein Diet', description: 'Breakfast: Eggs, Lunch: Chicken Breast', date: '2025-04-17' },
        ]);
      } catch (error: any) {
        console.error('Error fetching meal plans:', error);
        Alert.alert('Error', 'Failed to load meal plans. Please try again.');
      }
    };
    fetchMealPlans();
  }, []);

  const renderMealPlan = ({ item }: { item: MealPlan }) => (
    <View style={styles.planItem}>
      <Text style={styles.planTitle}>{item.title}</Text>
      <Text style={styles.planText}>{item.description}</Text>
      <Text style={styles.planText}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Plans</Text>
      {mealPlans.length === 0 ? (
        <Text style={styles.emptyText}>No meal plans available.</Text>
      ) : (
        <FlatList
          data={mealPlans}
          renderItem={renderMealPlan}
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
  list: {
    flex: 1,
  },
  planItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  planText: {
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

export default MealPlansScreen;