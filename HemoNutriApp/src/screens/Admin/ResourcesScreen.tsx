import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import api from '../../api/api';

type Resource = {
  _id: string;
  title: string;
  description: string;
  url: string;
  providerId: { username: string };
};

const ResourcesScreen: React.FC = () => {
  const { colors } = useColors();
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({ title: '', description: '', url: '', providerId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/api/admin/resources');
      setResources(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load resources');
      setLoading(false);
    }
  };

  const addResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.providerId) {
      Alert.alert('Error', 'Title, description, and provider ID are required');
      return;
    }
    try {
      const response = await api.post('/api/admin/resources', newResource);
      setResources((prev) => [response.data, ...prev]);
      setNewResource({ title: '', description: '', url: '', providerId: '' });
      Alert.alert('Success', 'Resource added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add resource');
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await api.delete(`/api/admin/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
      Alert.alert('Success', 'Resource deleted successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to delete resource');
    }
  };

  const renderResource = ({ item }: { item: Resource }) => (
    <View style={[styles.resourceItem, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{item.description}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>Provider: {item.providerId.username}</Text>
      {item.url && (
        <Text style={[styles.text, { color: colors.textSecondary }]}>URL: {item.url}</Text>
      )}
      <Button title="Delete" onPress={() => deleteResource(item._id)} color={colors.error} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Manage Resources</Text>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={newResource.title}
          onChangeText={(text) => setNewResource({ ...newResource, title: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Description"
          placeholderTextColor={colors.textSecondary}
          value={newResource.description}
          onChangeText={(text) => setNewResource({ ...newResource, description: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="URL (optional)"
          placeholderTextColor={colors.textSecondary}
          value={newResource.url}
          onChangeText={(text) => setNewResource({ ...newResource, url: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Provider ID"
          placeholderTextColor={colors.textSecondary}
          value={newResource.providerId}
          onChangeText={(text) => setNewResource({ ...newResource, providerId: text })}
        />
        <Button title="Add Resource" onPress={addResource} color={colors.primary} />
      </View>
      {loading ? (
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      ) : (
        <FlatList
          data={resources}
          renderItem={renderResource}
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
  form: {
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  resourceItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default ResourcesScreen;