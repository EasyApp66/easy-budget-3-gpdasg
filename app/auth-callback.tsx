
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";

type Status = "processing" | "success" | "error";

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const router = useRouter();
  const { fetchUser } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('[AuthCallback] Screen mounted, platform:', Platform.OS);
    console.log('[AuthCallback] URL params:', params);
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      if (Platform.OS === "web") {
        console.log('[AuthCallback] Web platform - handling OAuth callback');
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("better_auth_token");
        const error = urlParams.get("error");

        console.log('[AuthCallback] Token:', token ? 'present' : 'missing');
        console.log('[AuthCallback] Error:', error);

        if (error) {
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          window.opener?.postMessage({ type: "oauth-error", error }, "*");
          return;
        }

        if (token) {
          setStatus("success");
          setMessage("Authentication successful! Closing...");
          window.opener?.postMessage({ type: "oauth-success", token }, "*");
          setTimeout(() => window.close(), 1000);
        } else {
          setStatus("error");
          setMessage("No authentication token received");
          window.opener?.postMessage({ type: "oauth-error", error: "No token" }, "*");
        }
      } else {
        console.log('[AuthCallback] Native platform - handling OAuth callback');
        console.log('[AuthCallback] Params:', params);
        
        // On native, Better Auth handles the OAuth flow automatically
        // We just need to fetch the user session and redirect
        const error = params.error as string | undefined;
        
        if (error) {
          console.error('[AuthCallback] OAuth error:', error);
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => {
            router.replace('/welcome');
          }, 2000);
          return;
        }

        console.log('[AuthCallback] Fetching user session...');
        await fetchUser();
        
        setStatus("success");
        setMessage("Authentication successful!");
        
        console.log('[AuthCallback] Redirecting to budget screen...');
        setTimeout(() => {
          router.replace('/(tabs)/budget');
        }, 1000);
      }
    } catch (err: any) {
      console.error('[AuthCallback] Error processing callback:', err);
      console.error('[AuthCallback] Error details:', {
        message: err?.message,
        stack: err?.stack,
      });
      
      setStatus("error");
      setMessage("Failed to process authentication");
      
      if (Platform.OS !== "web") {
        setTimeout(() => {
          router.replace('/welcome');
        }, 2000);
      }
    }
  };

  return (
    <View style={styles.container}>
      {status === "processing" && <ActivityIndicator size="large" color={colors.neonGreen} />}
      {status === "success" && <Text style={styles.successIcon}>✓</Text>}
      {status === "error" && <Text style={styles.errorIcon}>✗</Text>}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.black,
  },
  successIcon: {
    fontSize: 48,
    color: colors.neonGreen,
  },
  errorIcon: {
    fontSize: 48,
    color: colors.red,
  },
  message: {
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
    color: colors.white,
  },
});
