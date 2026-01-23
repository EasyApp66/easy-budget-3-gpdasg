
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
import { setupErrorLogging } from "@/utils/errorLogger";
import Constants from "expo-constants";
import { SuperwallProvider } from "expo-superwall";

// Setup error logging for production builds
setupErrorLogging();

// Log backend configuration at app startup
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl;
console.log('========================================');
console.log('[App] 🚀 Easy Budget 2.0 Starting...');
console.log('[App] 📱 Platform:', Platform.OS);
console.log('[App] 🌐 Backend URL:', BACKEND_URL || 'NOT CONFIGURED');
if (BACKEND_URL) {
  console.log('[App] ✅ Backend is configured and ready');
} else {
  console.log('[App] ⚠️  Backend not configured - app will run in offline mode');
}
console.log('========================================');

// Hide splash screen immediately - no loading animation
SplashScreen.hideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

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
      <SuperwallProvider
        apiKeys={{
          ios: "pk_d1efb1f8a9d3f6e7c5b4a3d2e1f0c9b8a7d6e5f4c3b2a1d0e9f8c7b6a5d4e3f2",
        }}
        onConfigurationError={(error) => {
          console.error('[Superwall] Configuration error:', error);
        }}
      >
        <StatusBar style="light" animated />
        <ThemeProvider
          value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
        >
          <LanguageProvider>
            <AuthProvider>
              <StorageProvider>
                <WidgetProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        animation: 'none',
                        animationDuration: 0,
                      }}
                    >
                      <Stack.Screen 
                        name="index" 
                        options={{ 
                          headerShown: false,
                          animation: 'none',
                          animationDuration: 0,
                        }} 
                      />
                      <Stack.Screen 
                        name="welcome" 
                        options={{ 
                          headerShown: false,
                          animation: 'none',
                          animationDuration: 0,
                        }} 
                      />
                      <Stack.Screen 
                        name="login" 
                        options={{ 
                          headerShown: false,
                          animation: 'slide_from_right',
                          animationDuration: 150,
                        }} 
                      />
                      <Stack.Screen 
                        name="register" 
                        options={{ 
                          headerShown: false,
                          animation: 'slide_from_right',
                          animationDuration: 150,
                        }} 
                      />
                      <Stack.Screen 
                        name="forgot-password" 
                        options={{ 
                          headerShown: false,
                          animation: 'slide_from_right',
                          animationDuration: 150,
                        }} 
                      />
                      <Stack.Screen 
                        name="(tabs)" 
                        options={{ 
                          headerShown: false,
                          animation: 'fade',
                          animationDuration: 150,
                        }} 
                      />
                      <Stack.Screen
                        name="modal"
                        options={{
                          presentation: "modal",
                          title: "Standard Modal",
                          animation: 'slide_from_bottom',
                          animationDuration: 150,
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
                          animation: 'slide_from_bottom',
                          animationDuration: 150,
                        }}
                      />
                      <Stack.Screen
                        name="transparent-modal"
                        options={{
                          presentation: "transparentModal",
                          headerShown: false,
                          animation: 'fade',
                          animationDuration: 150,
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
      </SuperwallProvider>
    </ErrorBoundary>
  );
}
