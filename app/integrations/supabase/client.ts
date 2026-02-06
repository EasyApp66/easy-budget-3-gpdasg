
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = "https://cwmxrnnwrrkaculypyav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bXhybm53cnJrYWN1bHlweWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDQwMTcsImV4cCI6MjA4NTEyMDAxN30.S5v0apigYBmLPbsUgP5mqJTmjZlXLTU1JJZZ6TsjIEE";

console.log('[Supabase] Initializing client...');
console.log('[Supabase] URL:', SUPABASE_URL);
console.log('[Supabase] Platform:', Platform.OS);

// Lazy import AsyncStorage to avoid SSR issues
let AsyncStorage: any = null;

// Only import AsyncStorage on client-side (not during SSR)
if (typeof window !== 'undefined' || Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    console.log('[Supabase] AsyncStorage loaded successfully');
  } catch (error) {
    console.warn('[Supabase] Failed to load AsyncStorage:', error);
  }
}

// For web, use localStorage as storage
const getStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.log('[Supabase] Using localStorage for web');
    return {
      getItem: (key: string) => {
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch (error) {
          console.error('[Supabase] localStorage.getItem error:', error);
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.error('[Supabase] localStorage.setItem error:', error);
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          console.error('[Supabase] localStorage.removeItem error:', error);
          return Promise.resolve();
        }
      },
    };
  }
  
  if (AsyncStorage) {
    console.log('[Supabase] Using AsyncStorage for native');
    return AsyncStorage;
  }
  
  console.warn('[Supabase] No storage available');
  return undefined;
};

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

console.log('[Supabase] Client initialized successfully');

// Helper to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[Supabase] Sign out error:', error);
    throw error;
  }
  console.log('[Supabase] User signed out successfully');
};
