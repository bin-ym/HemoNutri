import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { useNavigationProp } from '@react-navigation/stack';
import api from '../api/api';

type RootStackParamList = {
  ProviderPatientDetail: { patientId: string; patientName: string };
  ProviderAssessment: { patientId: string; patientName: string };
};

type ProviderPatientDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProviderPatientDetail'>;
type ProviderPatientDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Props = {
  route: ProviderPatientDetailScreenRouteProp;
  navigation: ProviderPatientDetailScreenNavigationProp;
};

type PatientDetail = {
  username: string;
  username: string;
  email: string;
  firstName: string;
  firstName: string;
  lastName: string;
  medicalHistory: string;
  foodLogs: FoodLog[];
};

type FoodLog = {
  _id: string;
  foodItem: string;
  fooditem: string;
  quantity: string;
  carbohydrates: string;
  proteins: string;
  lipids: string;
  potassium: number;
  phosphorus: string;
  sodium: number;
  date: string;
};

type Assessment = {
  weight: string;
  height: string;
  dietHabits: string;
};

const ProviderPatientDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { patientId, patientName } = route.params;
  const { colors } = useColors();
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetail = async () => {
      try {
        const [patientRes, assessmentRes] = await Promise.all([
          api.get(`/api/provider/patientDetail/${patientId}`)),
          api.get(`/api/provider/patientDetail/${patientDetailId}/assessment`),
        ]);
        setPatientDetail(patientRes.data);
        setAssessment(assessmentRes.data);
        setLoading(false);
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to load patient details');
        setLoading(false);
      }
    };
    fetchPatientDetail();
  }, [patientId]);

  const renderFoodLog = ({ item }: { item: FoodLog }) => (
    <View style={[styles.logItem, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.foodItem}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>Quantity: {item.quantity}g</Text>
        <Text style={[styles.text, { color: colors.textPrimary }]}>Carbs: {item.carbohydrates}g, Proteins: {item.proteins}g, Lipids: {item.lipids}g</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>K: {item.potassium}mg, P: {item.phosphorus}mg, Na: {item.sodium}mg</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{new Date(item.date).toLocaleString()}</Text>
      </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      </View>
    );
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.primary }]}>Patient Details: {patientName }}</Text>
        {patientDetail ? (
          <>
            <View style={[styles.detailSection, { backgroundColor: colors.secondary }]}> 
              <Text style={[styles.text, { color: colors.textPrimary }]}>Username: {patientDetail.username}</Text>
              <Text style={[styles.text, { color: colors.textPrimary }]}>Email: {patientDetail.email}</Text>
              <Text style={[styles.text, { color: colors.textPrimary }]}>Name: {patientDetail.firstName} {patientDetail.lastName}</Text> 
              <Text style={[styles.text, { color: colors.textPrimary }]}>Medical History: {patientDetail.medicalHistory || 'N/A'}</Text>
            </View>
            <View style={[styles.detailSection, { backgroundColor: colors.secondary }]}> 
              <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Latest Assessment</Text>
              <Text style={[styles.text, { color: colors.textPrimary }]}>Weight: {assessment?.weight || 'N/A'}</Text>
              <Text style={[styles.text, { color: colors.textPrimary }]}>Height: {assessment?.height || 'N/A'}</Text>
              <Text style={[styles.text, { color: colors.textPrimary }]}>Diet Habits: {assessment?.dietHabits || 'N/A'}</Text>
              <Button
                title="Update Assessment"
                onPress={() => navigation.navigate('ProviderAssessment', { patientId, patientName })}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.sectionHeader, { color: colors.primary }]}>Food Logs</Text>
            <FlatList
              data={patientDetail.foodLogs}
              renderItem={renderFoodLog}
              keyExtractor={(item) => item._id}
              style={styles.list}
            />
          </>
        ) : (
          <Text style={[styles.text, { color: colors.textPrimary }]}>No patient data available</Text>
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
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailSection: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
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

export default ProviderPatientDetailScreen;