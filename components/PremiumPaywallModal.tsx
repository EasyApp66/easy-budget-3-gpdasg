
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { usePlacement } from 'expo-superwall';

interface PremiumPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (type: 'onetime' | 'monthly') => void;
}

export function PremiumPaywallModal({
  visible,
  onClose,
  onPurchase,
}: PremiumPaywallModalProps) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const onetimeScale = useSharedValue(1);
  const monthlyScale = useSharedValue(1);
  const closeScale = useSharedValue(1);

  const onetimeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: onetimeScale.value }],
  }));

  const monthlyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: monthlyScale.value }],
  }));

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));

  const { registerPlacement } = usePlacement({
    onError: (error) => {
      console.error('[Superwall] Paywall error:', error);
      setIsProcessing(false);
      Alert.alert(
        t.premium.errorTitle || 'Error',
        t.premium.errorMessage || 'Failed to process purchase. Please try again.',
        [{ text: 'OK' }]
      );
    },
    onPresent: (info) => {
      console.log('[Superwall] Paywall presented:', info);
    },
    onDismiss: (info, result) => {
      console.log('[Superwall] Paywall dismissed:', info, 'Result:', result);
      setIsProcessing(false);
      
      if (result === 'purchased' || result === 'restored') {
        console.log('[Superwall] Purchase successful!');
        Alert.alert(
          t.premium.successTitle || 'Success',
          t.premium.successMessage || 'Premium activated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
              },
            },
          ]
        );
      }
    },
  });

  const handlePress = (
    callback: () => void,
    scaleValue: Animated.SharedValue<number>
  ) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scaleValue.value = withSpring(0.92, { damping: 10, stiffness: 400 });
    setTimeout(() => {
      scaleValue.value = withSpring(1, { damping: 10, stiffness: 400 });
      callback();
    }, 100);
  };

  const handlePurchase = async (type: 'onetime' | 'monthly') => {
    console.log('[Superwall] ========================================');
    console.log('[Superwall] Initiating purchase:', type);
    console.log('[Superwall] Platform:', Platform.OS);
    
    if (isProcessing) {
      console.log('[Superwall] Purchase already in progress, ignoring');
      return;
    }

    setIsProcessing(true);

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const placementName = type === 'onetime' ? 'premium_onetime' : 'premium_monthly';
      console.log('[Superwall] Registering placement:', placementName);
      
      await registerPlacement({
        placement: placementName,
        feature: () => {
          console.log('[Superwall] ✅ Feature unlocked! Purchase successful');
          setIsProcessing(false);
          onPurchase(type);
        },
      });
      
      console.log('[Superwall] Placement registration completed');
    } catch (error: any) {
      console.error('[Superwall] ❌ Purchase error:', error);
      console.error('[Superwall] Error details:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
      });
      setIsProcessing(false);
      
      const errorMessage = error?.message || t.premium.errorMessage || 'Failed to process purchase. Please try again.';
      
      Alert.alert(
        t.premium.errorTitle || 'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      console.log('[Superwall] ========================================');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Animated.View style={[styles.closeButtonContainer, closeAnimatedStyle]}>
            <Pressable
              onPress={() => handlePress(onClose, closeScale)}
              style={styles.closeButton}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={18}
                color="#000000"
              />
            </Pressable>
          </Animated.View>

          {/* Star Icon */}
          <View style={styles.starContainer}>
            <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={36} color="#BFFE84" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t.premium.title}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{t.premium.subtitle}</Text>

          {/* Features List */}
          <View style={styles.featureList}>
            {t.premium.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* One-time Payment Card */}
          <Animated.View style={onetimeAnimatedStyle}>
            <Pressable
              onPress={() => handlePress(() => handlePurchase('onetime'), onetimeScale)}
              style={styles.paymentCard}
              disabled={isProcessing}
            >
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{t.premium.oneTime}</Text>
                <Text style={styles.paymentPrice}>{t.premium.oneTimePrice}</Text>
              </View>
              <View style={[styles.payButton, isProcessing && styles.payButtonDisabled]}>
                <Text style={styles.payButtonText}>
                  {isProcessing ? t.premium.processing || 'Processing...' : t.premium.pay}
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <Text style={styles.divider}>{t.premium.or}</Text>

          {/* Monthly Payment Card */}
          <Animated.View style={monthlyAnimatedStyle}>
            <Pressable
              onPress={() => handlePress(() => handlePurchase('monthly'), monthlyScale)}
              style={styles.paymentCard}
              disabled={isProcessing}
            >
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{t.premium.monthly}</Text>
                <Text style={styles.paymentPrice}>{t.premium.monthlyPrice}</Text>
              </View>
              <View style={[styles.payButton, isProcessing && styles.payButtonDisabled]}>
                <Text style={styles.payButtonText}>
                  {isProcessing ? t.premium.processing || 'Processing...' : t.premium.pay}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: '#232323',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    position: 'relative',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  featureList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#BFFE84',
    marginRight: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  paymentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BFFE84',
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  paymentInfo: {
    marginBottom: 9,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: 0.4,
  },
  paymentPrice: {
    fontSize: 19,
    fontWeight: '700',
    color: '#BFFE84',
    letterSpacing: 0.5,
  },
  payButton: {
    backgroundColor: '#BFFE84',
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.4,
  },
  divider: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginVertical: 7,
    letterSpacing: 1,
  },
});
