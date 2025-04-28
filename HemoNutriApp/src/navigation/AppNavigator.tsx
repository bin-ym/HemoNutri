import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/Shared/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/Admin/AdminScreen';
import PatientScreen from '../screens/Patient/PatientScreen';
import ProviderScreen from '../screens/Provider/ProviderScreen';
import SettingsScreen from '../screens/Shared/SettingsScreen';
import FoodLogsScreen from '../screens/Patient/FoodLogsScreen';
import MealPlansScreen from '../screens/Patient/MealPlansScreen';
import ManagePatientsScreen from '../screens/Provider/ManagePatientsScreen';
import ManageMealPlansScreen from '../screens/Provider/ManageMealPlansScreen';
import ProviderPatientDetailScreen from '../screens/Provider/ProviderPatientDetailScreen';
import ProviderEducationScreen from '../screens/Provider/ProviderEducationScreen';
import { getAuthData } from '../utils/auth';
import { colors } from '../theme/colors';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
};

type TabParamList = {
  HomeTab: undefined;
  Admin: undefined;
  Patient: undefined;
  Provider: undefined;
  Users: undefined;
  Settings: undefined;
  FoodLogs: undefined;
  MealPlans: undefined;
  Patients: undefined;
  ProviderMealPlans: undefined;
  ProviderEducationTab: undefined; // Added new tab
};

type IconName =
  | 'home'
  | 'shield'
  | 'person'
  | 'medkit'
  | 'settings'
  | 'people'
  | 'fast-food'
  | 'list'
  | 'book'; // Added for educational resources

type ScreenOptionsProps = {
  route: RouteProp<TabParamList, keyof TabParamList>;
  navigation: any;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const RoleBasedTabNavigator: React.FC<{ role: string }> = ({ role }) => {
  let ScreenComponent: React.FC<any>;
  let tabName: keyof TabParamList;
  let tabTitle: string;

  console.log('RoleBasedTabNavigator: role =', role);

  if (role === 'admin') {
    ScreenComponent = AdminScreen;
    tabName = 'Admin';
    tabTitle = 'Admin Dashboard';
  } else if (role === 'patient') {
    ScreenComponent = PatientScreen;
    tabName = 'Patient';
    tabTitle = 'Patient Dashboard';
  } else if (role === 'provider') {
    ScreenComponent = ProviderScreen;
    tabName = 'Provider';
    tabTitle = 'Provider Dashboard';
  } else {
    console.error('Invalid role:', role);
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ title: 'Home', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
        />
      </Tab.Navigator>
    );
  }

  const screenOptions = ({ route }: ScreenOptionsProps): BottomTabNavigationOptions => {
    return {
      tabBarIcon: ({ color, size }) => {
        let iconName: IconName;
        if (route.name === tabName) {
          iconName = role === 'admin' ? 'shield' : role === 'patient' ? 'person' : role === 'provider' ? 'medkit' : 'home';
        } else if (route.name === 'Settings') {
          iconName = 'settings';
        } else if (route.name === 'Users') {
          iconName = 'people';
        } else if (route.name === 'FoodLogs') {
          iconName = 'fast-food';
        } else if (route.name === 'MealPlans') {
          iconName = 'fast-food';
        } else if (route.name === 'Patients') {
          iconName = 'list';
        } else if (route.name === 'ProviderMealPlans') {
          iconName = 'list';
        } else if (route.name === 'ProviderEducationTab') {
          iconName = 'book'; // Icon for educational resources
        } else {
          iconName = 'home';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopColor: colors.secondary,
      },
    };
  };

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
      initialRouteName={role === 'provider' ? 'Provider' : 'HomeTab'}
    >
      {role !== 'provider' && (
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ title: 'Home', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
        />
      )}
      <Tab.Screen
        name={tabName}
        component={ScreenComponent}
        options={{
          title: tabTitle,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      />
      {role === 'admin' && (
        <Tab.Screen
          name="Users"
          component={AdminScreen}
          options={{
            title: 'Users',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#fff',
          }}
        />
      )}
      {role === 'patient' && (
        <>
          <Tab.Screen
            name="FoodLogs"
            component={FoodLogsScreen}
            options={{
              title: 'Food Logs',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
            }}
          />
          <Tab.Screen
            name="MealPlans"
            component={MealPlansScreen}
            options={{
              title: 'Meal Plans',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
      {role === 'provider' && (
        <>
          <Tab.Screen
            name="Patients"
            component={ManagePatientsScreen}
            options={{
              title: 'Patients',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
            }}
          />
          <Tab.Screen
            name="ProviderMealPlans"
            component={ManageMealPlansScreen}
            options={{
              title: 'Meal Plans',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
            }}
          />
          <Tab.Screen
            name="ProviderEducationTab"
            component={ProviderEducationScreen}
            options={{
              title: 'Education',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token, role, userId } = await getAuthData();
        console.log('getAuthData result:', { token, role, userId });
        if (token && role) {
          setUserRole(role);
          setInitialRoute('Tabs');
        } else {
          setInitialRoute('Home');
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setInitialRoute('Home');
      }
    };
    checkAuth();
  }, []);

  console.log('AppNavigator: initialRoute =', initialRoute, 'userRole =', userRole);

  if (!initialRoute || (initialRoute === 'Tabs' && !userRole)) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tabs"
          options={{ headerShown: false }}
        >
          {({ route }) => {
            const role = route.params?.role || userRole || 'patient';
            return <RoleBasedTabNavigator role={role} />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name="ProviderPatientDetail"
          component={ProviderPatientDetailScreen}
          options={{
            title: 'Patient Details',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="ProviderEducation"
          component={ProviderEducationScreen}
          options={{
            title: 'Educational Resources',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;