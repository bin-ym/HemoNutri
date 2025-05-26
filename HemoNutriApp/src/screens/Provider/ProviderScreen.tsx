import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import api, { AxiosResponse } from "../../api/api"; // Ensure api is typed
import { useTranslation } from "react-i18next";
import { useColors } from "../../theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

// Define valid Ionicons names (partial list, extend as needed)
type IconName =
  | "people-outline"
  | "fast-food-outline"
  | "chatbox-outline"
  | "flash-outline"
  | "time-outline"
  | "alert-circle-outline";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Tabs: { role: string };
  ManagePatients: undefined;
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList> &
  BottomTabNavigationProp<TabParamList, "Provider">;

type FoodLog = {
  _id: string;
  userId?: string | { username: string };
  foodItem: string;
  quantity: string;
  isFluid: boolean;
  date: string;
};

type Message = {
  _id: string;
  patientUsername: string;
  content: string;
  createdAt: string;
  isEmergency: boolean;
};

type Resource = {
  _id: string;
  title: string;
  content: string;
  date: string;
};

const ProviderScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const [patients, setPatients] = useState<[] | any[]>([]); // Initial state as empty array
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      if (!token || role !== "provider") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
        return;
      }
      const promises = [
        api.get("/provider/patients").catch((err) => {
          console.error(
            "Error fetching patients:",
            err.response?.status,
            err.response?.data
          );
          throw err;
        }),
        api.get("/provider/logs").catch((err) => {
          console.error(
            "Error fetching logs:",
            err.response?.status,
            err.response?.data
          );
          throw err;
        }),
        api.get("/provider/messages").catch((err) => {
          console.error(
            "Error fetching messages:",
            err.response?.status,
            err.response?.data
          );
          throw err;
        }),
        api.get("/provider/education").catch((err) => {
          console.error(
            "Error fetching education:",
            err.response?.status,
            err.response?.data
          );
          throw err;
        }),
      ];
      const [patientsRes, logsRes, messagesRes, resourcesRes] =
        await Promise.all(promises);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 5) : []);
      setMessages(
        Array.isArray(messagesRes.data) ? messagesRes.data.slice(0, 5) : []
      );
      setResources(
        Array.isArray(resourcesRes.data) ? resourcesRes.data.slice(0, 3) : []
      );
    } catch (err: any) {
      console.error("Fetch data error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || t("dashboard_error_load");
      setError(errorMsg);
      if (
        errorMsg.includes("Token expired") ||
        errorMsg.includes("Token verification error")
      ) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("role");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: "Login", params: { message: t("session_expired") } },
            ],
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigation, t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? t("date_unavailable")
      : date.toLocaleDateString();
  };

  const renderOverviewCard = ({
    title,
    count,
    icon,
    onPress,
  }: {
    title: string;
    count: number;
    icon: IconName;
    onPress: () => void;
  }) => (
    <View
      style={[
        styles.overviewCard,
        {
          backgroundColor: colors.background,
          borderColor: colors.secondary,
          shadowColor: "#000",
        },
      ]}
    >
      <View style={styles.statHeader}>
        <Text style={[styles.statTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
        {count}
      </Text>
      <Button
        title={t(`view_${title.toLowerCase().replace(" ", "_")}`)}
        onPress={onPress}
        type="clear"
        titleStyle={[styles.statButton, { color: colors.primary }]}
        accessibilityLabel={`View ${title.toLowerCase()} button`}
      />
    </View>
  );

  const renderRecentItem = ({
    item,
    type,
  }: {
    item: FoodLog | Message;
    type: "log" | "message";
  }) => {
    const isLog = type === "log";
    const username = isLog
      ? typeof (item as FoodLog).userId === "object" && (item as FoodLog).userId
        ? (item as FoodLog).userId.username
        : "Unknown User"
      : (item as Message).patientUsername || "Unknown User";
    const content = isLog
      ? `${(item as FoodLog).foodItem} - ${(item as FoodLog).quantity}${
          (item as FoodLog).isFluid ? "ml" : "g"
        }`
      : (item as Message).content;
    const dateField = isLog ? "date" : "createdAt";
    const backgroundColor = isLog
      ? (item as FoodLog).isFluid
        ? "#e0f7fa"
        : "#e6f3ff"
      : (item as Message).isEmergency
      ? "#ffebee"
      : "#e6f3ff";

    return (
      <View
        style={[
          styles.recentItem,
          { backgroundColor, borderColor: colors.secondary },
        ]}
      >
        <Text style={[styles.recentText, { color: colors.textPrimary }]}>
          {username}: {content}
        </Text>
        <Text style={[styles.recentDate, { color: colors.textSecondary }]}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textSecondary}
          />{" "}
          {formatDate((item as any)[dateField])}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t("dashboard_loading")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
        <Button
          title={t("retry")}
          onPress={fetchData}
          buttonStyle={[
            styles.retryButton,
            { backgroundColor: colors.primary },
          ]}
          containerStyle={styles.retryButtonContainer}
          titleStyle={styles.retryButtonTitle}
          accessibilityLabel="Retry dashboard load"
        />
      </View>
    );
  }

  return (
    <FlatList
      data={[
        { id: "header", type: "header" },
        { id: "overview", type: "overview" },
        { id: "logs", type: "logs" },
        { id: "messages", type: "messages" },
        { id: "quickActions", type: "quickActions" },
      ]}
      renderItem={({ item }) => {
        switch (item.type) {
          case "header":
            return (
              <View style={[styles.header, { shadowColor: "#000" }]}>
                <Text style={[styles.title, { color: colors.primary }]}>
                  {t("dashboard_title")}
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  {t("dashboard_subtitle")}
                </Text>
                <Ionicons
                  name="people-outline"
                  size={32}
                  color={colors.primary}
                />
              </View>
            );
          case "overview":
            return (
              <View style={styles.overviewContainer}>
                {renderOverviewCard({
                  title: t("patients"),
                  count: patients.length,
                  icon: "people-outline",
                  onPress: () => navigation.navigate({ name: "Patients" }),
                })}
                {renderOverviewCard({
                  title: t("recent_logs"),
                  count: logs.length,
                  icon: "fast-food-outline",
                  onPress: () => navigation.navigate({ name: "FoodLogs" }),
                })}
                {renderOverviewCard({
                  title: t("messages"),
                  count: messages.length,
                  icon: "chatbox-outline",
                  onPress: () =>
                    navigation.navigate({ name: "ProviderMessages" }),
                })}
              </View>
            );
          case "logs":
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.primary }]}
                  >
                    {t("recent_food_logs")}
                  </Text>
                  <Ionicons
                    name="fast-food-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                {logs.length === 0 ? (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    {t("no_logs")}
                  </Text>
                ) : (
                  <FlatList
                    data={logs}
                    renderItem={(log) =>
                      renderRecentItem({ item: log.item, type: "log" })
                    }
                    keyExtractor={(item) => item._id}
                    style={styles.list}
                    nestedScrollEnabled
                  />
                )}
              </View>
            );
          case "messages":
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.primary }]}
                  >
                    {t("recent_messages")}
                  </Text>
                  <Ionicons
                    name="chatbox-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                {messages.length === 0 ? (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    {t("no_messages")}
                  </Text>
                ) : (
                  <FlatList
                    data={messages}
                    renderItem={(msg) =>
                      renderRecentItem({ item: msg.item, type: "message" })
                    }
                    keyExtractor={(item) => item._id}
                    style={styles.list}
                    nestedScrollEnabled
                  />
                )}
              </View>
            );
          case "quickActions":
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.primary }]}
                  >
                    {t("quick_actions")}
                  </Text>
                  <Ionicons
                    name="flash-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.quickActions}>
                  <Button
                    title={t("manage_patients")}
                    onPress={() => navigation.navigate({ name: "Patients" })}
                    buttonStyle={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                    containerStyle={styles.actionButtonContainer}
                    titleStyle={styles.actionButtonTitle}
                    accessibilityLabel="Manage patients button"
                  />
                  <Button
                    title={t("add_resource")}
                    onPress={() =>
                      navigation.navigate({ name: "ProviderEducation" })
                    }
                    buttonStyle={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                    containerStyle={styles.actionButtonContainer}
                    titleStyle={styles.actionButtonTitle}
                    accessibilityLabel="Add resource button"
                  />
                  <Button
                    title={t("send_message")}
                    onPress={() =>
                      navigation.navigate({ name: "ProviderMessages" })
                    }
                    buttonStyle={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                    containerStyle={styles.actionButtonContainer}
                    titleStyle={styles.actionButtonTitle}
                    accessibilityLabel="Send message button"
                  />
                </View>
              </View>
            );
          default:
            return null;
        }
      }}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      ListFooterComponent={<View style={{ height: 20 }} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButtonContainer: {
    width: "60%",
    marginTop: 20,
  },
  retryButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  retryButtonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  overviewContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    flexWrap: "wrap",
  },
  overviewCard: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "45%",
    borderWidth: 1,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statButton: {
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    flexGrow: 0,
  },
  recentItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  recentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  recentDate: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  actionButtonContainer: {
    width: "45%",
    marginBottom: 10,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  actionButtonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProviderScreen;
