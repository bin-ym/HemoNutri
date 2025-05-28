import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import api from '../../api/api';

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
};

const UsersScreen: React.FC = () => {
  const { colors } = useColors();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    medicalHistory: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load users');
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    try {
      const response = await api.post('/api/admin/users', newUser);
      setUsers((prev) => [response.data, ...prev]);
      setNewUser({ firstName: '', lastName: '', email: '', role: '', medicalHistory: '' });
      Alert.alert('Success', 'User added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      Alert.alert('Success', 'User deleted successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to delete user');
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.userItem, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{item.username}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{item.email}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{item.role}</Text>
      <Button title="Delete" onPress={() => deleteUser(item._id)} color={colors.error} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Manage Users</Text>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="First Name"
          placeholderTextColor={colors.textSecondary}
          value={newUser.firstName}
          onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Last Name"
          placeholderTextColor={colors.textSecondary}
          value={newUser.lastName}
          onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={newUser.email}
          onChangeText={(text) => setNewUser({ ...newUser, email: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary ]}>
          <Text style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]} />
          placeholder="Role (patient/provider/admin)"
          placeholderTextColor={colors.textSecondary}
          value={newUser.role}
          onChangeText={(text) => setNewUser({ ...newUser, role: text })}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]} />
          <Text style={[styles.input, { backgroundColor: colors.secondary, color: colors.textPrimary }]} />
          placeholder="Medical History (optional)"
          placeholderTextColor={colors.textSecondary}
          value={newUser.medicalHistory}
          onChangeText={(text) => setNewUser({ ...newUser, medicalHistory: text })}
        />
        <Button title="Add User" onPress={addUser} color={colors.primary} />
      </View>
      {loading ? (
        <Text style={[styles.text, { color: colors.textPrimary }]}>Loading...</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
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
  userItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default UsersScreen;