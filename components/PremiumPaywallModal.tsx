
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';

const colors = {
  black: '#000000',
  white: '#FFFFFF',
  neonGreen: '#BFFE84',
  darkGray: '#232323',
  red: '#C43C3E',
};

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

  const handlePress = (callback: () => void, scaleValue: Animated.SharedValue<number>) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    scaleValue.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    setTimeout(() => {
      scaleValue.value = withSpring(1, { damping: 10, stiffness: 400 });
      callback();
    }, 100);
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
          <Pressable
            onPress={() => handlePress(onClose, closeScale)}
            style={styles.closeButton}
          >
            <Animated.View style={closeAnimatedStyle}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color="#FFFFFF"
              />
            </Animated.View>
          </Pressable>

          {/* Star Icon */}
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={60}
              color="#BFFE84"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Premium Kaufen</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Erhalte unbegrenzte App-Funktionen:
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>Unbegrenzte Abo Counter</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>Unbegrenzte Ausgabenliste</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>Unbegrenzte Monate</Text>
            </View>
          </View>

          {/* One-time Payment */}
          <View style={styles.paymentOption}>
            <Text style={styles.paymentLabel}>Einmalige Zahlung</Text>
            <Text style={styles.paymentPrice}>CHF 10.00</Text>
            <Pressable
              onPress={() => handlePress(() => onPurchase('onetime'), onetimeScale)}
            >
              <Animated.View style={[styles.payButton, onetimeAnimatedStyle]}>
                <Text style={styles.payButtonText}>Bezahlen</Text>
              </Animated.View>
            </Pressable>
          </View>

          {/* OR Divider */}
          <Text style={styles.orText}>ODER</Text>

          {/* Monthly Subscription */}
          <View style={styles.paymentOption}>
            <Text style={styles.paymentLabel}>Monatliches Abo</Text>
            <Text style={styles.paymentPrice}>CHF 1.00/Monat</Text>
            <Pressable
              onPress={() => handlePress(() => onPurchase('monthly'), monthlyScale)}
            >
              <Animated.View style={[styles.payButton, monthlyAnimatedStyle]}>
                <Text style={styles.payButtonText}>Bezahlen</Text>
              </Animated.View>
            </Pressable>
          </View>
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
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BFFE84',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  paymentOption: {
    backgroundColor: '#000000',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFFE84',
    padding: 20,
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  paymentPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#BFFE84',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#BFFE84',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  orText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
    marginVertical: 8,
  },
});
