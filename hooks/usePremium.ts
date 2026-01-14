
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
