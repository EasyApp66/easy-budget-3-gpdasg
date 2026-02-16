
import React from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';

interface TrialWelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  trialDaysRemaining: number;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#BFFE84',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  highlight: {
    color: '#BFFE84',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  daysContainer: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#BFFE84',
    marginBottom: 8,
  },
  daysText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresContainer: {
    marginBottom: 32,
    width: '100%',
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
  button: {
    backgroundColor: '#BFFE84',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});

export function TrialWelcomeModal({ visible, onClose, trialDaysRemaining }: TrialWelcomeModalProps) {
  const { t } = useLanguage();
  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1);
    });
    onClose();
  };

  const trialDaysText = trialDaysRemaining === 1 ? 'Tag' : 'Tage';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="gift.fill"
              android_material_icon_name="card-giftcard"
              size={40}
              color="#000"
            />
          </View>

          <Text style={styles.title}>
            Willkommen bei{'\n'}
            <Text style={styles.highlight}>EASY BUDGET!</Text>
          </Text>

          <Text style={styles.subtitle}>
            Als neuer Nutzer erhältst du Premium kostenlos für 2 Wochen!
          </Text>

          <View style={styles.daysContainer}>
            <Text style={styles.daysNumber}>{trialDaysRemaining}</Text>
            <Text style={styles.daysText}>{trialDaysText} Premium verbleibend</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#BFFE84"
              />
              <Text style={styles.featureText}>Unbegrenzte Ausgaben</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#BFFE84"
              />
              <Text style={styles.featureText}>Unbegrenzte Monate</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#BFFE84"
              />
              <Text style={styles.featureText}>Unbegrenzte Abos</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#BFFE84"
              />
              <Text style={styles.featureText}>Alle Premium-Features</Text>
            </View>
          </View>

          <Pressable onPress={handlePress}>
            <Animated.View style={[styles.button, buttonStyle]}>
              <Text style={styles.buttonText}>Los geht's! 🚀</Text>
            </Animated.View>
          </Pressable>

          <Text style={styles.disclaimer}>
            Deine Testversion endet automatisch nach {trialDaysRemaining} {trialDaysText}.{'\n'}
            Keine Kreditkarte erforderlich.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
