import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProviderEducation'>;

type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
};

const ProviderEducationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({ title: '', description: '', url: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/provider/education');
        setResources(response.data.map((r: any) => ({
          id: r._id,
          title: r.title,
          description: r.description,
          url: r.url,
        })));
        setError('');
      } catch (err: any) {
        console.error('Fetch resources error:', err);
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleResourceSubmit = async () => {
    if (!newResource.title || !newResource.description || !newResource.url) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await api.post('/api/provider/education', newResource);
      setResources([...resources, { id: response.data._id, ...newResource }]);
      setNewResource({ title: '', description: '', url: '' });
      Alert.alert('Success', 'Resource added successfully!');
      setError('');
    } catch (err: any) {
      console.error('Add resource error:', err);
      setError('Failed to add resource');
    }
  };

  const renderResource = ({ item }: { item: Resource }) => (
    <View style={styles.resourceItem}>
      <Text style={styles.resourceTitle}>{item.title}</Text>
      <Text style={styles.resourceDescription}>{item.description}</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(item.url)}
        style={styles.resourceLink}
      >
        <Text style={styles.resourceLinkText}>View Resource</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Educational Resources</Text>
        <Text style={styles.subtitle}>Share knowledge with your patients.</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Resources */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Resources</Text>
          <Ionicons name="book-outline" size={24} color={colors.primary} />
        </View>
        {resources.length === 0 ? (
          <Text style={styles.emptyText}>No resources available yet.</Text>
        ) : (
          <FlatList
            data={resources}
            renderItem={renderResource}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        )}
      </View>

      {/* Add Resource */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Add New Resource</Text>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Resource Title"
          value={newResource.title}
          onChangeText={(text) => setNewResource({ ...newResource, title: text })}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Brief description of the resource"
          value={newResource.description}
          onChangeText={(text) => setNewResource({ ...newResource, description: text })}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="https://example.com/resource"
          value={newResource.url}
          onChangeText={(text) => setNewResource({ ...newResource, url: text })}
          keyboardType="url"
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleResourceSubmit}>
          <Text style={styles.submitButtonText}>Add Resource</Text>
        </TouchableOpacity>
      </View>
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  list: {
    flexGrow: 0,
  },
  resourceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  resourceDescription: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  resourceLink: {
    alignSelf: 'flex-start',
  },
  resourceLinkText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProviderEducationScreen;