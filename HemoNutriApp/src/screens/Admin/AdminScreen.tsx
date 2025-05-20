import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { clearAuthData, getAuthData } from '../../utils/auth';
import { useColors } from '../../theme/colors';
import api from '../../api/api';

const AdminScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    userCount: 0,
    resourceCount: 0,
    lastBackup: null,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const { token } = await getAuthData();
        if (!token) {
          setError('Please log in as an admin.');
          return;
        }

        const [usersRes, resourcesRes, backupsRes] = await Promise.all([
          api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Users API error:', err.response?.status, err.response?.data);
            throw err;
          }),
          api.get('/admin/resources', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Resources API error:', err.response?.status, err.response?.data);
            throw err;
          }),
          api.get('/admin/backup/history', { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
            console.error('Backup History API error:', err.response?.status, err.response?.data);
            throw err;
          }),
        ]);

        setSummary({
          userCount: usersRes.data.length,
          resourceCount: resourcesRes.data.length,
          lastBackup: backupsRes.data.length > 0 ? backupsRes.data[0].timestamp : null,
        });
      } catch (err) {
        console.error('Admin summary fetch error:', err.message);
        setError(`Failed to load admin summary: ${err.message}. Please check network and server status.`);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleLogout = async () => {
    await clearAuthData();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Admin Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage users, resources, and more.</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryText, { color: colors.textPrimary }]}>Users: {summary.userCount}</Text>
            <Text style={[styles.summaryText, { color: colors.textPrimary }]}>Resources: {summary.resourceCount}</Text>
            <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
              Last Backup: {summary.lastBackup ? new Date(summary.lastBackup).toLocaleString() : 'Never'}
            </Text>
          </View>

          <Button
            title="Manage Users"
            onPress={() => navigation.navigate('Users')}
            buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonTitle}
          />
          <Button
            title="Manage Resources"
            onPress={() => navigation.navigate('Resources')}
            buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonTitle}
          />
          <Button
            title="Generate Report"
            onPress={() => navigation.navigate('Reports')}
            buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonTitle}
          />
          <Button
            title="Create Backup"
            onPress={() => navigation.navigate('Backup')}
            buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonTitle}
          />
        </>
      )}

      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={[styles.button, { backgroundColor: colors.danger }]}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitle}
      />
    </ScrollView>
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
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
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
  summaryCard: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
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
});

export default AdminScreen;