
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'mirosnic.ivan@icloud.com';

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Check if user is admin or has premium
    if (user?.email === ADMIN_EMAIL) {
      setIsPremium(true);
    } else {
      // TODO: Backend Integration - Check actual premium status from backend
      setIsPremium(false);
    }
  }, [user]);

  const checkLimit = (
    expenseCount: number,
    monthCount: number,
    subscriptionCount: number
  ): boolean => {
    if (isPremium) return false;
    
    return (
      expenseCount > 8 ||
      monthCount > 2 ||
      subscriptionCount > 5
    );
  };

  return {
    isPremium,
    checkLimit,
    showPaywall,
    setShowPaywall,
  };
}
