import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { colors } from '../../theme/colors';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
  ManageMealPlans: undefined;
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
  Messages: undefined;
  Conversation: { patientId: string }; // Added for conversation screen
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

type Patient = {
  id: string;
  username: string;
  email: string;
};

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
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

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => navigation.navigate('Conversation', { patientId: item.id })}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.username}</Text>
        <Text style={styles.patientEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Select a patient to view messages.</Text>
      </View>

      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
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
  },
});

export default MessagesScreen;