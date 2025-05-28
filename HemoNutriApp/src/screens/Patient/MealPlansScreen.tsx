import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import api from '../../api/api';

type Meal = {
  carbohydrates: number;
  proteins: number;
  lipids: number;
};

type MealPlan = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  hemodialysisLimits: {
    potassium: number;
    phosphorus: number;
    sodium: number;
    fluid: number;
  };
  consumed: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  recommendedFoods: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
};

const MealPlansScreen: React.FC = () => {
  const { colors } = useColors();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    try {
      const response = await api.get('/api/patient/mealplan');
      setMealPlan(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load meal plan');
      setLoading(false);
    }
  };

  const toggleConsumption = async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!mealPlan) return;
    try {
      const response = await api.put('/api/patient/mealplan/consume', {
        mealType,
        consumed: !mealPlan.consumed[mealType],
      });
      setMealPlan(response.data);
      Alert.alert('Success', `${mealType} marked as ${!mealPlan.consumed[mealType] ? 'consumed' : 'not consumed'}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update meal plan');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Today's Meal Plan</Text>
      {mealPlan ? (
        <>
          <View style={[styles.mealSection, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Breakfast</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>
              Carbs: {mealPlan.breakfast.carbohydrates}g, Proteins: {mealPlan.breakfast.proteins}g, Lipids: {mealPlan.breakfast.lipids}g
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>Recommended: {mealPlan.recommendedFoods.breakfast.join(', ') || 'None'}</Text>
            <Button
              title={mealPlan.consumed.breakfast ? 'Mark as Not Consumed' : 'Mark as Consumed'}
              onPress={() => toggleConsumption('breakfast')}
              color={colors.primary}
            />
          </View>
          <View style={[styles.mealSection, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Lunch</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}> 
              Carbs: { 
mealPlan.lunch.carbohydrates}g, Proteins: { 
mealPlan.lunch.proteins}g, Lipids: { 
mealPlan.lunch.lipids}g
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>Recommended Foods: { 
mealPlan.recommendedFoods.lunch.join(', ') || 'None'}</Text> 
            <Button 
              title={mealPlan.consumed.lunch ? 'Mark as Not Consumed' : 'Mark as Consumed'} 
              onPress={() => toggleConsumption('lunch')} 
              color={colors.primary} 
            /> 
          </View>
          <View style={[styles.mealSection, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Dinner</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}> 
              Carbs: { 
mealPlan.dinner.carbohydrates}g, Proteins: { 
mealPlan.dinner.proteins}g, Lipids: { 
mealPlan.dinner.lipids}g
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>Recommended Foods: { 
mealPlan.recommendedFoods.dinner.join(', ') || 'None'}</Text> 
            <Button 
              title={mealPlan.consumed.dinner ? 'Mark as Not Consumed' : 'Mark as Consumed'} 
              onPress={() => toggleConsumption('dinner')} 
              color={colors.primary} 
            /> 
          </View>
          <View style={[styles.limitsSection, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Hemodialysis Limits</Text> 
            <Text style={[styles.text, { color: colors.textPrimary }]}>Potassium: { 
mealPlan.hemodialysisLimits.potassium']} mg</Text> 
            <Text style={[styles.text, { color: colors.textPrimary }]}>Phosphorus: { 
mealPlan.hemodialysisLimits.phosphorus']} mg</Text> 
            <Text style={[styles.text, { color: colors.textPrimary }]}>Sodium: { 
mealPlan.hemodialysisLimits.sodium']} mg</Text> 
            <Text style={[styles.text, { color: colors.textPrimary }]}>Fluid: { 
mealPlan.hemodialysisLimits.fluid']} ml</Text> 
          </View>
        </>
      ) : (
        <Text style={[styles.text, { color: colors.textPrimary }]}>No meal plan available for today</Text>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mealSection: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  limitsSection: {
    padding: 15,
    borderRadius: 8,
  },
});

export default MealPlansScreen;