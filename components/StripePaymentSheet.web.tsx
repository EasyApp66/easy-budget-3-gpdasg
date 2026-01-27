
import { useState } from 'react';
import { Alert } from 'react-native';

// Web fallback - Stripe native SDK is not supported on web
export function useStripePayment() {
  const [loading, setLoading] = useState(false);

  const processPayment = async (
    type: 'onetime' | 'monthly',
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    console.log('[Stripe Web] Payment not supported on web platform');
    Alert.alert(
      'Payment Not Available',
      'Stripe payments are only available on iOS and Android. Please use the mobile app to make purchases.',
      [{ text: 'OK' }]
    );
    onError('Stripe payments are not supported on web');
  };

  return { processPayment, loading };
}

export function StripePaymentProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
