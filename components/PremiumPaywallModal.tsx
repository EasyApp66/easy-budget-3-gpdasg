
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useLanguage } from '@/contexts/LanguageContext';
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
  platformWarning: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  platformWarningText: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export function PremiumPaywallModal({ visible, onClose, onPurchase }: PremiumPaywallModalProps) {
  const { t } = useLanguage();
  const { checkPremiumStatus } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
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
    
    // Check if platform is iOS
    if (Platform.OS !== 'ios') {
      Alert.alert(
        'Apple Pay Only',
        'Premium purchases are only available on iOS devices using Apple Pay. Please use an iPhone or iPad to upgrade to Premium.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    setProcessingType(type);

    try {
      // TODO: Implement Apple Pay integration via Supabase Edge Function
      // For now, show a message that payment is being processed
      console.log('[PremiumModal] Processing Apple Pay payment...');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh premium status
      await checkPremiumStatus();
      
      Alert.alert(
        t.premium.successTitle,
        t.premium.successMessage,
        [
          {
            text: t.common.ok,
            onPress: () => {
              setLoading(false);
              setProcessingType(null);
              onClose();
              onPurchase(type);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[PremiumModal] Payment error:', error);
      setLoading(false);
      setProcessingType(null);
      
      Alert.alert(
        t.premium.errorTitle,
        error?.message || t.premium.errorMessage
      );
    }
  };

  const isIOS = Platform.OS === 'ios';

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
            <>
              <View style={styles.pricingContainer}>
                <Pressable
                  onPress={() => handlePress(() => handlePurchase('onetime'), onetimeScale)}
                  disabled={loading || !isIOS}
                >
                  <Animated.View style={[styles.priceButton, onetimeStyle, !isIOS && { opacity: 0.5 }]}>
                    <Text style={styles.priceType}>{t.premium.oneTime}</Text>
                    <Text style={styles.priceAmount}>{t.premium.oneTimePrice}</Text>
                  </Animated.View>
                </Pressable>

                <Text style={styles.orText}>{t.premium.or}</Text>

                <Pressable
                  onPress={() => handlePress(() => handlePurchase('monthly'), monthlyScale)}
                  disabled={loading || !isIOS}
                >
                  <Animated.View style={[styles.priceButton, styles.monthlyButton, monthlyStyle, !isIOS && { opacity: 0.5 }]}>
                    <Text style={[styles.priceType, styles.monthlyPriceType]}>
                      {t.premium.monthly}
                    </Text>
                    <Text style={[styles.priceAmount, styles.monthlyPriceAmount]}>
                      {t.premium.monthlyPrice}
                    </Text>
                  </Animated.View>
                </Pressable>
              </View>

              {!isIOS && (
                <View style={styles.platformWarning}>
                  <Text style={styles.platformWarningText}>
                    ⚠️ Apple Pay is only available on iOS devices. Please use an iPhone or iPad to purchase Premium.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
