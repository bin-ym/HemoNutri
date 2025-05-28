import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import api from '../../api/api';

type Report = {
  users: { username: string; role: string }[];
  foodLogs: number;
  resources: { title: string; description: string; url: string; provider: string }[];
  timestamp: string;
};

const ReportsScreen: React.FC = () => {
  const { colors } = useColors();
  const [report, setReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<'all' | 'patient' | 'provider'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [filter]);

  const fetchReport = async () => {
    try {
      const response = await api.get(`/api/admin/report?filter=${filter}`);
      setReport(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load report');
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: { username: string; role: string } }) => (
    <View style={[styles.item, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.username} ({item.role})</Text>
    </View>
  );

  const renderResource = ({ item }: { item: { title: string; description: string; url: string; provider: string } }) => (
    <View style={[styles.item, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{item.description}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>Provider: {item.provider}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Usage Reports</Text>
      <View style={styles.filterContainer}>
        <Button title="All" onPress={() => setFilter('all')} color={filter === 'all' ? colors.primary : colors.secondary} />
        <Button title="Patients" onPress={() => setFilter('patient')} color={filter === 'patient' ? colors.primary : colors.secondary} />
        <Button title="Providers" onPress={() => setFilter('provider')} color={filter === 'provider' ? colors.primary : colors.secondary} />
      </View>
      {loading ? (
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      ) : report ? (
        <>
          <Text style={[styles.subHeader, { color: colors.primary }]}>Users</Text>
          <FlatList
            data={report.users}
            renderItem={renderUser}
            keyExtractor={(item) => item.username}
            style={styles.list}
          />
          <Text style={[styles.subHeader, { color: colors.primary }]}>Food Logs: {report.foodLogs}</Text>
          <Text style={[styles.subHeader, { color: colors.primary }]}>Resources</Text>
          <FlatList
            data={report.resources}
            renderItem={renderResource}
            keyExtractor={(item) => item.title}
            style={styles.list}
          />
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Generated: {new Date().toLocaleString()}
          </Text>
        </>
      ) : (
        <Text style={[styles.text, { color: colors.textPrimary }]}>No report data available</Text>
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
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  list: {
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default ReportsScreen;