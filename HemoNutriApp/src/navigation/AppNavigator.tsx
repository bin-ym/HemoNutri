import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext"; // Updated import
import { useColors } from "../theme/ThemeContext"; // Updated import
import HomeScreen from "../screens/Shared/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import AdminScreen from "../screens/Admin/AdminScreen";
import PatientScreen from "../screens/Patient/PatientScreen";
import ProviderScreen from "../screens/Provider/ProviderScreen";
import SettingsScreen from "../screens/Shared/SettingsScreen";
import FoodLogsScreen from "../screens/Patient/FoodLogsScreen";
import MealPlansScreen from "../screens/Patient/MealPlansScreen";
import MessagesScreen from "../screens/Patient/MessagesScreen";
import ManagePatientsScreen from "../screens/Provider/ManagePatientsScreen";
import ProviderPatientDetailScreen from "../screens/Provider/ProviderPatientDetailScreen";
import ProviderEducationScreen from "../screens/Provider/ProviderEducationScreen";
import ProviderMessagesScreen from "../screens/Provider/MessagesScreen";
import ConversationScreen from "../screens/Shared/ConversationScreen";
import UsersScreen from "../screens/Admin/UsersScreen";
import ResourcesScreen from "../screens/Admin/ResourcesScreen";
import ReportsScreen from "../screens/Admin/ReportsScreen";
import BackupScreen from "../screens/Admin/BackupScreen";
import { getAuthData } from "../utils/auth";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

// Define navigation param lists
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ProviderPatientDetail: { patientId: string };
  ProviderEducation: undefined;
  Messages: undefined;
  Conversation: { userId: string; username: string; role: string };
  Users: undefined;
  Resources: undefined;
  Reports: undefined;
  Backup: undefined;
};

type TabParamList = {
  HomeTab: undefined;
  Admin: undefined;
  Patient: undefined;
  Provider: undefined;
  Users: undefined;
  Resources: undefined;
  Reports: undefined;
  Backup: undefined;
  Settings: undefined;
  FoodLogs: undefined;
  MealPlans: undefined;
  Messages: undefined;
  Patients: undefined;
  ProviderEducationTab: undefined;
};

type IconName =
  | "home"
  | "shield"
  | "person"
  | "medkit"
  | "settings"
  | "people"
  | "document"
  | "book"
  | "cloud-upload"
  | "fast-food"
  | "list"
  | "chatbox"
  | "chatbox-outline";

