
import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { supabase } from '@/app/integrations/supabase/client';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SjGIwJ21i7rapycZqJxQvGYXimOlMajbfcaRvpR16N2hzEu9FwhUdVcY0rA1Q8BYxm6ejh5aKXBPz3o3K76000b5YYuZ7';

interface StripePaymentSheetProps {
  type: 'onetime' | 'monthly';
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const processPayment = async (
    type: 'onetime' | 'monthly',
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      setLoading(true);
      console.log('[Stripe] Starting payment process, type:', type);

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('[Stripe] No session found');
        onError('You must be signed in to make a payment');
        return;
      }

      console.log('[Stripe] Calling Supabase Edge Function to create payment intent...');

      // Call Supabase Edge Function to create payment intent
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          type,
          platform: Platform.OS,
        },
      });

      if (error) {
        console.error('[Stripe] Error creating payment intent:', error);
        onError(error.message || 'Failed to create payment');
        return;
      }

      if (!data?.clientSecret) {
        console.error('[Stripe] No client secret returned');
        onError('Failed to initialize payment');
        return;
      }

      console.log('[Stripe] Payment intent created, initializing payment sheet...');

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'EASY BUDGET',
        paymentIntentClientSecret: data.clientSecret,
        allowsDelayedPaymentMethods: false,
        applePay: Platform.OS === 'ios' ? {
          merchantCountryCode: 'CH',
        } : undefined,
        googlePay: Platform.OS === 'android' ? {
          merchantCountryCode: 'CH',
          testEnv: true,
        } : undefined,
      });

      if (initError) {
        console.error('[Stripe] Error initializing payment sheet:', initError);
        onError(initError.message || 'Failed to initialize payment');
        return;
      }

      console.log('[Stripe] Presenting payment sheet...');

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('[Stripe] Error presenting payment sheet:', presentError);
        if (presentError.code !== 'Canceled') {
          onError(presentError.message || 'Payment failed');
        }
        return;
      }

      console.log('[Stripe] Payment successful!');
      onSuccess();
    } catch (error: any) {
      console.error('[Stripe] Payment error:', error);
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return { processPayment, loading };
}

export function StripePaymentProvider({ children }: { children: React.ReactNode }) {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProvider>
  );
}
