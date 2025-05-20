import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { useColors } from '../../theme/colors';
import { getAuthData } from '../../utils/auth';
import api from '../../api/api';
import { AxiosError } from 'axios';

interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
  providerId: { username: string };
}

const ResourcesScreen: React.FC = () => {
  const colors = useColors();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newResource, setNewResource] = useState({ title: '', description: '', url: '', providerId: '' });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await getAuthData();
      if (!token) {
        setError('Authentication required.');
        return;
      }
      const res = await api.get('/admin/resources', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(res.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Fetch resources error:', axiosError.message);
      setError('Failed to load resources: ' + axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this resource?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { token } = await getAuthData();
            await api.delete(`/admin/resources/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setResources(resources.filter(resource => resource._id !== id));
            Alert.alert('Success', 'Resource deleted successfully.');
          } catch (err) {
            const axiosError = err as AxiosError;
            console.error('Delete resource error:', axiosError.message);
            Alert.alert('Error', 'Failed to delete resource: ' + axiosError.message);
          }
        },
      },
    ]);
  };

  const createResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.url || !newResource.providerId) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      const { token } = await getAuthData();
      const res = await api.post(
        '/admin/resources',
        {
          title: newResource.title,
          description: newResource.description,
          url: newResource.url,
          providerId: newResource.providerId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources([...resources, res.data]);
      setNewResource({ title: '', description: '', url: '', providerId: '' });
      Alert.alert('Success', 'Resource created successfully.');
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Create resource error:', axiosError.message);
      Alert.alert('Error', 'Failed to create resource: ' + axiosError.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Manage Resources</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Add Resource Form */}
      <View style={styles.formContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Add New Resource</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={newResource.title}
          onChangeText={text => setNewResource({ ...newResource, title: text })}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Description"
          placeholderTextColor={colors.textSecondary}
          value={newResource.description}
          onChangeText={text => setNewResource({ ...newResource, description: text })}
          multiline
        />
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="URL"
          placeholderTextColor={colors.textSecondary}
          value={newResource.url}
          onChangeText={text => setNewResource({ ...newResource, url: text })}
          keyboardType="url"
        />
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Provider ID"
          placeholderTextColor={colors.textSecondary}
          value={newResource.providerId}
          onChangeText={text => setNewResource({ ...newResource, providerId: text })}
        />
        <Button
          title="Create Resource"
          onPress={createResource}
          buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonTitle}
        />
      </View>

      {/* Resources List */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Resources List</Text>
      <FlatList
        data={resources}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>
                {item.description} (Provider: {item.providerId?.username || 'Unknown'})
              </Text>
              <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>URL: {item.url}</Text>
            </View>
            <Button
              icon={<Icon name="trash" type="ionicon" color={colors.danger} />}
              onPress={() => deleteResource(item._id)}
              type="clear"
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No resources found.</Text>
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
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
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

export default ResourcesScreen;