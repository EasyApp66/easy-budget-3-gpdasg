
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// NOTE: Superwall temporarily disabled due to build issues
// import { useUser } from 'expo-superwall';

const ADMIN_EMAIL = 'mirosnic.ivan@icloud.com';
const PREMIUM_EXPIRY_KEY = '@easy_budget_premium_expiry';
const VALID_PROMO_CODE = 'EASY2';

export function usePremium() {
  const { user } = useAuth();
  // NOTE: Superwall temporarily disabled due to build issues
  // const { subscriptionStatus, user: superwallUser } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<{
    isPremium: boolean;
    expiresAt?: string;
    daysRemaining?: number;
    isLifetime?: boolean;
  }>({ isPremium: false });

  useEffect(() => {
    checkPremiumStatus();
  }, [user]); // Removed subscriptionStatus dependency

  const checkPremiumStatus = async () => {
    console.log('[Premium] Checking premium status');
    
    // Check if user is admin
    if (user?.email === ADMIN_EMAIL) {
      console.log('[Premium] Admin user detected, granting premium access');
      setIsPremium(true);
      setPremiumStatus({ isPremium: true, isLifetime: true });
      return;
    }

    // NOTE: Superwall subscription check temporarily disabled
    // Check Superwall subscription status first (iOS in-app purchases)
    // if (subscriptionStatus?.status === 'ACTIVE') {
    //   console.log('[Premium] Superwall subscription active');
    //   setIsPremium(true);
    //   setPremiumStatus({
    //     isPremium: true,
    //     isLifetime: false,
    //   });
    //   return;
    // }

    // Check offline promo code redemption
    try {
      const expiryDateStr = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
      if (expiryDateStr) {
        const expiryDate = new Date(expiryDateStr);
        const now = new Date();
        
        if (expiryDate > now) {
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log('[Premium] Offline premium active, days remaining:', daysRemaining);
          setIsPremium(true);
          setPremiumStatus({
            isPremium: true,
            expiresAt: expiryDate.toISOString(),
            daysRemaining,
            isLifetime: false,
          });
          return;
        } else {
          console.log('[Premium] Offline premium expired');
          await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
        }
      }
    } catch (error) {
      console.error('[Premium] Error checking offline premium:', error);
    }

    // Check premium status from backend
    try {
      if (user?.email) {
        console.log('[Premium] Checking backend premium status for:', user.email);
        
        const { authenticatedGet, BACKEND_URL } = await import('@/utils/api');
        
        if (!BACKEND_URL) {
          console.warn('[Premium] Backend URL not configured, defaulting to non-premium');
          setIsPremium(false);
          setPremiumStatus({ isPremium: false });
          return;
        }

        const data = await authenticatedGet<{ 
          isPremium: boolean; 
          expiresAt?: string;
          daysRemaining?: number;
          isLifetime?: boolean;
        }>('/api/premium/status');
        
        console.log('[Premium] Backend status received:', data);
        setIsPremium(data.isPremium || false);
        setPremiumStatus(data);
      } else {
        console.log('[Premium] No user email, defaulting to non-premium');
        setIsPremium(false);
        setPremiumStatus({ isPremium: false });
      }
    } catch (error) {
      console.error('[Premium] Error checking backend premium status:', error);
      setIsPremium(false);
      setPremiumStatus({ isPremium: false });
    }
  };

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    console.log('[Premium] Attempting to redeem promo code:', code);
    
    // Check if code is valid (case-insensitive)
    if (code.toUpperCase() !== VALID_PROMO_CODE) {
      console.log('[Premium] Invalid promo code');
      return {
        success: false,
        message: 'Ungültiger Code',
      };
    }

    try {
      // Calculate expiry date (1 month from now)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      // Store expiry date in AsyncStorage for offline access
      await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiryDate.toISOString());
      
      console.log('[Premium] Promo code redeemed successfully, expires:', expiryDate.toISOString());
      
      // Update premium status
      const daysRemaining = 30;
      setIsPremium(true);
      setPremiumStatus({
        isPremium: true,
        expiresAt: expiryDate.toISOString(),
        daysRemaining,
        isLifetime: false,
      });
      
      return {
        success: true,
        message: 'Premium für 1 Monat aktiviert!',
      };
    } catch (error) {
      console.error('[Premium] Error redeeming promo code:', error);
      return {
        success: false,
        message: 'Fehler beim Einlösen des Codes',
      };
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
    redeemPromoCode,
  };
}
