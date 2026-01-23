
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import { authClient, storeWebBearerToken } from "@/lib/auth";
// NOTE: Superwall temporarily disabled due to build issues
// import { useUser as useSuperwallUser } from "expo-superwall";

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
  // NOTE: Superwall temporarily disabled due to build issues
  // const { identify: identifySuperwallUser } = useSuperwallUser();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log('[AuthContext] Fetching user session...');
      const session = await authClient.getSession();
      console.log('[AuthContext] Session response:', session);
      
      if (session?.data?.user) {
        console.log('[AuthContext] User found:', session.data.user);
        const userData = session.data.user as User;
        setUser(userData);
        
        // NOTE: Superwall user identification temporarily disabled
        // Identify user with Superwall for in-app purchases
        // if (userData.id) {
        //   console.log('[AuthContext] Identifying user with Superwall:', userData.id);
        //   try {
        //     await identifySuperwallUser(userData.id);
        //     console.log('[AuthContext] Superwall user identified successfully');
        //   } catch (error) {
        //     console.error('[AuthContext] Failed to identify Superwall user:', error);
        //   }
        // }
      } else {
        console.log('[AuthContext] No user session found');
        setUser(null);
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
        
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: "easybudget://auth-callback",
        });
        
        console.log('[AuthContext] Social sign in result:', result);
        await fetchUser();
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
        
        const result = await authClient.signIn.social({
          provider: "apple",
          callbackURL: "easybudget://auth-callback",
        });
        
        console.log('[AuthContext] Social sign in result:', result);
        await fetchUser();
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
        const result = await authClient.signIn.social({
          provider: "github",
          callbackURL: "easybudget://auth-callback",
        });
        
        console.log('[AuthContext] Social sign in result:', result);
        await fetchUser();
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
