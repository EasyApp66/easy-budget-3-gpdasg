
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_EMAIL = 'mirosnic.ivan@icloud.com';

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<{
    isPremium: boolean;
    expiresAt?: string;
    daysRemaining?: number;
    isLifetime?: boolean;
  }>({ isPremium: false });

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    // Check if user is admin
    if (user?.email === ADMIN_EMAIL) {
      console.log('[Premium] Admin user detected, granting premium access');
      setIsPremium(true);
      setPremiumStatus({ isPremium: true, isLifetime: true });
      return;
    }

    // First check local storage for offline premium code
    try {
      const expiresAt = await AsyncStorage.getItem('premium_expires_at');
      const codeUsed = await AsyncStorage.getItem('premium_code_used');
      
      if (expiresAt && codeUsed === 'EASY2') {
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        
        if (expiryDate > now) {
          // Premium is still valid
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log('[Premium] Local premium active, days remaining:', daysRemaining);
          
          setIsPremium(true);
          setPremiumStatus({ 
            isPremium: true, 
            expiresAt: expiresAt,
            daysRemaining: daysRemaining,
            isLifetime: false
          });
          return;
        } else {
          // Premium expired, clear local storage
          console.log('[Premium] Local premium expired');
          await AsyncStorage.removeItem('premium_expires_at');
          await AsyncStorage.removeItem('premium_code_used');
        }
      }
    } catch (error) {
      console.error('[Premium] Error checking local premium status:', error);
    }

    // Check premium status from backend
    try {
      if (user?.email) {
        console.log('[Premium] Checking premium status for:', user.email);
        
        // Import API utilities
        const { authenticatedGet, BACKEND_URL } = await import('@/utils/api');
        
        if (!BACKEND_URL) {
          console.warn('[Premium] Backend URL not configured, defaulting to non-premium');
          setIsPremium(false);
          setPremiumStatus({ isPremium: false });
          return;
        }

        // Call backend to check premium status
        const data = await authenticatedGet<{ 
          isPremium: boolean; 
          expiresAt?: string;
          daysRemaining?: number;
          isLifetime?: boolean;
        }>('/api/premium/status');
        
        console.log('[Premium] Status received:', data);
        setIsPremium(data.isPremium || false);
        setPremiumStatus(data);
      } else {
        console.log('[Premium] No user email, defaulting to non-premium');
        setIsPremium(false);
        setPremiumStatus({ isPremium: false });
      }
    } catch (error) {
      console.error('[Premium] Error checking premium status:', error);
      // If endpoint doesn't exist yet (404), default to non-premium
      setIsPremium(false);
      setPremiumStatus({ isPremium: false });
    }
  };

  const checkLimit = (
    expenseCount: number,
    monthCount: number,
    subscriptionCount: number
  ): boolean => {
    // Admin has unlimited access
    if (user?.email === ADMIN_EMAIL) {
      return false;
    }
    
    // Premium users have unlimited access
    if (isPremium) {
      return false;
    }
    
    // Free users have limits
    return (
      expenseCount > 8 ||
      monthCount > 2 ||
      subscriptionCount > 5
    );
  };

  return {
    isPremium,
    premiumStatus,
    checkLimit,
    checkPremiumStatus,
  };
}
