
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Configure WebBrowser for OAuth
if (typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  checkPremiumStatus: () => Promise<void>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = '@easy_budget_supabase_session';
const PREMIUM_STORAGE_KEY = '@easy_budget_premium_status';

// Lazy load AsyncStorage to avoid SSR issues
let AsyncStorage: any = null;
if (typeof window !== 'undefined' || Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    console.log('[SupabaseAuth] Initializing...');
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[SupabaseAuth] Auth state changed:', event);
        
        if (session) {
          console.log('[SupabaseAuth] Session active:', session.user.email);
          setSession(session);
          setUser(session.user);
          await storeSession(session);
          await checkPremiumStatus();
        } else {
          console.log('[SupabaseAuth] No session');
          setSession(null);
          setUser(null);
          await clearSession();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('[SupabaseAuth] Checking for existing session...');
      
      if (!AsyncStorage) {
        console.log('[SupabaseAuth] AsyncStorage not available (SSR)');
        setLoading(false);
        return;
      }
      
      // Try to restore session from storage
      const storedSessionStr = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSessionStr) {
        const storedSession = JSON.parse(storedSessionStr);
        console.log('[SupabaseAuth] Found stored session');
        
        // Verify session is still valid
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          console.log('[SupabaseAuth] Session is valid');
          setSession(session);
          setUser(session.user);
          await checkPremiumStatus();
        } else {
          console.log('[SupabaseAuth] Session expired or invalid');
          await clearSession();
        }
      } else {
        console.log('[SupabaseAuth] No stored session found');
      }
    } catch (error) {
      console.error('[SupabaseAuth] Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeSession = async (session: Session) => {
    try {
      if (!AsyncStorage) {
        console.log('[SupabaseAuth] AsyncStorage not available, skipping session storage');
        return;
      }
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      console.log('[SupabaseAuth] Session stored');
    } catch (error) {
      console.error('[SupabaseAuth] Error storing session:', error);
    }
  };

  const clearSession = async () => {
    try {
      if (!AsyncStorage) {
        console.log('[SupabaseAuth] AsyncStorage not available, skipping session clear');
        return;
      }
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
      console.log('[SupabaseAuth] Session cleared');
    } catch (error) {
      console.error('[SupabaseAuth] Error clearing session:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      console.log('[SupabaseAuth] Checking premium status...');
      
      if (!AsyncStorage) {
        console.log('[SupabaseAuth] AsyncStorage not available, skipping offline check');
      } else {
        // Check offline storage first
        const storedPremiumStr = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        if (storedPremiumStr) {
          const storedPremium = JSON.parse(storedPremiumStr);
          const expiresAt = new Date(storedPremium.expiresAt);
          
          if (expiresAt > new Date()) {
            console.log('[SupabaseAuth] Premium active (offline)');
            setIsPremium(true);
            setPremiumExpiresAt(expiresAt);
            return;
          }
        }
      }

      // Check database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[SupabaseAuth] No user, premium = false');
        setIsPremium(false);
        setPremiumExpiresAt(null);
        return;
      }

      const { data: subscriptions, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[SupabaseAuth] Error checking premium:', error);
        setIsPremium(false);
        setPremiumExpiresAt(null);
        return;
      }

      if (subscriptions && subscriptions.length > 0) {
        const expiresAt = new Date(subscriptions[0].expires_at);
        console.log('[SupabaseAuth] Premium active until:', expiresAt);
        setIsPremium(true);
        setPremiumExpiresAt(expiresAt);
        
        // Store offline
        if (AsyncStorage) {
          await AsyncStorage.setItem(
            PREMIUM_STORAGE_KEY,
            JSON.stringify({ expiresAt: expiresAt.toISOString() })
          );
        }
      } else {
        console.log('[SupabaseAuth] No active premium subscription');
        setIsPremium(false);
        setPremiumExpiresAt(null);
      }
    } catch (error) {
      console.error('[SupabaseAuth] Error checking premium status:', error);
      setIsPremium(false);
      setPremiumExpiresAt(null);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('[SupabaseAuth] Signing in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('[SupabaseAuth] Sign in successful');
      setSession(data.session);
      setUser(data.user);
      await storeSession(data.session);
      await checkPremiumStatus();
    } catch (error: any) {
      console.error('[SupabaseAuth] Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log('[SupabaseAuth] Signing up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      });

      if (error) throw error;
      
      console.log('[SupabaseAuth] Sign up successful');
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await storeSession(data.session);
        await checkPremiumStatus();
      }
    } catch (error: any) {
      console.error('[SupabaseAuth] Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[SupabaseAuth] Starting Google OAuth...');
      
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth-callback' : undefined,
          },
        });
        
        if (error) throw error;
        console.log('[SupabaseAuth] Google OAuth initiated (web)');
      } else {
        // Native OAuth flow
        const redirectUrl = Linking.createURL('/auth-callback');
        console.log('[SupabaseAuth] Redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        
        if (data?.url) {
          console.log('[SupabaseAuth] Opening OAuth URL:', data.url);
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl
          );
          
          console.log('[SupabaseAuth] OAuth result:', result);
          
          if (result.type === 'success' && result.url) {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            if (sessionData.session) {
              setSession(sessionData.session);
              setUser(sessionData.session.user);
              await storeSession(sessionData.session);
              await checkPremiumStatus();
            }
          } else if (result.type === 'cancel') {
            throw new Error('Authentication cancelled');
          }
        }
      }
    } catch (error: any) {
      console.error('[SupabaseAuth] Google OAuth error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('[SupabaseAuth] Starting Apple OAuth...');
      
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth-callback' : undefined,
          },
        });
        
        if (error) throw error;
        console.log('[SupabaseAuth] Apple OAuth initiated (web)');
      } else {
        // Native OAuth flow
        const redirectUrl = Linking.createURL('/auth-callback');
        console.log('[SupabaseAuth] Redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        
        if (data?.url) {
          console.log('[SupabaseAuth] Opening OAuth URL:', data.url);
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl
          );
          
          console.log('[SupabaseAuth] OAuth result:', result);
          
          if (result.type === 'success' && result.url) {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            if (sessionData.session) {
              setSession(sessionData.session);
              setUser(sessionData.session.user);
              await storeSession(sessionData.session);
              await checkPremiumStatus();
            }
          } else if (result.type === 'cancel') {
            throw new Error('Authentication cancelled');
          }
        }
      }
    } catch (error: any) {
      console.error('[SupabaseAuth] Apple OAuth error:', error);
      throw new Error(error.message || 'Failed to sign in with Apple');
    }
  };

  const signOut = async () => {
    try {
      console.log('[SupabaseAuth] Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setIsPremium(false);
      setPremiumExpiresAt(null);
      await clearSession();
      console.log('[SupabaseAuth] Sign out successful');
    } catch (error: any) {
      console.error('[SupabaseAuth] Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[SupabaseAuth] Redeeming promo code:', code);
      
      if (!user) {
        return { success: false, message: 'You must be signed in to redeem a code' };
      }

      // Check if code exists and is valid
      const { data: promoCodes, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .limit(1);

      if (promoError || !promoCodes || promoCodes.length === 0) {
        console.error('[SupabaseAuth] Promo code not found');
        return { success: false, message: 'Invalid promo code' };
      }

      const promoCode = promoCodes[0];

      // Check if already redeemed
      const { data: redemptions, error: redemptionError } = await supabase
        .from('promo_code_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('promo_code_id', promoCode.id)
        .limit(1);

      if (redemptionError) {
        console.error('[SupabaseAuth] Error checking redemptions:', redemptionError);
        return { success: false, message: 'Error checking promo code' };
      }

      if (redemptions && redemptions.length > 0) {
        return { success: false, message: 'You have already redeemed this code' };
      }

      // Check redemption limit
      if (promoCode.max_redemptions && promoCode.current_redemptions >= promoCode.max_redemptions) {
        return { success: false, message: 'This code has reached its redemption limit' };
      }

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + promoCode.duration_days);

      // Create redemption record
      const { error: insertRedemptionError } = await supabase
        .from('promo_code_redemptions')
        .insert({
          user_id: user.id,
          promo_code_id: promoCode.id,
          expires_at: expiresAt.toISOString(),
        });

      if (insertRedemptionError) {
        console.error('[SupabaseAuth] Error creating redemption:', insertRedemptionError);
        return { success: false, message: 'Error redeeming code' };
      }

      // Create premium subscription
      const { error: insertSubError } = await supabase
        .from('premium_subscriptions')
        .insert({
          user_id: user.id,
          type: 'subscription',
          provider: 'promo',
          status: 'active',
          expires_at: expiresAt.toISOString(),
        });

      if (insertSubError) {
        console.error('[SupabaseAuth] Error creating subscription:', insertSubError);
        return { success: false, message: 'Error activating premium' };
      }

      // Update redemption count
      await supabase
        .from('promo_codes')
        .update({ current_redemptions: promoCode.current_redemptions + 1 })
        .eq('id', promoCode.id);

      // Refresh premium status
      await checkPremiumStatus();

      console.log('[SupabaseAuth] Promo code redeemed successfully');
      return {
        success: true,
        message: `Premium activated for ${promoCode.duration_days} days!`,
      };
    } catch (error: any) {
      console.error('[SupabaseAuth] Error redeeming promo code:', error);
      return { success: false, message: error.message || 'Error redeeming code' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
        isPremium,
        premiumExpiresAt,
        checkPremiumStatus,
        redeemPromoCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
}
