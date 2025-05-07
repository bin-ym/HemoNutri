import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
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
    <View style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Ionicons name="book-outline" size={20} color={colors.primary} />
      </View>
      <Text style={styles.resourceDescription}>{item.description}</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(item.url)}
        style={styles.resourceLinkButton}
      >
        <Ionicons name="link-outline" size={16} color={colors.primary} style={styles.linkIcon} />
        <Text style={styles.resourceLinkText}>View Resource</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Educational Resources</Text>
        <Text style={styles.subtitle}>Share valuable knowledge with your patients</Text>
      </View>

      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Add New Resource</Text>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="pencil-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Resource Title"
            placeholderTextColor={colors.textSecondary}
            value={newResource.title}
            onChangeText={(text) => setNewResource({ ...newResource, title: text })}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Brief description of the resource"
            placeholderTextColor={colors.textSecondary}
            value={newResource.description}
            onChangeText={(text) => setNewResource({ ...newResource, description: text })}
            multiline
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="link-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="https://example.com/resource"
            placeholderTextColor={colors.textSecondary}
            value={newResource.url}
            onChangeText={(text) => setNewResource({ ...newResource, url: text })}
            keyboardType="url"
          />
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleResourceSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Add Resource</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Resources</Text>
        <Ionicons name="library-outline" size={24} color={colors.primary} />
      </View>
      {resources.length === 0 && (
        <Text style={styles.emptyText}>No resources available yet. Add one above!</Text>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={resources}
      renderItem={renderResource}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={<View style={{ height: 20 }} />}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    marginLeft: 10,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: 'transparent',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resourceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  resourceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  resourceLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10', // Lightened primary color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  linkIcon: {
    marginRight: 8,
  },
  resourceLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

export default ProviderEducationScreen;