import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { getAuthData } from '../../utils/auth';
import { useColors } from '../../theme/ThemeContext';

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
  carbohydrates?: number;
  proteins?: number;
  lipids?: number;
  potassium?: number;
  phosphorus?: number;
  sodium?: number;
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
  const [providerId, setProviderId] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [mealPlanForm, setMealPlanForm] = useState<MealPlanForm>({
    breakfast: [{ name: '', quantity: '', isFluid: false }],
    lunch: [{ name: '', quantity: '', isFluid: false }],
    dinner: [{ name: '', quantity: '', isFluid: false }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const colors = useColors();

  const fetchData = async () => {
    try {
      setLoading(true);
      const authData = await getAuthData();
      const userId = authData.userId ?? '';
      setProviderId(userId);

      const [patientResponse, foodLogsResponse] = await Promise.all([
        api.get(`/api/provider/patient/${patientId}`),
        api.get(`/api/provider/patient/${patientId}/food-logs`),
      ]);

      setPatient({
        id: patientResponse.data._id,
        username: patientResponse.data.username,
        email: patientResponse.data.email,
      });

      setFoodLogs(
        foodLogsResponse.data.map((log: any) => ({
          id: log._id,
          foodItem: log.foodItem || 'Unknown',
          quantity: log.quantity || '0',
          isFluid: log.isFluid || false,
          date: log.date || new Date().toISOString(),
          carbohydrates: log.carbohydrates,
          proteins: log.proteins,
          lipids: log.lipids,
          potassium: log.potassium,
          phosphorus: log.phosphorus,
          sodium: log.sodium,
        }))
      );

      setError('');
    } catch (err) {
      console.error('Fetch error:', (err as Error).message);
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const handleMealPlanChange = (
    mealType: keyof MealPlanForm,
    index: number,
    field: keyof MealItem,
    value: string | boolean
  ) => {
    setMealPlanForm((prev) => {
      const updatedMeal = [...prev[mealType]];
      if (field === 'quantity' && typeof value === 'string') {
        if (value && !/^\d*$/.test(value)) {
          Alert.alert('Error', 'Quantity must be a numeric value.');
          return prev;
        }
      }
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

  const removeMealItem = (mealType: keyof MealPlanForm, index: number) => {
    setMealPlanForm((prev) => {
      const updatedMeal = [...prev[mealType]];
      if (updatedMeal.length <= 1) {
        Alert.alert('Error', 'Each meal must have at least one item.');
        return prev;
      }
      updatedMeal.splice(index, 1);
      return { ...prev, [mealType]: updatedMeal };
    });
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
      await api.put(`/api/provider/meal-plan/${patientId}`, mealPlanForm);
      Alert.alert('Success', 'Meal plan updated successfully!');
      setError('');
    } catch (err) {
      console.error('Meal plan submit error:', (err as Error).message);
      setError('Failed to update meal plan');
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

  const renderFoodLog = (item: FoodLog) => (
    <View style={[styles.card, { backgroundColor: colors.background, shadowColor: '#000' }]}>
      <Text style={[styles.logText, { color: colors.textPrimary }]}>
        {item.foodItem} - {item.quantity}
        {item.isFluid ? 'ml' : 'g'} (Carbs: {item.carbohydrates || 0}g, Proteins: {item.proteins || 0}g, Lipids: {item.lipids || 0}g,
        K: {item.potassium || 0}mg, P: {item.phosphorus || 0}mg, Na: {item.sodium || 0}mg)
      </Text>
      <Text style={[styles.logDate, { color: colors.textSecondary }]}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.date)}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background, shadowColor: '#000' }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.primary }]}>Patient Details</Text>
          <TouchableOpacity onPress={fetchData} accessibilityLabel="Refresh patient data">
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: colors.textPrimary }]}>{patient?.username || 'Unknown'}</Text>
        <Text style={[styles.emailText, { color: colors.textSecondary }]}>Email: {patient?.email || 'N/A'}</Text>
      </View>

      {error && (
        <View style={[styles.errorMessage, { backgroundColor: colors.errorBackground }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Food Logs</Text>
          <Ionicons name="fast-food-outline" size={24} color={colors.primary} />
        </View>
        {foodLogs.length === 0 && <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No logs available</Text>}
      </View>
    </>
  );

  const renderMealPlanSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Set Meal Plan</Text>
        <Ionicons name="list-outline" size={24} color={colors.primary} />
      </View>
      {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
        <View key={mealType} style={styles.mealSection}>
          <Text style={[styles.mealTitle, { color: colors.textPrimary }]}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          {mealPlanForm[mealType].map((item, index) => (
            <View key={index} style={[styles.mealItem, { backgroundColor: colors.background, shadowColor: '#000' }]}>
              <TextInput
                style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary, backgroundColor: colors.secondary }]}
                placeholder="Food/Drink Name"
                placeholderTextColor={colors.textSecondary}
                value={item.name}
                onChangeText={(value) => handleMealPlanChange(mealType, index, 'name', value)}
                accessibilityLabel={`${mealType} item name input`}
              />
              <TextInput
                style={[styles.input, styles.quantityInput, { borderColor: colors.secondary, color: colors.textPrimary, backgroundColor: colors.secondary }]}
                placeholder="Quantity"
                placeholderTextColor={colors.textSecondary}
                value={item.quantity}
                onChangeText={(value) => handleMealPlanChange(mealType, index, 'quantity', value)}
                keyboardType="numeric"
                accessibilityLabel={`${mealType} item quantity input`}
              />
              <TouchableOpacity
                style={[styles.unitButton, item.isFluid ? [styles.unitButtonFluid, { backgroundColor: colors.primary, borderColor: colors.primary }] : [styles.unitButtonSolid, { borderColor: colors.secondary }]]}
                onPress={() => handleMealPlanChange(mealType, index, 'isFluid', !item.isFluid)}
                accessibilityLabel={`${mealType} item unit toggle`}
              >
                <Text style={[styles.unitButtonText, { color: item.isFluid ? '#fff' : colors.textPrimary }]}>{item.isFluid ? 'ml' : 'g'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMealItem(mealType, index)}
                accessibilityLabel={`${mealType} item remove button`}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={() => addMealItem(mealType)} accessibilityLabel={`Add ${mealType} item`}>
            <Text style={[styles.addItemText, { color: colors.primary }]}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary, shadowColor: '#000' }]}
        onPress={handleMealPlanSubmit}
        accessibilityLabel="Save meal plan button"
      >
        <Text style={styles.submitButtonText}>Save Meal Plan</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading patient details...</Text>
      </View>
    );
  }

  if (error && !patient) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchData} accessibilityLabel="Retry loading patient data">
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const combinedData = [
    ...foodLogs.map((log) => ({ type: 'foodLog', data: log } as const)),
    { type: 'mealPlanSection' } as const,
  ];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={combinedData}
      renderItem={({ item }) => {
        if (item.type === 'foodLog') {
          return renderFoodLog(item.data);
        } else if (item.type === 'mealPlanSection') {
          return renderMealPlanSection();
        }
        return null;
      }}
      keyExtractor={(item, index) =>
        item.type === 'foodLog' ? `foodLog-${item.data.id}` : `section-${index}`
      }
      ListHeaderComponent={renderHeader}
      ListFooterComponent={<View style={{ height: 20 }} />}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  header: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 16,
    marginTop: 5,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
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
    fontSize: 22,
    fontWeight: '600',
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logText: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  logDate: {
    fontSize: 14,
    fontWeight: '400',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mealSection: {
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  quantityInput: {
    flex: 0,
    width: 80,
    marginRight: 10,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
  },
  unitButtonSolid: {},
  unitButtonFluid: {},
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 10,
  },
  addItemButton: {
    marginTop: 10,
  },
  addItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProviderPatientDetailScreen;