
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_URL = "https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev";

const BEARER_TOKEN_KEY = "easybudget_bearer_token";

// Platform-specific storage: localStorage for web, SecureStore for native
const storage = Platform.OS === "web"
  ? {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn("localStorage.getItem failed:", error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn("localStorage.setItem failed:", error);
        }
      },
      deleteItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn("localStorage.removeItem failed:", error);
        }
      },
    }
  : SecureStore;

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "easybudget",
      storagePrefix: "easybudget",
      storage,
    }),
  ],
  // On web, use bearer token for authenticated requests
  ...(Platform.OS === "web" && {
    fetchOptions: {
      auth: {
        type: "Bearer" as const,
        token: () => {
          try {
            return localStorage.getItem(BEARER_TOKEN_KEY) || "";
          } catch (error) {
            console.warn("Failed to get bearer token:", error);
            return "";
          }
        },
      },
    },
  }),
});

export function storeWebBearerToken(token: string) {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(BEARER_TOKEN_KEY, token);
    } catch (error) {
      console.warn("Failed to store bearer token:", error);
    }
  }
}

export function clearAuthTokens() {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(BEARER_TOKEN_KEY);
    } catch (error) {
      console.warn("Failed to clear bearer token:", error);
    }
  }
}

export { API_URL };