type ScreenOptionsProps = {
  route: RouteProp<TabParamList, keyof TabParamList>;
  navigation: any;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const NavigationContent: React.FC = () => {
  const { isThemeLoaded } = useTheme();
  const colors = useColors();

  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.secondary,
    },
  };

  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.secondary,
    },
  };

  const RoleBasedTabNavigator: React.FC<{ role: string }> = ({ role }) => {
    console.log("RoleBasedTabNavigator: role =", role);

    const screenOptions = ({
      route,
    }: ScreenOptionsProps): BottomTabNavigationOptions => {
      return {
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;
          if (route.name === "Admin") iconName = focused ? "shield" : "shield";
          else if (route.name === "Users") iconName = focused ? "people" : "people";
          else if (route.name === "Resources") iconName = focused ? "book" : "book";
          else if (route.name === "Reports") iconName = focused ? "document" : "document";
          else if (route.name === "Backup") iconName = focused ? "cloud-upload" : "cloud-upload";
          else if (route.name === "Settings") iconName = focused ? "settings" : "settings";
          else if (route.name === "HomeTab") iconName = focused ? "home" : "home";
          else if (route.name === "FoodLogs") iconName = focused ? "fast-food" : "fast-food";
          else if (route.name === "MealPlans") iconName = focused ? "list" : "list";
          else if (route.name === "Messages") iconName = focused ? "chatbox" : "chatbox-outline";
          else if (route.name === "Patients") iconName = focused ? "list" : "list";
          else if (route.name === "ProviderEducationTab") iconName = focused ? "book" : "book";
          else iconName = "home";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      };
    };

    if (!["admin", "patient", "provider"].includes(role)) {
      console.error("Invalid role:", role);
      return (
        <Tab.Navigator screenOptions={screenOptions}>
          <Tab.Screen
            name="HomeTab"
            component={HomeScreen}
            options={{
              title: "Home",
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: "#fff",
            }}
          />
        </Tab.Navigator>
      );
    }

    return (
      <Tab.Navigator screenOptions={screenOptions} initialRouteName={tabInitialRouteName(role)}>
        {role === "admin" && (
          <>
            <Tab.Screen
              name="Admin"
              component={AdminScreen}
              options={{
                title: "Admin Dashboard",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Users"
              component={UsersScreen}
              options={{
                title: "Manage Users",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Resources"
              component={ResourcesScreen}
              options={{
                title: "Manage Resources",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Reports"
              component={ReportsScreen}
              options={{
                title: "Generate Report",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Backup"
              component={BackupScreen}
              options={{
                title: "Backup",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: "Settings",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
          </>
        )}
        {role === "patient" && (
          <>
            <Tab.Screen
              name="Patient"
              component={PatientScreen}
              options={{
                title: "Patient Dashboard",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="FoodLogs"
              component={FoodLogsScreen}
              options={{
                title: "Food Logs",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="MealPlans"
              component={MealPlansScreen}
              options={{
                title: "Meal Plans",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Messages"
              component={MessagesScreen}
              options={{
                title: "Messages",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: "Settings",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
          </>
        )}
        {role === "provider" && (
          <>
            <Tab.Screen
              name="Provider"
              component={ProviderScreen}
              options={{
                title: "Provider Dashboard",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Patients"
              component={ManagePatientsScreen}
              options={{
                title: "Patients",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="ProviderEducationTab"
              component={ProviderEducationScreen}
              options={{
                title: "Education",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Messages"
              component={ProviderMessagesScreen}
              options={{
                title: "Messages",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: "Settings",
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
              }}
            />
          </>
        )}
      </Tab.Navigator>
    );
  };

  const tabInitialRouteName = (role: string): keyof TabParamList => {
    switch (role) {
      case "admin": return "Admin";
      case "patient": return "Patient";
      case "provider": return "Provider";
      default: return "HomeTab";
    }
  };

  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token, role, userId } = await getAuthData();
        console.log("getAuthData result:", { token, role, userId });
        if (token && role && ["admin", "patient", "provider"].includes(role)) {
          setUserRole(role);
          setInitialRoute("Tabs");
        } else {
          setInitialRoute("Home");
        }
      } catch (error) {
        console.error("Error in checkAuth:", error);
        setInitialRoute("Home");
      }
    };
    checkAuth();
  }, []);

  console.log("AppNavigator: initialRoute =", initialRoute, "userRole =", userRole);

  if (!isThemeLoaded || !initialRoute || (initialRoute === "Tabs" && !userRole)) {
    return null;
  }

  return (
    <NavigationContainer theme={colors.background === '#f5f5f5' ? MyLightTheme : MyDarkTheme}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tabs" options={{ headerShown: false }}>
          {({ route }) => {
            const role = route.params?.role || userRole || "patient";
            console.log("Tabs screen: role passed =", role);
            return <RoleBasedTabNavigator role={role} />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name="ProviderPatientDetail"
          component={ProviderPatientDetailScreen}
          options={{
            title: "Patient Details",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="ProviderEducation"
          component={ProviderEducationScreen}
          options={{
            title: "Educational Resources",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Messages"
          component={ProviderMessagesScreen}
          options={{
            title: "Messages",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={({ route }) => ({
            title: `Chat with ${route.params.username} (${route.params.role})`,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          })}
        />
        <Stack.Screen
          name="Users"
          component={UsersScreen}
          options={{
            title: "Manage Users",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Resources"
          component={ResourcesScreen}
          options={{
            title: "Manage Resources",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            title: "Generate Reports",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Backup"
          component={BackupScreen}
          options={{
            title: "Create Backup",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AppNavigator: React.FC = () => {
  return <NavigationContent />;
};

export default AppNavigator;