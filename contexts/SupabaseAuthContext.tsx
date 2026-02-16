
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
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
  isLifetimePremium: boolean;
  trialDaysRemaining: number;
  hasUsedTrial: boolean;
  checkPremiumStatus: () => Promise<void>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  dismissTrialPopup: () => Promise<void>;
  shouldShowTrialPopup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = '@easy_budget_supabase_session';
const PREMIUM_STORAGE_KEY = '@easy_budget_premium_status';
const TRIAL_POPUP_KEY = '@easy_budget_trial_popup_shown';
const PROMO_CODE_KEY = '@easy_budget_promo_code';
const LIFETIME_PROMO_CODE = 'EASY2030';
const TRIAL_DURATION_DAYS = 14;

// Lazy load AsyncStorage to avoid SSR issues
let AsyncStorage: any = null;
if (typeof window !== 'undefined' || Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('[SupabaseAuth] Failed to load AsyncStorage:', error);
  }
}

// For web, use localStorage wrapper
const getStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      getItem: async (key: string) => {
        try {
          return window.localStorage.getItem(key);
        } catch (error) {
          console.error('[SupabaseAuth] localStorage.getItem error:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
        } catch (error) {
          console.error('[SupabaseAuth] localStorage.setItem error:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          console.error('[SupabaseAuth] localStorage.removeItem error:', error);
        }
      },
    };
  }
  return AsyncStorage;
};

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<Date | null>(null);
  const [isLifetimePremium, setIsLifetimePremium] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [shouldShowTrialPopup, setShouldShowTrialPopup] = useState(false);

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
      
      const storage = getStorage();
      if (!storage) {
        console.log('[SupabaseAuth] Storage not available (SSR)');
        setLoading(false);
        return;
      }
      
      // Try to restore session from storage
      const storedSessionStr = await storage.getItem(SESSION_STORAGE_KEY);
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
      const storage = getStorage();
      if (!storage) {
        console.log('[SupabaseAuth] Storage not available, skipping session storage');
        return;
      }
      await storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      console.log('[SupabaseAuth] Session stored');
    } catch (error) {
      console.error('[SupabaseAuth] Error storing session:', error);
    }
  };

  const clearSession = async () => {
    try {
      const storage = getStorage();
      if (!storage) {
        console.log('[SupabaseAuth] Storage not available, skipping session clear');
        return;
      }
      await storage.removeItem(SESSION_STORAGE_KEY);
      await storage.removeItem(PREMIUM_STORAGE_KEY);
      console.log('[SupabaseAuth] Session cleared');
    } catch (error) {
      console.error('[SupabaseAuth] Error clearing session:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      console.log('[SupabaseAuth] Checking premium status...');
      
      const storage = getStorage();
      if (!storage) {
        console.log('[SupabaseAuth] Storage not available');
        return;
      }

      // Check for offline promo code (EASY2030 for lifetime)
      const storedPromoCode = await storage.getItem(PROMO_CODE_KEY);
      if (storedPromoCode === LIFETIME_PROMO_CODE) {
        console.log('[SupabaseAuth] Lifetime premium active (offline promo code)');
        setIsPremium(true);
        setIsLifetimePremium(true);
        setPremiumExpiresAt(null);
        setTrialDaysRemaining(0);
        setHasUsedTrial(true);
        return;
      }

      // Check offline storage for premium status
      const storedPremiumStr = await storage.getItem(PREMIUM_STORAGE_KEY);
      if (storedPremiumStr) {
        const storedPremium = JSON.parse(storedPremiumStr);
        const expiresAt = storedPremium.expiresAt ? new Date(storedPremium.expiresAt) : null;
        
        if (storedPremium.isLifetime) {
          console.log('[SupabaseAuth] Lifetime premium active (offline)');
          setIsPremium(true);
          setIsLifetimePremium(true);
          setPremiumExpiresAt(null);
          setTrialDaysRemaining(0);
          setHasUsedTrial(true);
          return;
        }
        
        if (expiresAt && expiresAt > new Date()) {
          const daysRemaining = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          console.log('[SupabaseAuth] Premium active (offline), days remaining:', daysRemaining);
          setIsPremium(true);
          setIsLifetimePremium(false);
          setPremiumExpiresAt(expiresAt);
          setTrialDaysRemaining(daysRemaining);
          setHasUsedTrial(storedPremium.hasUsedTrial || false);
          return;
        }
      }

      // Check database for premium status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[SupabaseAuth] No user, checking for trial eligibility');
        setIsPremium(false);
        setIsLifetimePremium(false);
        setPremiumExpiresAt(null);
        setTrialDaysRemaining(0);
        setHasUsedTrial(false);
        return;
      }

      // Check if user has used trial
      const trialPopupShown = await storage.getItem(TRIAL_POPUP_KEY);
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const accountAgeDays = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // New user gets 2-week trial automatically
      if (accountAgeDays <= TRIAL_DURATION_DAYS && !trialPopupShown) {
        const trialExpiresAt = new Date(userCreatedAt);
        trialExpiresAt.setDate(trialExpiresAt.getDate() + TRIAL_DURATION_DAYS);
        
        const daysRemaining = Math.ceil((trialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining > 0) {
          console.log('[SupabaseAuth] New user trial active, days remaining:', daysRemaining);
          setIsPremium(true);
          setIsLifetimePremium(false);
          setPremiumExpiresAt(trialExpiresAt);
          setTrialDaysRemaining(daysRemaining);
          setHasUsedTrial(false);
          setShouldShowTrialPopup(true);
          
          // Store trial status offline
          await storage.setItem(
            PREMIUM_STORAGE_KEY,
            JSON.stringify({
              expiresAt: trialExpiresAt.toISOString(),
              isLifetime: false,
              hasUsedTrial: false,
              isTrial: true,
            })
          );
          return;
        } else {
          setHasUsedTrial(true);
        }
      } else if (accountAgeDays > TRIAL_DURATION_DAYS) {
        setHasUsedTrial(true);
      }

      // Check for active premium subscription in database
      const { data: subscriptions, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('expires_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[SupabaseAuth] Error checking premium:', error);
        setIsPremium(false);
        setIsLifetimePremium(false);
        setPremiumExpiresAt(null);
        setTrialDaysRemaining(0);
        return;
      }

      if (subscriptions && subscriptions.length > 0) {
        const sub = subscriptions[0];
        const isLifetime = sub.expires_at === null || sub.provider === 'promo_lifetime';
        
        if (isLifetime) {
          console.log('[SupabaseAuth] Lifetime premium active (database)');
          setIsPremium(true);
          setIsLifetimePremium(true);
          setPremiumExpiresAt(null);
          setTrialDaysRemaining(0);
          setHasUsedTrial(true);
          
          // Store offline
          await storage.setItem(
            PREMIUM_STORAGE_KEY,
            JSON.stringify({ isLifetime: true, hasUsedTrial: true })
          );
        } else {
          const expiresAt = new Date(sub.expires_at);
          if (expiresAt > new Date()) {
            const daysRemaining = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            console.log('[SupabaseAuth] Premium active until:', expiresAt, 'days remaining:', daysRemaining);
            setIsPremium(true);
            setIsLifetimePremium(false);
            setPremiumExpiresAt(expiresAt);
            setTrialDaysRemaining(daysRemaining);
            setHasUsedTrial(true);
            
            // Store offline
            await storage.setItem(
              PREMIUM_STORAGE_KEY,
              JSON.stringify({
                expiresAt: expiresAt.toISOString(),
                isLifetime: false,
                hasUsedTrial: true,
              })
            );
          } else {
            console.log('[SupabaseAuth] Premium subscription expired');
            setIsPremium(false);
            setIsLifetimePremium(false);
            setPremiumExpiresAt(null);
            setTrialDaysRemaining(0);
            setHasUsedTrial(true);
          }
        }
      } else {
        console.log('[SupabaseAuth] No active premium subscription');
        setIsPremium(false);
        setIsLifetimePremium(false);
        setPremiumExpiresAt(null);
        setTrialDaysRemaining(0);
      }
    } catch (error) {
      console.error('[SupabaseAuth] Error checking premium status:', error);
      setIsPremium(false);
      setIsLifetimePremium(false);
      setPremiumExpiresAt(null);
      setTrialDaysRemaining(0);
    }
  };

  const dismissTrialPopup = async () => {
    try {
      const storage = getStorage();
      if (storage) {
        await storage.setItem(TRIAL_POPUP_KEY, 'true');
        setShouldShowTrialPopup(false);
        console.log('[SupabaseAuth] Trial popup dismissed');
      }
    } catch (error) {
      console.error('[SupabaseAuth] Error dismissing trial popup:', error);
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
      setIsLifetimePremium(false);
      setTrialDaysRemaining(0);
      setHasUsedTrial(false);
      setShouldShowTrialPopup(false);
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
      
      const storage = getStorage();
      if (!storage) {
        return { success: false, message: 'Storage nicht verfügbar' };
      }

      const codeUpper = code.toUpperCase().trim();

      // Check for lifetime promo code (EASY2030) - works offline
      if (codeUpper === LIFETIME_PROMO_CODE) {
        // Check if already redeemed
        const existingCode = await storage.getItem(PROMO_CODE_KEY);
        if (existingCode === LIFETIME_PROMO_CODE) {
          return { success: false, message: 'Du hast diesen Code bereits eingelöst' };
        }

        // Store promo code for offline access
        await storage.setItem(PROMO_CODE_KEY, LIFETIME_PROMO_CODE);
        await storage.setItem(
          PREMIUM_STORAGE_KEY,
          JSON.stringify({ isLifetime: true, hasUsedTrial: true })
        );

        // Update state
        setIsPremium(true);
        setIsLifetimePremium(true);
        setPremiumExpiresAt(null);
        setTrialDaysRemaining(0);
        setHasUsedTrial(true);
        setShouldShowTrialPopup(false);

        console.log('[SupabaseAuth] Lifetime promo code redeemed successfully (offline)');
        return {
          success: true,
          message: '🎉 Premium für immer aktiviert!',
        };
      }

      // Invalid code
      return { success: false, message: 'Ungültiger Promo-Code' };
    } catch (error: any) {
      console.error('[SupabaseAuth] Error redeeming promo code:', error);
      return { success: false, message: error.message || 'Fehler beim Einlösen des Codes' };
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
        isLifetimePremium,
        trialDaysRemaining,
        hasUsedTrial,
        checkPremiumStatus,
        redeemPromoCode,
        dismissTrialPopup,
        shouldShowTrialPopup,
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
