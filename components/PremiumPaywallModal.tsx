
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import React from 'react';

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
          <Text style={styles.title}>Premium Kaufen</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Erhalte unbegrenzte App-Funktionen:
          </Text>

          {/* Features List */}
          <View style={styles.featureList}>
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

          {/* One-time Payment Card */}
          <Animated.View style={onetimeAnimatedStyle}>
            <Pressable
              onPress={() => handlePress(() => onPurchase('onetime'), onetimeScale)}
              style={styles.paymentCard}
            >
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Einmalige Zahlung</Text>
                <Text style={styles.paymentPrice}>CHF 10.00</Text>
              </View>
              <View style={styles.payButton}>
                <Text style={styles.payButtonText}>Bezahlen</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <Text style={styles.divider}>ODER</Text>

          {/* Monthly Payment Card */}
          <Animated.View style={monthlyAnimatedStyle}>
            <Pressable
              onPress={() => handlePress(() => onPurchase('monthly'), monthlyScale)}
              style={styles.paymentCard}
            >
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Monatliches Abo</Text>
                <Text style={styles.paymentPrice}>CHF 1.00/Monat</Text>
              </View>
              <View style={styles.payButton}>
                <Text style={styles.payButtonText}>Bezahlen</Text>
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
