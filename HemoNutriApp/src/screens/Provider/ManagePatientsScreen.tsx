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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManagePatients'>;

type Patient = {
  id: string;
  username: string;
  email: string;
};

const ManagePatientsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newPatient, setNewPatient] = useState({ username: '', email: '' });
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/provider/patients');
        setPatients(response.data.map((p: any) => ({
          id: p._id,
          username: p.username,
          email: p.email,
        })));
        setError('');
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleAddPatient = async () => {
    if (!newPatient.username || !newPatient.email) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await api.post('/api/admin/users', {
        username: newPatient.username,
        email: newPatient.email,
        role: 'patient',
      });
      setPatients([...patients, { id: response.data._id, ...newPatient }]);
      setNewPatient({ username: '', email: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Patient added successfully!');
      setError('');
    } catch (err: any) {
      console.error('Add patient error:', err);
      setError('Failed to add patient');
    }
  };

  const handleEditPatient = async () => {
    if (!editingPatient || !editingPatient.username || !editingPatient.email) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await api.put(`/api/provider/patients/${editingPatient.id}`, {
        username: editingPatient.username,
        email: editingPatient.email,
      });
      setPatients(
        patients.map((patient) =>
          patient.id === editingPatient.id
            ? { ...patient, username: response.data.username, email: response.data.email }
            : patient
        )
      );
      setEditModalVisible(false);
      setEditingPatient(null);
      Alert.alert('Success', 'Patient updated successfully!');
      setError('');
    } catch (err: any) {
      console.error('Edit patient error:', err);
      setError('Failed to update patient');
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/provider/patients/${patientId}`);
              setPatients(patients.filter((patient) => patient.id !== patientId));
              Alert.alert('Success', 'Patient deleted successfully!');
              setError('');
            } catch (err: any) {
              console.error('Delete patient error:', err);
              setError('Failed to delete patient');
            }
          },
        },
      ]
    );
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <View style={styles.patientItem}>
      <Text style={styles.patientName}>{item.username}</Text>
      <Text style={styles.patientEmail}>{item.email}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingPatient(item);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="pencil-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePatient(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('ProviderPatientDetail', { patientId: item.id })}
        >
          <Ionicons name="eye-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manage Patients</Text>
        <Text style={styles.subtitle}>Add, edit, or remove patients.</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Patients List */}
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      {/* Add Patient Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Patient</Text>
      </TouchableOpacity>

      {/* Add Patient Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Patient</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={newPatient.username}
              onChangeText={(text) => setNewPatient({ ...newPatient, username: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newPatient.email}
              onChangeText={(text) => setNewPatient({ ...newPatient, email: text })}
              keyboardType="email-address"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddPatient}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Patient</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={editingPatient.username}
                onChangeText={(text) => setEditingPatient({ ...editingPatient, username: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={editingPatient.email}
                onChangeText={(text) => setEditingPatient({ ...editingPatient, email: text })}
                keyboardType="email-address"
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleEditPatient}>
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
  patientItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  patientEmail: {
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
    marginRight: 10,
  },
  viewButton: {
    backgroundColor: colors.secondary,
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

export default ManagePatientsScreen;