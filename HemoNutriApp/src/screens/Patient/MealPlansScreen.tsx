import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme/colors';
import api from '../../api/api';

// Types
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  FoodLogs: undefined;
  MealPlans: undefined;
};

type Meal = {
  carbohydrates: number;
  proteins: number;
  lipids: number;
};

type MealPlan = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  consumed: { breakfast: boolean; lunch: boolean; dinner: boolean };
  hemodialysisLimits: { potassium: number; phosphorus: number; sodium: number; fluid: number };
  recommendedFoods: {
    breakfast: Array<{ name: string; quantity: number; carbohydrates: number; proteins: number; lipids: number }>;
    lunch: Array<{ name: string; quantity: number; carbohydrates: number; proteins: number; lipids: number }>;
    dinner: Array<{ name: string; quantity: number; carbohydrates: number; proteins: number; lipids: number }>;
  };
};

type FoodLog = {
  id: string;
  date: string;
  potassium: number;
  phosphorus: number;
  sodium: number;
  quantity: number;
  isFluid: boolean;
  carbohydrates: number;
  proteins: number;
  lipids: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

// Utility Function
const groupRecommendedFoods = (foods: any[]) => {
  const grouped: { [key: string]: any[] } = { carbohydrates: [], proteins: [], lipids: [] };
  foods.forEach((food) => {
    const nutrients = [
      { type: 'carbohydrates', value: Number(food.carbohydrates) },
      { type: 'proteins', value: Number(food.proteins) },
      { type: 'lipids', value: Number(food.lipids) },
    ];
    const dominant = nutrients.reduce((max, nutrient) => (nutrient.value > max.value ? nutrient : max), nutrients[0]);
    grouped[dominant.type].push(food);
  });
  return grouped;
};

// Custom Hook
const useMealPlanData = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, mealPlanRes] = await Promise.all([
          api.get('/api/patient/food-logs'),
          api.get('/api/patient/meal-plan'),
        ]);
        setFoodLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        setMealPlan(mealPlanRes.data);
        setError('');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysLogs = logsRes.data.filter((log: FoodLog) => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });

        const totals = todaysLogs.reduce(
          (acc: any, log: FoodLog) => ({
            potassium: acc.potassium + Number(log.potassium),
            phosphorus: acc.phosphorus + Number(log.phosphorus),
            sodium: acc.sodium + Number(log.sodium),
            fluid: acc.fluid + (log.isFluid ? Number(log.quantity) : 0),
          }),
          { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 }
        );

        const limits = mealPlanRes.data.hemodialysisLimits;
        const newWarnings: string[] = [];
        if (totals.potassium > limits.potassium) {
          newWarnings.push(`Potassium intake (${totals.potassium}mg) exceeds limit (${limits.potassium}mg)`);
        }
        if (totals.phosphorus > limits.phosphorus) {
          newWarnings.push(`Phosphorus intake (${totals.phosphorus}mg) exceeds limit (${limits.phosphorus}mg)`);
        }
        if (totals.sodium > limits.sodium) {
          newWarnings.push(`Sodium intake (${totals.sodium}mg) exceeds limit (${limits.sodium}mg)`);
        }
        if (totals.fluid > limits.fluid) {
          newWarnings.push(`Fluid intake (${totals.fluid}ml) exceeds limit (${limits.fluid}ml)`);
        }
        setWarnings(newWarnings);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { mealPlan, foodLogs, warnings, loading, error, setMealPlan };
};

// Components
const Header: React.FC = () => {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Your Daily Meal Plan</Text>
      <Text style={styles.subtitle}>Follow your daily nutrient targets.</Text>
      <Ionicons name="fast-food" size={40} color={colors.primary} style={styles.headerIcon} />
    </View>
  );
};

interface WarningSectionProps {
  warnings: string[];
}

const WarningSection: React.FC<WarningSectionProps> = memo(({ warnings }) => {
  const colors = useColors();
  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningHeader}>
        <Ionicons name="alert-circle" size={24} color={colors.danger} />
        <Text style={styles.warningTitle}>Warnings</Text>
      </View>
      {warnings.map((warning, index) => (
        <Text key={index} style={styles.warningText}>• {warning}</Text>
      ))}
    </View>
  );
});

interface MealCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal: Meal;
  consumed: boolean;
  onPress: (mealType: 'breakfast' | 'lunch' | 'dinner') => void;
}

const MealCard: React.FC<MealCardProps> = memo(({ mealType, meal, consumed, onPress }) => {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.mealCard} onPress={() => onPress(mealType)}>
      <View style={styles.mealCardHeader}>
        <Text style={styles.mealCardTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
        <Ionicons
          name={consumed ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={consumed ? '#22c55e' : '#ef4444'}
        />
      </View>
      <Text style={styles.mealCardText}>Carbs: {meal.carbohydrates}g</Text>
      <Text style={styles.mealCardText}>Proteins: {meal.proteins}g</Text>
      <Text style={styles.mealCardText}>Lipids: {meal.lipids}g</Text>
    </TouchableOpacity>
  );
});

