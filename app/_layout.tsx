
import { useNetworkState } from "expo-network";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Stack, router } from "expo-router";
import { useColorScheme, Alert, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BACKEND_URL } from "@/utils/api";
import { SnowAnimation } from "@/components/SnowAnimation";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme for EASY BUDGET 3.0
const EasyBudgetTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#BFFE84',
    background: '#000000',
    card: '#232323',
    text: '#FFFFFF',
    border: '#232323',
    notification: '#BFFE84',
  },
};

export default function RootLayout() {
  const { isConnected } = useNetworkState();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Log backend URL for debugging
      console.log("[App] Backend URL configured:", BACKEND_URL);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={EasyBudgetTheme}>
        <AuthProvider>
          <WidgetProvider>
            <View style={styles.container}>
              {/* Snow Animation in Background */}
              <SnowAnimation />
              
              {/* Main Content */}
              <View style={styles.content}>
                <SystemBars style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'none', // No page transitions as per requirements
                  }}
                >
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="register" options={{ headerShown: false }} />
                  <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                  <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
                  <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="light" />
              </View>
            </View>
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
