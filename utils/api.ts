/**
 * API Utilities Template
 *
 * Provides utilities for making API calls to the backend.
 * Automatically reads backend URL from app.json configuration.
 *
 * Features:
 * - Automatic backend URL configuration
 * - Error handling with proper logging
 * - Type-safe request/response handling
 * - Helper functions for common HTTP methods
 * - Automatic bearer token management for authenticated requests
 *
 * Usage:
 * 1. Import BACKEND_URL or helper functions
 * 2. Use apiCall() for basic requests
 * 3. Use apiGet(), apiPost(), etc. for convenience
 * 4. Use authenticatedApiCall() for requests requiring auth (token auto-retrieved)
 * 5. Backend URL is automatically configured in app.json when backend deploys
 *
 * Expected Backend Endpoints:
 * 
 * Authentication (handled by Better Auth):
 * - POST /api/auth/sign-in/email - Email/password sign in
 * - POST /api/auth/sign-up/email - Email/password sign up
 * - GET /api/auth/session - Get current session
 * - POST /api/auth/sign-out - Sign out
 * - GET /api/auth/social/{provider} - OAuth sign in (google, apple, github)
 * 
 * Premium Management:
 * - GET /api/premium/status - Check user's premium status
 *   Response: { isPremium: boolean, expiresAt?: string }
 * 
 * Payment Processing:
 * - POST /api/payments/stripe - Process Stripe payment (web/android)
 *   Request: { type: 'onetime' | 'monthly', platform: string }
 *   Response: { success: boolean, paymentUrl?: string, transactionId?: string, message?: string }
 * 
 * - POST /api/payments/apple-pay - Process Apple Pay payment (iOS)
 *   Request: { type: 'onetime' | 'monthly', platform: string }
 *   Response: { success: boolean, paymentUrl?: string, transactionId?: string, message?: string }
 * 
 * - POST /api/payments/donation - Process donation payment
 *   Request: { amount: number, currency: string, platform: string }
 *   Response: { success: boolean, paymentUrl?: string, transactionId?: string, message?: string }
 */

import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Backend URL is configured in app.json under expo.extra.backendUrl
 * It is set automatically when the backend is deployed
 */
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "";

// Log backend configuration on module load
if (BACKEND_URL) {
  console.log("[API] ✅ Backend URL configured:", BACKEND_URL);
  console.log("[API] 📡 Ready to make API calls");
} else {
  console.error("[API] ❌ Backend URL not configured! Check app.json");
  console.error("[API] 💡 The app will work in offline mode until backend is configured");
}

/**
 * Bearer token storage key
 * Matches the key used in lib/auth.ts
 */
const BEARER_TOKEN_KEY = "easybudget_bearer_token";

/**
 * Check if backend is properly configured
 */
export const isBackendConfigured = (): boolean => {
  const configured = !!BACKEND_URL && BACKEND_URL.length > 0;
  if (!configured) {
    console.error("[API] Backend URL is not configured!");
    console.error("[API] BACKEND_URL:", BACKEND_URL);
  }
  return configured;
};

/**
 * Get bearer token from platform-specific storage
 * Web: localStorage
 * Native: SecureStore
 *
 * @returns Bearer token or null if not found
 */
export const getBearerToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(BEARER_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
    }
  } catch (error) {
    console.error("[API] Error retrieving bearer token:", error);
    return null;
  }
};

/**
 * Generic API call helper with error handling
 *
 * @param endpoint - API endpoint path (e.g., '/users', '/auth/login')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 * @throws Error if backend is not configured or request fails
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  if (!isBackendConfigured()) {
    throw new Error("Backend URL not configured. Please rebuild the app.");
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log("[API] Calling:", url, options?.method || "GET");

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[API] Error response:", response.status, text);
      throw new Error(`API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log("[API] Success:", data);
    return data;
  } catch (error) {
    console.error("[API] Request failed:", error);
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = async <T = any>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: "GET" });
};

/**
 * POST request helper
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = async <T = any>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: "DELETE" });
};

/**
 * Authenticated API call helper
 * Automatically retrieves bearer token from storage and adds to Authorization header
 *
 * @param endpoint - API endpoint path
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 * @throws Error if token not found or request fails
 */
export const authenticatedApiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  console.log("[API] Retrieving authentication token...");
  const token = await getBearerToken();

  if (!token) {
    console.error("[API] No authentication token found!");
    throw new Error("Authentication token not found. Please sign in.");
  }

  console.log("[API] Token found, making authenticated request");
  return apiCall<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Authenticated GET request
 */
export const authenticatedGet = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, { method: "GET" });
};

/**
 * Authenticated POST request
 */
export const authenticatedPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PUT request
 */
export const authenticatedPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PATCH request
 */
export const authenticatedPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated DELETE request
 */
export const authenticatedDelete = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, { method: "DELETE" });
};
