import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { useColors } from '../../theme/colors';
import { getAuthData } from '../../utils/auth';
import api from '../../api/api';
import { AxiosError } from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

const UsersScreen: React.FC = () => {
  const colors = useColors();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ username: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await getAuthData();
      if (!token) {
        setError('Authentication required.');
        return;
      }
      const res = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Fetch users error:', axiosError.message);
      setError('Failed to load users: ' + axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { token } = await getAuthData();
            await api.delete(`/admin/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter(user => user._id !== id));
            Alert.alert('Success', 'User deleted successfully.');
          } catch (err) {
            const axiosError = err as AxiosError;
            console.error('Delete user error:', axiosError.message);
            Alert.alert('Error', 'Failed to delete user: ' + axiosError.message);
          }
        },
      },
    ]);
  };

  const addUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      const { token } = await getAuthData();
      const res = await api.post(
        '/admin/add-user',
        { username: newUser.username, email: newUser.email, role: newUser.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers([...users, res.data.user]);
      setNewUser({ username: '', email: '', role: '' });
      Alert.alert('Success', 'User added successfully. They will receive an OTP via email.');
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Add user error:', axiosError.message);
      Alert.alert('Error', 'Failed to add user: ' + axiosError.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading users...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Manage Users</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Add User Form */}
      <View style={styles.formContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Add New User</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Username"
          placeholderTextColor={colors.textSecondary}
          value={newUser.username}
          onChangeText={text => setNewUser({ ...newUser, username: text })}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={newUser.email}
          onChangeText={text => setNewUser({ ...newUser, email: text })}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { borderColor: colors.secondary, color: colors.textPrimary }]}
          placeholder="Role (admin/patient/provider)"
          placeholderTextColor={colors.textSecondary}
          value={newUser.role}
          onChangeText={text => setNewUser({ ...newUser, role: text })}
        />
        <Button
          title="Add User"
          onPress={addUser}
          buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonTitle}
        />
      </View>

      {/* Users List */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Users List</Text>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                {item.username} ({item.role})
              </Text>
              <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
            <Button
              icon={<Icon name="trash" type="ionicon" color={colors.danger} />}
              onPress={() => deleteUser(item._id)}
              type="clear"
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found.</Text>
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

export default UsersScreen;