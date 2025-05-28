import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ManagePatients: undefined;
  ProviderMessages: undefined;
  ProviderMealPlan: undefined;
  ProviderEducation: undefined;
};

type ProviderScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProviderScreen: React.FC = () => {
  const { colors } = useColors();
  const navigation = useNavigation<ProviderScreenNavigationProp>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Provider Dashboard</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Manage Patients"
          onPress={() => navigation.navigate('ManagePatients')}
          color={colors.primary}
        />
        <Button
          title="Messages"
          onPress={() => navigation.navigate('ProviderMessages')}
          color={colors.primary}
        />
        <Button
          title="Meal Plans"
          onPress={() => navigation.navigate('ProviderMealPlan')}
          color={colors.primary}
        />
        <Button
          title="Educational Resources"
          onPress={() => navigation.navigate('ProviderEducation')}
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

export default ProviderScreen;