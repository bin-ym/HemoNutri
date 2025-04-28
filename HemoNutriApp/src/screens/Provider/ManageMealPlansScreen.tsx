import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageMealPlans'>;

type MealItem = {
  name: string;
  quantity: string;
  isFluid: boolean;
};

type MealPlanMeals = {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
};

type MealPlan = {
  id: string;
  patientId: string;
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  updatedAt: string;
  patient?: { username: string };
};

type NewMealPlan = {
  patientId: string;
} & MealPlanMeals;

const ManageMealPlansScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newMealPlan, setNewMealPlan] = useState<NewMealPlan>({
    patientId: '',
    breakfast: [{ name: '', quantity: '', isFluid: false }],
    lunch: [{ name: '', quantity: '', isFluid: false }],
    dinner: [{ name: '', quantity: '', isFluid: false }],
  });
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/provider/meal-plans');
        setMealPlans(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching meal plans:', err);
        setError('Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };
    fetchMealPlans();
  }, []);

  const handleMealPlanChange = (
    mealType: keyof MealPlanMeals,
    index: number,
    field: keyof MealItem,
    value: string | boolean
  ) => {
    if (editModalVisible && editingMealPlan) {
      const updatedMealPlan = { ...editingMealPlan };
      const updatedMeal = [...updatedMealPlan[mealType]];
      updatedMeal[index] = { ...updatedMeal[index], [field]: value };
      updatedMealPlan[mealType] = updatedMeal;
      setEditingMealPlan(updatedMealPlan);
    } else {
      const updatedMealPlan = { ...newMealPlan };
      const updatedMeal = [...updatedMealPlan[mealType]];
      updatedMeal[index] = { ...updatedMeal[index], [field]: value };
      updatedMealPlan[mealType] = updatedMeal;
      setNewMealPlan(updatedMealPlan);
    }
  };

  const addMealItem = (mealType: keyof MealPlanMeals) => {
    if (editModalVisible && editingMealPlan) {
      const updatedMealPlan = { ...editingMealPlan };
      updatedMealPlan[mealType].push({ name: '', quantity: '', isFluid: false });
      setEditingMealPlan(updatedMealPlan);
    } else {
      const updatedMealPlan = { ...newMealPlan };
      updatedMealPlan[mealType].push({ name: '', quantity: '', isFluid: false });
      setNewMealPlan(updatedMealPlan);
    }
  };

  const handleAddMealPlan = async () => {
    if (!newMealPlan.patientId) {
      Alert.alert('Error', 'Please select a patient.');
      return;
    }
    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      for (const item of newMealPlan[mealType]) {
        if (!item.name || !item.quantity) {
          Alert.alert('Error', 'Please fill in all meal plan fields.');
          return;
        }
      }
    }

    try {
      const response = await api.post(`/api/provider/meal-plan/${newMealPlan.patientId}`, {
        breakfast: newMealPlan.breakfast,
        lunch: newMealPlan.lunch,
        dinner: newMealPlan.dinner,
      });
      setMealPlans([...mealPlans, response.data]);
      setNewMealPlan({
        patientId: '',
        breakfast: [{ name: '', quantity: '', isFluid: false }],
        lunch: [{ name: '', quantity: '', isFluid: false }],
        dinner: [{ name: '', quantity: '', isFluid: false }],
      });
      setModalVisible(false);
      Alert.alert('Success', 'Meal plan added successfully!');
      setError('');
    } catch (err: any) {
      console.error('Add meal plan error:', err);
      setError('Failed to add meal plan');
    }
  };

  const handleEditMealPlan = async () => {
    if (!editingMealPlan) return;
    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      for (const item of editingMealPlan[mealType]) {
        if (!item.name || !item.quantity) {
          Alert.alert('Error', 'Please fill in all meal plan fields.');
          return;
        }
      }
    }

    try {
      const response = await api.put(`/api/provider/meal-plans/${editingMealPlan.id}`, {
        breakfast: editingMealPlan.breakfast,
        lunch: editingMealPlan.lunch,
        dinner: editingMealPlan.dinner,
      });
      setMealPlans(mealPlans.map((plan) => (plan.id === editingMealPlan.id ? response.data : plan)));
      setEditModalVisible(false);
      setEditingMealPlan(null);
      Alert.alert('Success', 'Meal plan updated successfully!');
      setError('');
    } catch (err: any) {
      console.error('Edit meal plan error:', err);
      setError('Failed to update meal plan');
    }
  };

  const handleDeleteMealPlan = async (mealPlanId: string) => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this meal plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/provider/meal-plans/${mealPlanId}`);
              setMealPlans(mealPlans.filter((plan) => plan.id !== mealPlanId));
              Alert.alert('Success', 'Meal plan deleted successfully!');
              setError('');
            } catch (err: any) {
              console.error('Delete meal plan error:', err);
              setError('Failed to delete meal plan');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
  };

  const renderMealPlan = ({ item }: { item: MealPlan }) => (
    <View style={styles.mealPlanItem}>
      <Text style={styles.mealPlanTitle}>Patient: {item.patient?.username || 'Unknown'}</Text>
      <Text style={styles.mealPlanDate}>Last Updated: {formatDate(item.updatedAt)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingMealPlan(item);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="pencil-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMealPlan(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading meal plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manage Meal Plans</Text>
        <Text style={styles.subtitle}>Create and manage meal plans for your patients.</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Meal Plans List */}
      <FlatList
        data={mealPlans}
        renderItem={renderMealPlan}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      {/* Add Meal Plan Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Meal Plan</Text>
      </TouchableOpacity>

      {/* Add Meal Plan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Meal Plan</Text>
            <TextInput
              style={styles.input}
              placeholder="Patient ID"
              value={newMealPlan.patientId}
              onChangeText={(text) => setNewMealPlan({ ...newMealPlan, patientId: text })}
            />
            {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
              <View key={mealType} style={styles.mealSection}>
                <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                {newMealPlan[mealType].map((item, index) => (
                  <View key={index} style={styles.mealItem}>
                    <TextInput
                      style={styles.input}
                      placeholder="Food/Drink Name"
                      value={item.name}
                      onChangeText={(value) =>
                        handleMealPlanChange(mealType, index, 'name', value)
                      }
                    />
                    <TextInput
                      style={[styles.input, styles.quantityInput]}
                      placeholder="Quantity"
                      value={item.quantity}
                      onChangeText={(value) =>
                        handleMealPlanChange(mealType, index, 'quantity', value)
                      }
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={[styles.unitButton, item.isFluid ? styles.unitButtonFluid : styles.unitButtonSolid]}
                      onPress={() =>
                        handleMealPlanChange(mealType, index, 'isFluid', !item.isFluid)
                      }
                    >
                      <Text style={styles.unitButtonText}>{item.isFluid ? 'ml' : 'g'}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => addMealItem(mealType)}
                >
                  <Text style={styles.addItemText}>+ Add Item</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddMealPlan}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Meal Plan Modal */}
      {editingMealPlan && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Meal Plan</Text>
              {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
                <View key={mealType} style={styles.mealSection}>
                  <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                  {editingMealPlan[mealType].map((item, index) => (
                    <View key={index} style={styles.mealItem}>
                      <TextInput
                        style={styles.input}
                        placeholder="Food/Drink Name"
                        value={item.name}
                        onChangeText={(value) =>
                          handleMealPlanChange(mealType, index, 'name', value)
                        }
                      />
                      <TextInput
                        style={[styles.input, styles.quantityInput]}
                        placeholder="Quantity"
                        value={item.quantity}
                        onChangeText={(value) =>
                          handleMealPlanChange(mealType, index, 'quantity', value)
                        }
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={[styles.unitButton, item.isFluid ? styles.unitButtonFluid : styles.unitButtonSolid]}
                        onPress={() =>
                          handleMealPlanChange(mealType, index, 'isFluid', !item.isFluid)
                        }
                      >
                        <Text style={styles.unitButtonText}>{item.isFluid ? 'ml' : 'g'}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => addMealItem(mealType)}
                  >
                    <Text style={styles.addItemText}>+ Add Item</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleEditMealPlan}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    textAlign: 'center',
  },
  list: {
    flexGrow: 0,
  },
  mealPlanItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  mealPlanDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    padding: 10,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#fff',
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  cancelButton: {
    backgroundColor: colors.secondary,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManageMealPlansScreen;