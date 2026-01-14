
// CRITICAL: gesture-handler must be imported first, before react-native-reanimated
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, Platform } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StorageProvider } from "@/contexts/StorageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SnowAnimation } from "@/components/SnowAnimation";
import { setupErrorLogging } from "@/utils/errorLogger";

// Setup error logging for production builds
setupErrorLogging();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)",
      background: "rgb(0, 0, 0)", // Black background
      card: "rgb(35, 35, 35)", // Dark gray
      text: "rgb(255, 255, 255)", // White text
      border: "rgb(35, 35, 35)",
      notification: "rgb(191, 254, 132)", // Neon green
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(191, 254, 132)", // Neon green
      background: "rgb(0, 0, 0)", // Black
      card: "rgb(35, 35, 35)", // Dark gray
      text: "rgb(255, 255, 255)", // White
      border: "rgb(35, 35, 35)",
      notification: "rgb(191, 254, 132)", // Neon green
    },
  };

  return (
    <ErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <LanguageProvider>
          <AuthProvider>
            <StorageProvider>
              <WidgetProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <SnowAnimation />
                  <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="register" options={{ headerShown: false }} />
                  <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="modal"
                    options={{
                      presentation: "modal",
                      title: "Standard Modal",
                    }}
                  />
                  <Stack.Screen
                    name="formsheet"
                    options={{
                      presentation: "formSheet",
                      title: "Form Sheet Modal",
                      sheetGrabberVisible: true,
                      sheetAllowedDetents: [0.5, 0.8, 1.0],
                      sheetCornerRadius: 20,
                    }}
                  />
                  <Stack.Screen
                    name="transparent-modal"
                    options={{
                      presentation: "transparentModal",
                      headerShown: false,
                    }}
                  />
                </Stack>
                  <SystemBars style={"light"} />
                </GestureHandlerRootView>
              </WidgetProvider>
            </StorageProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
