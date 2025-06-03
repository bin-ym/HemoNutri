import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { useColors } from '../theme/ThemeContext';
import { CommonActions } from '@react-navigation/native';
import { storeAuthData } from '../utils/auth';

type RootStackParamList = {
  SelectProvider: { providers: any[]; userId: string };
  Tabs: { role: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectProvider'>;

const SelectProviderScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const colors = useColors();
  const { providers, userId } = route.params;

  const handleSelectProvider = async (providerId: string) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/select-provider', { userId, providerId });
      const { token, role } = response.data;
      await storeAuthData(token, role, userId);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', params: { role } }],
        })
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to select provider.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderProvider = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.providerItem, { backgroundColor: colors.surface }]}
      onPress={() => handleSelectProvider(item._id)}
      disabled={loading}
    >
      <Text style={[styles.providerName, { color: colors.textPrimary }]}>
        {item.firstName} {item.lastName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Select Provider</Text>
      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loadingIndicator}
          accessibilityLabel="Loading indicator"
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  providerItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  providerName: {
    fontSize: 18,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default SelectProviderScreen;