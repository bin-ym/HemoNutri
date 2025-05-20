  import React, { useState, useEffect } from 'react';
  import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Switch } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';
  import { Ionicons } from '@expo/vector-icons';
  import { useColors } from '../../theme/colors';
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
    carbohydrates: number;
    proteins: number;
    lipids: number;
    potassium: number;
    phosphorus: number;
    sodium: number;
    isFluid: boolean;
  };

  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

  const FoodLogsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const colors = useColors();
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [newLog, setNewLog] = useState({
      foodItem: '',
      quantity: '',
      carbohydrates: '',
      proteins: '',
      lipids: '',
      potassium: '',
      phosphorus: '',
      sodium: '',
      isFluid: false,
    });

    useEffect(() => {
      const fetchFoodLogs = async () => {
        try {
          const response = await api.get('/api/patient/food-logs');
          setFoodLogs(Array.isArray(response.data) ? response.data : []);
          setError('');
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to load food logs');
        } finally {
          setLoading(false);
        }
      };
      fetchFoodLogs();
    }, []);

    const handleAddFoodLog = async () => {
      try {
        const payload = {
          foodItem: newLog.foodItem,
          quantity: parseFloat(newLog.quantity),
          carbohydrates: parseFloat(newLog.carbohydrates) || 0,
          proteins: parseFloat(newLog.proteins) || 0,
          lipids: parseFloat(newLog.lipids) || 0,
          potassium: parseFloat(newLog.potassium) || 0,
          phosphorus: parseFloat(newLog.phosphorus) || 0,
          sodium: parseFloat(newLog.sodium) || 0,
          isFluid: newLog.isFluid,
          date: new Date().toISOString(),
        };
        const response = await api.post('/api/patient/food-logs', payload);
        setFoodLogs([response.data, ...foodLogs]);
        setModalVisible(false);
        setNewLog({
          foodItem: '',
          quantity: '',
          carbohydrates: '',
          proteins: '',
          lipids: '',
          potassium: '',
          phosphorus: '',
          sodium: '',
          isFluid: false,
        });
        Alert.alert('Success', 'Food log added successfully!');
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to add food log');
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
    };

    const renderFoodLog = ({ item }: { item: FoodLog }) => (
      <View style={styles.logItem}>
        <View>
          <Text style={styles.logText}>
            {item.foodItem} - {item.quantity} {item.isFluid ? 'ml' : 'g'}
          </Text>
          <Text style={styles.logSubText}>
            Carbs: {item.carbohydrates}g, Proteins: {item.proteins}g, Lipids: {item.lipids}g
          </Text>
          <Text style={styles.logSubText}>
            K: {item.potassium}mg, P: {item.phosphorus}mg, Na: {item.sodium}mg
          </Text>
          <Text style={styles.logDate}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {formatDate(item.date)}
          </Text>
        </View>
      </View>
    );

    if (loading) {
      return (
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh-circle" size={40} color={colors.primary} style={styles.spinner} />
            <Text style={styles.loadingText}>Loading food logs...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Logs</Text>
          <Text style={styles.subtitle}>Track your daily food and fluid intake.</Text>
          <Ionicons name="fast-food" size={40} color={colors.primary} style={styles.headerIcon} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add New Log</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Food Logs</Text>
            <Ionicons name="fast-food" size={24} color={colors.primary} />
          </View>
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

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Food Log</Text>
              <TextInput
                style={styles.input}
                placeholder="Food Item"
                value={newLog.foodItem}
                onChangeText={(text) => setNewLog({ ...newLog, foodItem: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Quantity (g or ml)"
                keyboardType="numeric"
                value={newLog.quantity}
                onChangeText={(text) => setNewLog({ ...newLog, quantity: text })}
              />
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Is Fluid?</Text>
                <Switch
                  value={newLog.isFluid}
                  onValueChange={(value) => setNewLog({ ...newLog, isFluid: value })}
                  trackColor={{ false: colors.textSecondary, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Carbohydrates (g)"
                keyboardType="numeric"
                value={newLog.carbohydrates}
                onChangeText={(text) => setNewLog({ ...newLog, carbohydrates: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Proteins (g)"
                keyboardType="numeric"
                value={newLog.proteins}
                onChangeText={(text) => setNewLog({ ...newLog, proteins: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Lipids (g)"
                keyboardType="numeric"
                value={newLog.lipids}
                onChangeText={(text) => setNewLog({ ...newLog, lipids: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Potassium (mg)"
                keyboardType="numeric"
                value={newLog.potassium}
                onChangeText={(text) => setNewLog({ ...newLog, potassium: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phosphorus (mg)"
                keyboardType="numeric"
                value={newLog.phosphorus}
                onChangeText={(text) => setNewLog({ ...newLog, phosphorus: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Sodium (mg)"
                keyboardType="numeric"
                value={newLog.sodium}
                onChangeText={(text) => setNewLog({ ...newLog, sodium: text })}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleAddFoodLog}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
      errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorBackground,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.danger,
      },
      errorText: {
        fontSize: 16,
        color: colors.danger,
        marginLeft: 8,
      },
      addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
      },
      addIcon: {
        marginRight: 8,
      },
      addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      section: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 15,
        flex: 1,
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
        flex: 1,
      },
      logItem: {
        backgroundColor: colors.secondary,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.secondary,
      },
      logText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
      },
      logSubText: {
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: 2,
      },
      logDate: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
      },
      emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 20,
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
      input: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.secondary,
        fontSize: 16,
        color: colors.textPrimary,
      },
      switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      switchLabel: {
        fontSize: 16,
        color: colors.textPrimary,
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
    });

  export default FoodLogsScreen;