interface LimitsCardProps {
  limits: { potassium: number; phosphorus: number; sodium: number; fluid: number };
}

const LimitsCard: React.FC<LimitsCardProps> = ({ limits }) => {
  const colors = useColors();
  return (
    <View style={styles.limitsCard}>
      <Text style={styles.limitsTitle}>Hemodialysis Limits</Text>
      <View style={styles.limitsRow}>
        <Text style={styles.limitsText}>Potassium: {limits.potassium}mg</Text>
        <Text style={styles.limitsText}>Phosphorus: {limits.phosphorus}mg</Text>
      </View>
      <View style={styles.limitsRow}>
        <Text style={styles.limitsText}>Sodium: {limits.sodium}mg</Text>
        <Text style={styles.limitsText}>Fluid: {limits.fluid}ml</Text>
      </View>
    </View>
  );
};

interface ProgressBarProps {
  label: string;
  consumed: number;
  target: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, consumed, target }) => {
  const colors = useColors();
  const percentage = Math.min((consumed / (target || 1)) * 100, 100);
  return (
    <View style={styles.progressItem}>
      <Text style={styles.progressLabel}>
        {label}: {consumed.toFixed(1)} / {target}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
      </View>
    </View>
  );
};

interface MealModalProps {
  visible: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | null;
  mealPlan: MealPlan | null;
  tempConsumed: boolean | null;
  setTempConsumed: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const MealModal: React.FC<MealModalProps> = ({
  visible,
  mealType,
  mealPlan,
  tempConsumed,
  setTempConsumed,
  onClose,
  onSubmit,
}) => {
  const colors = useColors();
  if (!visible || !mealType || !mealPlan) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Details
          </Text>
          {['carbohydrates', 'proteins', 'lipids'].map((nutrientType) => {
            const recommendedFoods = mealPlan.recommendedFoods[mealType] || [];
            const groupedFoods = groupRecommendedFoods(recommendedFoods);
            const nutrientValue = mealPlan[mealType][nutrientType as 'carbohydrates' | 'proteins' | 'lipids'];

            return (
              <View key={nutrientType} style={styles.nutrientSection}>
                <Text style={styles.nutrientTitle}>
                  {nutrientType.charAt(0).toUpperCase() + nutrientType.slice(1)} ({nutrientValue}g)
                </Text>
                {groupedFoods[nutrientType].length > 0 ? (
                  <>
                    <Text style={styles.recommendedLabel}>
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" /> Recommended:
                    </Text>
                    {groupedFoods[nutrientType].map((food, index) => (
                      <Text key={index} style={styles.recommendedFood}>
                        • {food.name} - {food.quantity}g (Carbs: {food.carbohydrates}g, Proteins: {food.proteins}g, Lipids: {food.lipids}g)
                      </Text>
                    ))}
                  </>
                ) : (
                  <Text style={styles.noRecommendations}>
                    No {nutrientType} recommendations provided.
                  </Text>
                )}
              </View>
            );
          })}
          <View style={styles.consumptionSection}>
            <Text style={styles.consumptionTitle}>Did you consume this meal?</Text>
            <View style={styles.consumptionButtons}>
              <TouchableOpacity
                style={[styles.consumptionButton, tempConsumed ? { backgroundColor: '#d1fae5' } : null]}
                onPress={() => setTempConsumed(true)}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={tempConsumed ? '#22c55e' : colors.textSecondary}
                />
                <Text style={[styles.consumptionButtonText, { color: tempConsumed ? '#22c55e' : colors.textSecondary }]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.consumptionButton, tempConsumed === false ? { backgroundColor: '#fee2e2' } : null]}
                onPress={() => setTempConsumed(false)}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={tempConsumed === false ? '#ef4444' : colors.textSecondary}
                />
                <Text style={[styles.consumptionButtonText, { color: tempConsumed === false ? '#ef4444' : colors.textSecondary }]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Main Component
const MealPlansScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const { mealPlan, foodLogs, warnings, loading, error, setMealPlan } = useMealPlanData();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [tempConsumed, setTempConsumed] = useState<boolean | null>(null);

  const openModal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMeal(mealType);
    setTempConsumed(mealPlan?.consumed[mealType] || false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMeal(null);
    setTempConsumed(null);
  };

  const handleMealConsumption = async () => {
    if (!selectedMeal || tempConsumed === null) return;
    try {
      const res = await api.put('/api/patient/meal-plan/consume', { mealType: selectedMeal, consumed: tempConsumed });
      setMealPlan(res.data);
      closeModal();
      Alert.alert('Success', 'Meal consumption updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update meal consumption');
    }
  };

  const totalConsumed = foodLogs
    .filter((log) => {
      const logDate = new Date(log.date);
      const today = new Date();
      logDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    })
    .reduce(
      (acc, log) => ({
        carbohydrates: acc.carbohydrates + Number(log.carbohydrates),
        proteins: acc.proteins + Number(log.proteins),
        lipids: acc.lipids + Number(log.lipids),
        fluid: acc.fluid + (log.isFluid ? Number(log.quantity) : 0),
      }),
      { carbohydrates: 0, proteins: 0, lipids: 0, fluid: 0 }
    );

  const totalTargets = mealPlan
    ? {
        carbohydrates:
          Number(mealPlan.breakfast?.carbohydrates || 0) +
          Number(mealPlan.lunch?.carbohydrates || 0) +
          Number(mealPlan.dinner?.carbohydrates || 0),
        proteins:
          Number(mealPlan.breakfast?.proteins || 0) +
          Number(mealPlan.lunch?.proteins || 0) +
          Number(mealPlan.dinner?.proteins || 0),
        lipids:
          Number(mealPlan.breakfast?.lipids || 0) +
          Number(mealPlan.lunch?.lipids || 0) +
          Number(mealPlan.dinner?.lipids || 0),
        fluid: Number(mealPlan.hemodialysisLimits?.fluid || 0),
      }
    : { carbohydrates: 0, proteins: 0, lipids: 0, fluid: 0 };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh-circle" size={40} color={colors.primary} style={styles.spinner} />
          <Text style={styles.loadingText}>Loading meal plans...</Text>
        </View>
      </View>
    );
  }

  if (error || !mealPlan) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error || 'No meal plan data available.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header />
      {warnings.length > 0 && <WarningSection warnings={warnings} />}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Daily Targets</Text>
          <Ionicons name="flag-outline" size={24} color={colors.primary} />
        </View>
        {['breakfast', 'lunch', 'dinner'].map((mealType) => (
          <MealCard
            key={mealType}
            mealType={mealType as 'breakfast' | 'lunch' | 'dinner'}
            meal={mealPlan[mealType]}
            consumed={mealPlan.consumed[mealType]}
            onPress={openModal}
          />
        ))}
        <LimitsCard limits={mealPlan.hemodialysisLimits} />
        <Text style={styles.progressTitle}>Your Progress</Text>
        <ProgressBar label="Carbohydrates" consumed={totalConsumed.carbohydrates} target={totalTargets.carbohydrates} />
        <ProgressBar label="Proteins" consumed={totalConsumed.proteins} target={totalTargets.proteins} />
        <ProgressBar label="Lipids" consumed={totalConsumed.lipids} target={totalTargets.lipids} />
        <ProgressBar label="Fluid Intake" consumed={totalConsumed.fluid} target={totalTargets.fluid} />
      </View>
      <MealModal
        visible={modalVisible}
        mealType={selectedMeal}
        mealPlan={mealPlan}
        tempConsumed={tempConsumed}
        setTempConsumed={setTempConsumed}
        onClose={closeModal}
        onSubmit={handleMealConsumption}
      />
    </ScrollView>
  );
};

