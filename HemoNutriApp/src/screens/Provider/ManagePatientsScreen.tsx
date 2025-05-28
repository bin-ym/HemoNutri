import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../../api/api';

type RootStackParamList = {
  ProviderPatientDetail: { patientId: string; patientName: string };
};

type ManagePatientsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Patient = {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  medicalHistory: string;
  foodLogs: any[];
};

const ManagePatientsScreen: React.FC = () => {
  const { colors } = useColors();
  const navigation = useNavigation<ManagePatientsScreenNavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/provider/patients');
      setPatients(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load patients');
      setLoading(false);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await api.delete(`/api/provider/patient/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
      Alert.alert('Success', 'Patient deleted successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to delete patient');
    }
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[styles.patientItem, { backgroundColor: colors.secondary }]}
      onPress={() =>
        navigation.navigate('ProviderPatientDetail', {
          patientId: item._id,
          patientName: item.username,
        })
      }
    >
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.username}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{item.email}</Text>
      <Button title="Delete" onPress={() => deletePatient(item._id)} color={colors.error} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Manage Patients</Text>
      {loading ? (
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatient}
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
  list: {
    marginTop: 20,
  },
  patientItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default ManagePatientsScreen;