import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Button, CheckBox } from '@rneui/themed';
import { useColors } from '../../theme/colors';
import { getAuthData } from '../../utils/auth';
import api from '../../api/api';
import { AxiosError } from 'axios';

interface Report {
  users: { username: string; role: string }[];
  foodLogs: number;
  resources: { title: string; description: string; url: string; provider: string }[];
  timestamp: string;
}

const ReportsScreen: React.FC = () => {
  const colors = useColors();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'patient' | 'provider'>('all');

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await getAuthData();
      if (!token) {
        setError('Authentication required.');
        return;
      }
      const res = await api.get('/admin/report', {
        headers: { Authorization: `Bearer ${token}` },
        params: { filter },
      });
      setReport(res.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Generate report error:', axiosError.message);
      setError('Failed to generate report: ' + axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Generate Report</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Filter Selection */}
      <View style={styles.filterContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Filter</Text>
        <CheckBox
          title="All"
          checked={filter === 'all'}
          onPress={() => setFilter('all')}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          containerStyle={styles.checkbox}
          textStyle={{ color: colors.textPrimary }}
        />
        <CheckBox
          title="Patients"
          checked={filter === 'patient'}
          onPress={() => setFilter('patient')}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          containerStyle={styles.checkbox}
          textStyle={{ color: colors.textPrimary }}
        />
        <CheckBox
          title="Providers"
          checked={filter === 'provider'}
          onPress={() => setFilter('provider')}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          containerStyle={styles.checkbox}
          textStyle={{ color: colors.textPrimary }}
        />
        <Button
          title={loading ? 'Generating...' : 'Generate Report'}
          onPress={generateReport}
          buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonTitle}
          disabled={loading}
        />
      </View>

      {/* Report Data */}
      {report && (
        <View style={styles.reportContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Report Generated</Text>
          <Text style={[styles.itemText, { color: colors.textSecondary }]}>
            Timestamp: {new Date(report.timestamp).toLocaleString()}
          </Text>
          <Text style={[styles.itemText, { color: colors.textSecondary }]}>
            Total Food Logs: {report.foodLogs}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Users</Text>
          <FlatList
            data={report.users}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                  {item.username} ({item.role})
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users in report.</Text>
            }
          />

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Resources</Text>
          <FlatList
            data={report.resources}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.itemText, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>{item.description}</Text>
                <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>URL: {item.url}</Text>
                <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>Provider: {item.provider}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No resources in report.</Text>
            }
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  errorContainer: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportContainer: {
    marginBottom: 20,
  },
  itemContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReportsScreen;