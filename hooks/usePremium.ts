
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_EMAIL = 'mirosnic.ivan@icloud.com';
const PREMIUM_EXPIRY_KEY = '@easy_budget_premium_expiry';
const VALID_PROMO_CODE = 'EASY2';

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
    console.log('[Premium] Checking premium status');
    
    // Check if user is admin
    if (user?.email === ADMIN_EMAIL) {
      console.log('[Premium] Admin user detected, granting premium access');
      setIsPremium(true);
      setPremiumStatus({ isPremium: true, isLifetime: true });
      return;
    }

    // Check offline promo code redemption first
    try {
      const expiryDateStr = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
      if (expiryDateStr) {
        const expiryDate = new Date(expiryDateStr);
        const now = new Date();
        
        if (expiryDate > now) {
          // Premium is still valid
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
          // Premium expired, remove from storage
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
      // If endpoint doesn't exist yet (404), default to non-premium
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
