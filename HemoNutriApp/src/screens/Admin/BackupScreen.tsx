import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { useColors } from '../../theme/colors';
import { getAuthData } from '../../utils/auth';
import api from '../../api/api';
import { AxiosError } from 'axios';

interface Backup {
  _id: string;
  filename: string;
  timestamp: string;
}

const BackupScreen: React.FC = () => {
  const colors = useColors();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const fetchBackupHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await getAuthData();
      if (!token) {
        setError('Authentication required.');
        return;
      }
      const res = await api.get('/admin/backup/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackups(res.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Fetch backup history error:', axiosError.message);
      setError('Failed to load backup history: ' + axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreatingBackup(true);
      setError('');
      const { token } = await getAuthData();
      const res = await api.get('/admin/backup', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // For file download
      });

      // Placeholder for file download
      // You'll need expo-file-system and expo-sharing to save and share the file
      Alert.alert('Success', 'Backup created successfully. Download functionality to be implemented.');
      fetchBackupHistory(); // Refresh the history
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Create backup error:', axiosError.message);
      Alert.alert('Error', 'Failed to create backup: ' + axiosError.message);
    } finally {
      setCreatingBackup(false);
    }
  };

  const downloadBackup = async (id: string, filename: string) => {
    try {
      const { token } = await getAuthData();
      const res = await api.get(`/admin/backup/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // For file download
      });

      // Placeholder for file download
      // You'll need expo-file-system and expo-sharing to save and share the file
      Alert.alert('Download', `Downloading ${filename}... (Functionality to be implemented)`);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Download backup error:', axiosError.message);
      Alert.alert('Error', 'Failed to download backup: ' + axiosError.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading backup history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Backup Management</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      <Button
        title={creatingBackup ? 'Creating Backup...' : 'Create Backup'}
        onPress={createBackup}
        buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitle}
        disabled={creatingBackup}
      />

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Backup History</Text>
      <FlatList
        data={backups}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>{item.filename}</Text>
              <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>
                Created: {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
            <Button
              icon={<Icon name="download" type="ionicon" color={colors.primary} />}
              onPress={() => downloadBackup(item._id, item.filename)}
              type="clear"
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No backups found.</Text>
        }
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemTextContainer: {
    flex: 1,
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

export default BackupScreen;