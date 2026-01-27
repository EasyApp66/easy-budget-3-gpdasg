
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStripePayment } from '@/components/StripePaymentSheet';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface PremiumPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (type: 'onetime' | 'monthly') => void;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '600',
  },
  pricingContainer: {
    gap: 16,
  },
  priceButton: {
    backgroundColor: '#BFFE84',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  monthlyButton: {
    backgroundColor: '#333',
  },
  priceType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  monthlyPriceType: {
    color: '#BFFE84',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  monthlyPriceAmount: {
    color: '#FFFFFF',
  },
  orText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#BFFE84',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
});

export function PremiumPaywallModal({ visible, onClose, onPurchase }: PremiumPaywallModalProps) {
  const { t } = useLanguage();
  const { processPayment, loading } = useStripePayment();
  const { checkPremiumStatus } = useSupabaseAuth();
  const [processingType, setProcessingType] = useState<'onetime' | 'monthly' | null>(null);

  const onetimeScale = useSharedValue(1);
  const monthlyScale = useSharedValue(1);

  const onetimeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: onetimeScale.value }],
  }));

  const monthlyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: monthlyScale.value }],
  }));

  const handlePress = (callback: () => void, scaleValue: Animated.SharedValue<number>) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    scaleValue.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      scaleValue.value = withSpring(1);
    });
    callback();
  };

  const handlePurchase = async (type: 'onetime' | 'monthly') => {
    console.log('[PremiumModal] Starting purchase, type:', type);
    setProcessingType(type);

    await processPayment(
      type,
      async () => {
        console.log('[PremiumModal] Payment successful');
        
        // Refresh premium status
        await checkPremiumStatus();
        
        Alert.alert(
          t.premium.successTitle,
          t.premium.successMessage,
          [
            {
              text: t.common.ok,
              onPress: () => {
                setProcessingType(null);
                onClose();
                onPurchase(type);
              },
            },
          ]
        );
      },
      (error) => {
        console.error('[PremiumModal] Payment error:', error);
        setProcessingType(null);
        
        Alert.alert(
          t.premium.errorTitle,
          error || t.premium.errorMessage
        );
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onClose();
            }}
          >
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={28}
              color="#666"
            />
          </Pressable>

          <Text style={styles.title}>{t.premium.title}</Text>
          <Text style={styles.subtitle}>{t.premium.subtitle}</Text>

          <View style={styles.featuresContainer}>
            {t.premium.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color="#BFFE84"
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {loading || processingType ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#BFFE84" />
              <Text style={styles.loadingText}>{t.premium.processing}</Text>
            </View>
          ) : (
            <View style={styles.pricingContainer}>
              <Pressable
                onPress={() => handlePress(() => handlePurchase('onetime'), onetimeScale)}
                disabled={loading}
              >
                <Animated.View style={[styles.priceButton, onetimeStyle]}>
                  <Text style={styles.priceType}>{t.premium.oneTime}</Text>
                  <Text style={styles.priceAmount}>{t.premium.oneTimePrice}</Text>
                </Animated.View>
              </Pressable>

              <Text style={styles.orText}>{t.premium.or}</Text>

              <Pressable
                onPress={() => handlePress(() => handlePurchase('monthly'), monthlyScale)}
                disabled={loading}
              >
                <Animated.View style={[styles.priceButton, styles.monthlyButton, monthlyStyle]}>
                  <Text style={[styles.priceType, styles.monthlyPriceType]}>
                    {t.premium.monthly}
                  </Text>
                  <Text style={[styles.priceAmount, styles.monthlyPriceAmount]}>
                    {t.premium.monthlyPrice}
                  </Text>
                </Animated.View>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
