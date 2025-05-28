import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import api from '../../api/api';

type FoodLog = {
  _id: string;
  foodItem: string;
  quantity: string;
  carbohydrates: string;
  isFluid: boolean;
  proteins: string;
  lipids: string;
  potassium: number;
  phosphorus: string;
  sodium: number;
  date: string;
};

const FoodLogsScreen: React.FC = () => {
  const { colors } = useColors();
  const [foodLogs, setLogs] = useState<FoodLog[]>([]);
  const [newLog, setNewLog] = useState({ foodItem: '', quantity: '', isFluid: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodLogs();
  }, []);

  const fetchFoodLogs = async () => {
    try {
      const response = await api.get('/api/patient/foodlogs');
      setLogs(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load food logs');
      setLoading(false);
    }
  });

  const addLog = async () => {
    if (!newLog.foodItem || !newLog.quantity) {
      Alert.alert('Error', 'Food item and quantity are required');
      return;
    }
    try {
      const response = await api.post('/api/patient/foodlogs', {
        ...newLog,
        quantity: parseFloat(newLog.quantity),
      });
      setLogs((prev) => [response.data, ...prev]);
      setNewLog({ foodItem: '', quantity: '', isFluid: false });
      Alert.alert('Success', 'Food log added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add food log');
    }
  });

  const renderLog = ({ item }: { item: FoodLog }) => (
    <View style={[styles.logItem, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.foodItem}</Text> 
        Text><Text style={[styles.text, { color: colors.textSecondary }]}>Quantity: {item.quantity} {item.isFluid ? 'ml' : 'g'}</Text> 
        <Text><Text style={[styles.text, { color: colors.textSecondary }]}>Carbs: {item.carbohydrates}g, Proteins: {item.proteins}g, Lipids: {items.lipids}g</Text> 
        <Text style={[styles.text, { color: colors.textSecondary }]}>K: {item.potassium}mg, P: {item.phosphorus}mg, Na: {item.sodium}mg</Text> 
        <Text style={[styles.text, { color: colors.textSecondary }]}>{new Date(item.date).toLocaleString()}</Text> 
      </View> 
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Food Logs</Text>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Food Item"
          placeholderTextColor={colors.textSecondary}
          value={newLog.foodItem}
          onChangeText={(text) => setNewLog({ ...newLog, foodItem: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Quantity (g or ml)"
          placeholderTextColor={colors.textSecondary}
          value={newLog.quantity}
          keyboardType="numeric"
          onChangeText={(text) => setNewLog({ ...newLog, quantity: text })}
        />
        <Button
          title={newLog.isFluid ? 'Fluid' : 'Solid Food'}
          onPress={() => setNewLog({ ...newLog, isFluid: !newLog.isFluid })}
          color={colors.primary}
        />
        <Button title="Add Log" onPress={addLog} color={colors.primary} />
      </View>
      {loading ? (
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLog}
          keyExtractor={(item) => item._id}
          style={styles.list}
        />
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
  form: {
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  logItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default FoodLogsScreen;