// Styles
const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
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
    warningContainer: {
      backgroundColor: colors.warningBackground,
      borderRadius: 8,
      padding: 15,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    warningTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.danger,
      marginLeft: 8,
    },
    warningText: {
      fontSize: 14,
      color: colors.danger,
      marginBottom: 4,
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
    mealCard: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    mealCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    mealCardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    mealCardText: {
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    limitsCard: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 15,
      marginTop: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    limitsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 10,
    },
    limitsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    limitsText: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 15,
    },
    progressItem: {
      marginBottom: 15,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    progressBar: {
      backgroundColor: '#e5e7eb',
      borderRadius: 12,
      height: 24,
      overflow: 'hidden',
      position: 'relative',
    },
    progressFill: {
      backgroundColor: colors.primary,
      height: '100%',
    },
    progressText: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      textAlign: 'center',
      lineHeight: 24,
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 15,
      textAlign: 'center',
    },
    nutrientSection: {
      marginBottom: 15,
    },
    nutrientTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    recommendedLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    recommendedFood: {
      fontSize: 14,
      color: colors.textPrimary,
      marginLeft: 10,
      marginBottom: 4,
    },
    noRecommendations: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    consumptionSection: {
      marginTop: 10,
    },
    consumptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 10,
    },
    consumptionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    consumptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 5,
      justifyContent: 'center',
    },
    consumptionButtonText: {
      fontSize: 14,
      marginLeft: 5,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: colors.neutral,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
      marginRight: 10,
    },
    cancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
    },
    submitButtonText: {
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorBackground,
      borderRadius: 8,
      padding: 10,
      marginVertical: 15,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: 16,
      color: colors.danger,
      marginLeft: 8,
    },
  });

export default MealPlansScreen;