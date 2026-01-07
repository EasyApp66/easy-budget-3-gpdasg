
import React from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
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

interface PremiumPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (type: 'onetime' | 'monthly') => void;
}

export function PremiumPaywallModal({ visible, onClose, onPurchase }: PremiumPaywallModalProps) {
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
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scaleValue.value = withSpring(0.92, { damping: 10, stiffness: 400 }, () => {
      scaleValue.value = withSpring(1, { damping: 10, stiffness: 400 });
    });
    callback();
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
          <Animated.View style={[styles.closeButton, closeAnimatedStyle]}>
            <Pressable onPress={() => handlePress(onClose, closeScale)}>
              <IconSymbol name="xmark" size={22} color="#000" />
            </Pressable>
          </Animated.View>

          {/* Star Icon */}
          <View style={styles.starIcon}>
            <IconSymbol name="star.fill" size={42} color="#BFFE84" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Premium Kaufen</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Erhalte unbegrenzte App-{'\n'}Funktionen:</Text>

          {/* Features List */}
          <View style={styles.featuresList}>
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
          <Animated.View style={[styles.paymentCard, onetimeAnimatedStyle]}>
            <Text style={styles.paymentTitle}>Einmalige Zahlung</Text>
            <Text style={styles.paymentPrice}>CHF 10.00</Text>
            <Pressable
              style={styles.paymentButton}
              onPress={() => handlePress(() => onPurchase('onetime'), onetimeScale)}
            >
              <Text style={styles.paymentButtonText}>Bezahlen</Text>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ODER</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Monthly Subscription */}
          <Animated.View style={[styles.paymentCard, monthlyAnimatedStyle]}>
            <Text style={styles.paymentTitle}>Monatliches Abo</Text>
            <Text style={styles.paymentPrice}>CHF 1.00/Monat</Text>
            <Pressable
              style={styles.paymentButton}
              onPress={() => handlePress(() => onPurchase('monthly'), monthlyScale)}
            >
              <Text style={styles.paymentButtonText}>Bezahlen</Text>
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
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#232323',
    borderRadius: 20,
    width: '88%',
    maxWidth: 380,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  starIcon: {
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 21,
  },
  featuresList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#BFFE84',
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  paymentCard: {
    backgroundColor: '#000000',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#BFFE84',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  paymentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  paymentPrice: {
    fontSize: 19,
    fontWeight: '800',
    color: '#BFFE84',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  paymentButton: {
    backgroundColor: '#BFFE84',
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#444444',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
    marginHorizontal: 10,
    letterSpacing: 1,
  },
});
