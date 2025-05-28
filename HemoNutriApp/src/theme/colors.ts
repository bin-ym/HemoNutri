import { useTheme } from "./ThemeContext";

export const colors = {
  primary: "#0D9488",
  secondary: "#2DD4BF",
  accent: "#5B9BD5",
  background: "#F3F4F6",
  surface: "#F3F4F6",
  error: "#FF0000",
  danger: "#FF6B6B",
  textPrimary: "#111827",
  text: "#1A3C5A",
  textSecondary: "#2DD4BF",
  textDescription: "#4B5563",
};

const lightColors = {
  ...colors,
  background: "#f5f5f5",
  textPrimary: "#333",
  textSecondary: "#666",
  primary: "#007AFF",
  secondary: "#E5E5EA",
  danger: "#FF3B30",
  warningBackground: "#fef2f2",
  errorBackground: "#ffe6e6",
  neutral: "#D1D5DB",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.5)",
};

const darkColors = {
  ...colors,
  background: "#1C2526",
  textPrimary: "#E0E0E0",
  textSecondary: "#A0A0A0",
  primary: "#40C4FF",
  secondary: "#37474F",
  danger: "#FF6E40",
  warningBackground: "#3B2A2A",
  errorBackground: "#3B1A1A",
  neutral: "#4B5563",
  white: "#E0E0E0",
  overlay: "rgba(0, 0, 0, 0.7)",
};

export type Colors = typeof colors & typeof lightColors & typeof darkColors;

export const useColors = (): typeof lightColors | typeof darkColors => {
  const { theme } = useTheme();
  return theme === "light" ? lightColors : darkColors;
};
