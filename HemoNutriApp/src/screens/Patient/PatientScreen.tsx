import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearAuthData } from '../../utils/auth';
import { colors } from '../../theme/colors';

// Define the navigation stack param list
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: undefined;
  FoodLogs?: undefined;
  MealPlans?: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const PatientScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    await clearAuthData();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewFoodLogs = () => {
    navigation.navigate('FoodLogs');
  };

  const handleViewMealPlans = () => {
    navigation.navigate('MealPlans');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Dashboard</Text>
      <Text style={styles.subtitle}>Track your food logs and meal plans.</Text>
      <Button
        title="View Food Logs"
        onPress={handleViewFoodLogs}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitle}
      />
      <Button
        title="View Meal Plans"
        onPress={handleViewMealPlans}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitle}
      />
      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={[styles.button, styles.logoutButton]}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonTitle}
      />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PatientScreen;