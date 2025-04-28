import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearAuthData } from '../../utils/auth';
import { colors } from '../../theme/colors';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    await clearAuthData();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button title="Logout" onPress={handleLogout} color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
});

export default SettingsScreen;