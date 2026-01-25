
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_EMAIL = 'mirosnic.ivan@icloud.com';
const PREMIUM_EXPIRY_KEY = '@easy_budget_premium_expiry';
const PREMIUM_CODE_KEY = '@easy_budget_premium_code';
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
    console.log('[Premium] ========================================');
    console.log('[Premium] Checking premium status');
    console.log('[Premium] User:', user?.email);
    
    // 1. FIRST: Check if user is admin (highest priority)
    if (user?.email === ADMIN_EMAIL) {
      console.log('[Premium] ✅ Admin user detected, granting premium access');
      setIsPremium(true);
      setPremiumStatus({ isPremium: true, isLifetime: true });
      console.log('[Premium] ========================================');
      return;
    }

    // 2. SECOND: Check offline promo code redemption (works offline!)
    try {
      const expiryDateStr = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
      const redeemedCode = await AsyncStorage.getItem(PREMIUM_CODE_KEY);
      
      console.log('[Premium] Offline storage check:');
      console.log('[Premium] - Expiry date:', expiryDateStr);
      console.log('[Premium] - Redeemed code:', redeemedCode);
      
      if (expiryDateStr && redeemedCode) {
        const expiryDate = new Date(expiryDateStr);
        const now = new Date();
        
        console.log('[Premium] - Expiry date parsed:', expiryDate.toISOString());
        console.log('[Premium] - Current date:', now.toISOString());
        console.log('[Premium] - Is expired?', expiryDate <= now);
        
        if (expiryDate > now) {
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log('[Premium] ✅ Offline premium active! Days remaining:', daysRemaining);
          setIsPremium(true);
          setPremiumStatus({
            isPremium: true,
            expiresAt: expiryDate.toISOString(),
            daysRemaining,
            isLifetime: false,
          });
          console.log('[Premium] ========================================');
          return;
        } else {
          console.log('[Premium] ⚠️  Offline premium expired, cleaning up');
          await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
          await AsyncStorage.removeItem(PREMIUM_CODE_KEY);
        }
      } else {
        console.log('[Premium] No offline premium found');
      }
    } catch (error) {
      console.error('[Premium] Error checking offline premium:', error);
    }

    // 3. THIRD: Check premium status from backend (requires internet)
    try {
      if (user?.email) {
        console.log('[Premium] Checking backend premium status for:', user.email);
        
        const { authenticatedGet, BACKEND_URL } = await import('@/utils/api');
        
        if (!BACKEND_URL) {
          console.warn('[Premium] Backend URL not configured, defaulting to non-premium');
          setIsPremium(false);
          setPremiumStatus({ isPremium: false });
          console.log('[Premium] ========================================');
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
    
    console.log('[Premium] ========================================');
  };

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    console.log('[Premium] ========================================');
    console.log('[Premium] Attempting to redeem promo code:', code);
    
    // Check if code is valid (case-insensitive)
    if (code.toUpperCase() !== VALID_PROMO_CODE) {
      console.log('[Premium] ❌ Invalid promo code');
      console.log('[Premium] ========================================');
      return {
        success: false,
        message: 'Ungültiger Code',
      };
    }

    try {
      // Calculate expiry date (1 month from now)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      console.log('[Premium] Storing offline premium:');
      console.log('[Premium] - Code:', code.toUpperCase());
      console.log('[Premium] - Expires:', expiryDate.toISOString());
      
      // Store expiry date AND code in AsyncStorage for offline access
      await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiryDate.toISOString());
      await AsyncStorage.setItem(PREMIUM_CODE_KEY, code.toUpperCase());
      
      console.log('[Premium] ✅ Promo code redeemed successfully (offline)');
      
      // Update premium status immediately
      const daysRemaining = 30;
      setIsPremium(true);
      setPremiumStatus({
        isPremium: true,
        expiresAt: expiryDate.toISOString(),
        daysRemaining,
        isLifetime: false,
      });
      
      console.log('[Premium] Premium status updated:', {
        isPremium: true,
        daysRemaining,
        expiresAt: expiryDate.toISOString(),
      });
      console.log('[Premium] ========================================');
      
      return {
        success: true,
        message: 'Premium für 1 Monat aktiviert!',
      };
    } catch (error) {
      console.error('[Premium] ❌ Error redeeming promo code:', error);
      console.log('[Premium] ========================================');
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
    console.log('[Premium] Checking limits:', {
      isPremium,
      expenseCount,
      monthCount,
      subscriptionCount,
      userEmail: user?.email,
    });
    
    // Admin has unlimited access
    if (user?.email === ADMIN_EMAIL) {
      console.log('[Premium] Admin user - no limits');
      return false;
    }
    
    // Premium users have unlimited access
    if (isPremium) {
      console.log('[Premium] Premium user - no limits');
      return false;
    }
    
    // Free users have limits
    const hasReachedLimit = (
      expenseCount > 8 ||
      monthCount > 2 ||
      subscriptionCount > 5
    );
    
    console.log('[Premium] Free user - limit reached:', hasReachedLimit);
    return hasReachedLimit;
  };

  return {
    isPremium,
    premiumStatus,
    checkLimit,
    checkPremiumStatus,
    redeemPromoCode,
  };
}
