
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { StorageProvider } from '@/contexts/StorageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <StorageProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'none',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </StorageProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
