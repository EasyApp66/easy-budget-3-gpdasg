
import { Stack } from 'expo-router';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { StorageProvider } from '@/contexts/StorageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { StripePaymentProvider } from '@/components/StripePaymentSheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import React from 'react';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <StripePaymentProvider>
            <SupabaseAuthProvider>
              <StorageProvider>
                <WidgetProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: 'fade',
                      animationDuration: 150,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="welcome" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="forgot-password" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth-callback" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </WidgetProvider>
              </StorageProvider>
            </SupabaseAuthProvider>
          </StripePaymentProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
