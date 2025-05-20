import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
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
  const colors = useColors();

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
    <View style={[styles.resourceCard, { backgroundColor: colors.background, shadowColor: '#000' }]}>
      <View style={styles.resourceHeader}>
        <Text style={[styles.resourceTitle, { color: colors.primary }]}>{item.title}</Text>
        <Ionicons name="book-outline" size={20} color={colors.primary} />
      </View>
      <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(item.url)}
        style={[styles.resourceLinkButton, { backgroundColor: colors.primary + '10' }]}
        accessibilityLabel={`View resource: ${item.title}`}
      >
        <Ionicons name="link-outline" size={16} color={colors.primary} style={styles.linkIcon} />
        <Text style={[styles.resourceLinkText, { color: colors.primary }]}>View Resource</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background, shadowColor: '#000' }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Educational Resources</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Share valuable knowledge with your patients</Text>
      </View>

      {error && (
        <View style={[styles.errorMessage, { backgroundColor: colors.errorBackground }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      <View style={[styles.formCard, { backgroundColor: colors.background, shadowColor: '#000' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Add New Resource</Text>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </View>
        <View style={[styles.inputContainer, { borderColor: colors.secondary, backgroundColor: colors.secondary }]}>
          <Ionicons name="pencil-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Resource Title"
            placeholderTextColor={colors.textSecondary}
            value={newResource.title}
            onChangeText={(text) => setNewResource({ ...newResource, title: text })}
            accessibilityLabel="Resource title input"
          />
        </View>
        <View style={[styles.inputContainer, { borderColor: colors.secondary, backgroundColor: colors.secondary }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.descriptionInput, { color: colors.textPrimary }]}
            placeholder="Brief description of the resource"
            placeholderTextColor={colors.textSecondary}
            value={newResource.description}
            onChangeText={(text) => setNewResource({ ...newResource, description: text })}
            multiline
            accessibilityLabel="Resource description input"
          />
        </View>
        <View style={[styles.inputContainer, { borderColor: colors.secondary, backgroundColor: colors.secondary }]}>
          <Ionicons name="link-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="https://example.com/resource"
            placeholderTextColor={colors.textSecondary}
            value={newResource.url}
            onChangeText={(text) => setNewResource({ ...newResource, url: text })}
            keyboardType="url"
            accessibilityLabel="Resource URL input"
          />
        </View>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary, shadowColor: '#000' }]}
          onPress={handleResourceSubmit}
          activeOpacity={0.8}
          accessibilityLabel="Add resource button"
        >
          <Text style={styles.submitButtonText}>Add Resource</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Your Resources</Text>
        <Ionicons name="library-outline" size={24} color={colors.primary} />
      </View>
      {resources.length === 0 && (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No resources available yet. Add one above!</Text>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
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
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  formCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
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
    backgroundColor: 'transparent',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
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
  },
  resourceDescription: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  resourceLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

export default ProviderEducationScreen;