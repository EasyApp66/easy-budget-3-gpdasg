
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform, Alert } from "react-native";
import { authClient, storeWebBearerToken } from "@/lib/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = '@easy_budget_session';
const SESSION_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

// Web-only OAuth popup function
function openOAuthPopup(provider: string): Promise<string> {
  if (Platform.OS !== "web") {
    return Promise.reject(new Error("OAuth popup only available on web"));
  }

  return new Promise((resolve, reject) => {
    try {
      const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        popupUrl,
        "oauth-popup",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        reject(new Error("Failed to open popup. Please allow popups."));
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "oauth-success" && event.data?.token) {
          window.removeEventListener("message", handleMessage);
          clearInterval(checkClosed);
          resolve(event.data.token);
        } else if (event.data?.type === "oauth-error") {
          window.removeEventListener("message", handleMessage);
          clearInterval(checkClosed);
          reject(new Error(event.data.error || "OAuth failed"));
        }
      };

      window.addEventListener("message", handleMessage);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          reject(new Error("Authentication cancelled"));
        }
      }, 500);
    } catch (error) {
      console.error("OAuth popup error:", error);
      reject(error);
    }
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('[AuthContext] ========================================');
    console.log('[AuthContext] Initializing authentication...');
    
    try {
      // Check if we have a stored session
      const storedSessionStr = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      
      if (storedSessionStr) {
        const storedSession = JSON.parse(storedSessionStr);
        const now = Date.now();
        const sessionAge = now - storedSession.timestamp;
        
        console.log('[AuthContext] Found stored session:');
        console.log('[AuthContext] - User:', storedSession.user?.email);
        console.log('[AuthContext] - Age:', Math.floor(sessionAge / (1000 * 60 * 60 * 24)), 'days');
        console.log('[AuthContext] - Max age:', Math.floor(SESSION_DURATION / (1000 * 60 * 60 * 24)), 'days');
        
        // Check if session is still valid (within 60 days)
        if (sessionAge < SESSION_DURATION) {
          console.log('[AuthContext] ✅ Session is still valid, restoring user');
          setUser(storedSession.user);
          setLoading(false);
          console.log('[AuthContext] ========================================');
          return;
        } else {
          console.log('[AuthContext] ⚠️  Session expired, clearing');
          await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } else {
        console.log('[AuthContext] No stored session found');
      }
      
      // Try to fetch from backend
      await fetchUser();
    } catch (error) {
      console.error('[AuthContext] Error initializing auth:', error);
      setLoading(false);
    }
    
    console.log('[AuthContext] ========================================');
  };

  const storeSession = async (userData: User) => {
    try {
      const session = {
        user: userData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      console.log('[AuthContext] Session stored for 60 days');
    } catch (error) {
      console.error('[AuthContext] Error storing session:', error);
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      console.log('[AuthContext] Session cleared');
    } catch (error) {
      console.error('[AuthContext] Error clearing session:', error);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log('[AuthContext] Fetching user session from backend...');
      const session = await authClient.getSession();
      console.log('[AuthContext] Session response:', session);
      
      if (session?.data?.user) {
        console.log('[AuthContext] ✅ User found:', session.data.user.email);
        const userData = session.data.user as User;
        setUser(userData);
        await storeSession(userData);
      } else {
        console.log('[AuthContext] No user session found on backend');
        setUser(null);
        await clearSession();
      }
    } catch (error) {
      console.error("[AuthContext] Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Signing in with email:', email);
      await authClient.signIn.email({ email, password });
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] Email sign in failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log('[AuthContext] Signing up with email:', email);
      await authClient.signUp.email({
        email,
        password,
        name,
      });
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] Email sign up failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[AuthContext] Starting Google OAuth flow, platform:', Platform.OS);
      
      if (Platform.OS === "web") {
        console.log('[AuthContext] Web platform - opening OAuth popup');
        const token = await openOAuthPopup("google");
        console.log('[AuthContext] OAuth popup returned token');
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        console.log('[AuthContext] Native platform - using Better Auth social sign in');
        console.log('[AuthContext] Calling authClient.signIn.social with provider: google');
        
        // Use redirect: false to prevent extra screens
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: "easybudget://auth-callback",
          redirect: false,
        });
        
        console.log('[AuthContext] Social sign in result:', result);
        
        // If we got a redirect URL, open it in the system browser
        if (result?.data?.url) {
          console.log('[AuthContext] Opening OAuth URL in system browser');
          const { openAuthSessionAsync } = await import('expo-web-browser');
          const authResult = await openAuthSessionAsync(
            result.data.url,
            "easybudget://auth-callback"
          );
          
          console.log('[AuthContext] Auth session result:', authResult);
          
          if (authResult.type === 'success') {
            // Fetch user after successful OAuth
            await fetchUser();
          } else if (authResult.type === 'cancel') {
            throw new Error('Authentication cancelled');
          }
        } else {
          await fetchUser();
        }
      }
      
      console.log('[AuthContext] Google sign in completed successfully');
    } catch (error: any) {
      console.error("[AuthContext] Google sign in failed:", error);
      console.error("[AuthContext] Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
      });
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('[AuthContext] Starting Apple OAuth flow, platform:', Platform.OS);
      
      if (Platform.OS === "web") {
        console.log('[AuthContext] Web platform - opening OAuth popup');
        const token = await openOAuthPopup("apple");
        console.log('[AuthContext] OAuth popup returned token');
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        console.log('[AuthContext] Native platform - using Better Auth social sign in');
        console.log('[AuthContext] Calling authClient.signIn.social with provider: apple');
        
        // Use redirect: false to prevent extra screens
        const result = await authClient.signIn.social({
          provider: "apple",
          callbackURL: "easybudget://auth-callback",
          redirect: false,
        });
        
        console.log('[AuthContext] Social sign in result:', result);
        
        // If we got a redirect URL, open it in the system browser
        if (result?.data?.url) {
          console.log('[AuthContext] Opening OAuth URL in system browser');
          const { openAuthSessionAsync } = await import('expo-web-browser');
          const authResult = await openAuthSessionAsync(
            result.data.url,
            "easybudget://auth-callback"
          );
          
          console.log('[AuthContext] Auth session result:', authResult);
          
          if (authResult.type === 'success') {
            // Fetch user after successful OAuth
            await fetchUser();
          } else if (authResult.type === 'cancel') {
            throw new Error('Authentication cancelled');
          }
        } else {
          await fetchUser();
        }
      }
      
      console.log('[AuthContext] Apple sign in completed successfully');
    } catch (error: any) {
      console.error("[AuthContext] Apple sign in failed:", error);
      console.error("[AuthContext] Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
      });
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    try {
      console.log('[AuthContext] Starting GitHub OAuth flow, platform:', Platform.OS);
      
      if (Platform.OS === "web") {
        console.log('[AuthContext] Web platform - opening OAuth popup');
        const token = await openOAuthPopup("github");
        console.log('[AuthContext] OAuth popup returned token');
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        console.log('[AuthContext] Native platform - using Better Auth social sign in');
        
        // Use redirect: false to prevent extra screens
        const result = await authClient.signIn.social({
          provider: "github",
          callbackURL: "easybudget://auth-callback",
          redirect: false,
        });
        
        console.log('[AuthContext] Social sign in result:', result);
        
        // If we got a redirect URL, open it in the system browser
        if (result?.data?.url) {
          console.log('[AuthContext] Opening OAuth URL in system browser');
          const { openAuthSessionAsync } = await import('expo-web-browser');
          const authResult = await openAuthSessionAsync(
            result.data.url,
            "easybudget://auth-callback"
          );
          
          console.log('[AuthContext] Auth session result:', authResult);
          
          if (authResult.type === 'success') {
            // Fetch user after successful OAuth
            await fetchUser();
          } else if (authResult.type === 'cancel') {
            throw new Error('Authentication cancelled');
          }
        } else {
          await fetchUser();
        }
      }
      
      console.log('[AuthContext] GitHub sign in completed successfully');
    } catch (error: any) {
      console.error("[AuthContext] GitHub sign in failed:", error);
      console.error("[AuthContext] Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out user');
      await authClient.signOut();
      await clearSession();
      setUser(null);
      console.log('[AuthContext] Sign out successful');
    } catch (error) {
      console.error("[AuthContext] Sign out failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
