import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { useColors } from '../../theme/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
  ManageMealPlans: undefined;
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
  Messages: undefined;
  Conversation: { userId: string; username: string; role: string };
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
  const colors = useColors();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/provider/patients');
        setPatients(response.data.map((p: any) => ({
          id: p._id,
          username: p.username || 'Unknown Patient',
          email: p.email || 'No email provided',
        })));
        setError('');
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        setError(err.response?.data?.error || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[styles.patientItem, { borderColor: colors.secondary, backgroundColor: colors.background }]}
      onPress={() => navigation.navigate('Conversation', { userId: item.id, username: item.username, role: 'patient' })}
      accessibilityLabel={`Open conversation with ${item.username}`}
    >
      <View style={styles.patientInfo}>
        <Text style={[styles.patientName, { color: colors.primary }]}>{item.username}</Text>
        <Text style={[styles.patientEmail, { color: colors.textSecondary }]}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="refresh-circle" size={40} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Messages</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select a patient to view messages.</Text>
      </View>

      {error && (
        <View style={[styles.errorMessage, { backgroundColor: colors.errorBackground }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      {patients.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No patients assigned to you yet.</Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatient}
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    marginLeft: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    flexGrow: 0,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  patientEmail: {
    fontSize: 14,
  },
});

export default MessagesScreen;