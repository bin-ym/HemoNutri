import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  AdminUsers: undefined;
  AdminResources: undefined;
  AdminBackup: undefined;
  AdminReports: undefined;
};

type AdminScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Props = {
  navigation: AdminScreenNavigationProp;
};

const AdminScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Admin Dashboard</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Manage Users"
          onPress={() => navigation.navigate('AdminUsers')}
          color={colors.primary}
        />
        <Button
          title="Manage Resources"
          onPress={() => navigation.navigate('AdminResources')}
          color={colors.primary}
        />
        <Button
          title="Backup Management"
          onPress={() => navigation.navigate('AdminBackup')}
          color={colors.primary}
        />
        <Button
          title="View Reports"
          onPress={() => navigation.navigate('AdminReports')}
          color={colors.primary}
        />
      </View>
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
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
});

export default AdminScreen;