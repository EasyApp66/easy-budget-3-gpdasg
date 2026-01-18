
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/styles/commonStyles';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t } = useLanguage();
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState({ title: '', content: '' });

  // Animated blur circle - FASTER, BRIGHTER, MORE BLUR
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    console.log('[Welcome] Starting animated blur circle - faster and brighter');
    // Horizontal movement - FASTER (4 seconds instead of 8)
    translateX.value = withRepeat(
      withTiming(150, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    // Vertical movement - FASTER (5 seconds instead of 10)
    translateY.value = withRepeat(
      withTiming(200, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    // Pulsing scale effect for more dynamic movement
    scale.value = withRepeat(
      withTiming(1.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const blurCircleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const AnimatedButton = ({
    title,
    onPress,
    backgroundColor,
    textColor,
    iconName,
  }: {
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    iconName?: string;
  }) => {
    const buttonScale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
    }));

    return (
      <Pressable
        onPressIn={() => {
          buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={() => {
          buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.button,
            { backgroundColor },
            animatedStyle,
          ]}
        >
          {iconName && (
            <MaterialIcons name={iconName as any} size={20} color={textColor} style={styles.buttonIcon} />
          )}
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  const handleEmailPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Welcome] User tapped email login button');
    router.push('/login');
  };

  const handleApplePress = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Welcome] User tapped Apple sign in button');
    try {
      await signInWithApple();
      router.replace('/(tabs)/budget');
    } catch (error) {
      console.error('Apple sign in error:', error);
    }
  };

  const handleGooglePress = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Welcome] User tapped Google sign in button');
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/budget');
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleLegalPress = (type: 'terms' | 'privacy' | 'agb') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[Welcome] User tapped ${type} link - opening popup with full legal text`);
    
    let title = '';
    let content = '';
    
    if (type === 'terms') {
      title = t.legal.termsTitle;
      content = t.legal.termsContent;
    } else if (type === 'privacy') {
      title = t.legal.privacyTitle;
      content = t.legal.privacyContent;
    } else if (type === 'agb') {
      title = t.legal.agbTitle;
      content = t.legal.agbContent;
    }
    
    setLegalModalContent({ title, content });
    setLegalModalVisible(true);
  };

  const closeLegalModal = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Welcome] Closing legal modal');
    setLegalModalVisible(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Animated blur green circle background - BRIGHTER, MORE BLUR, FASTER */}
        <Animated.View style={[styles.blurCircle, blurCircleStyle]}>
          <BlurView intensity={100} style={styles.blurView} />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.textBlock}>
            {/* SMALLER "Hallo! ich bin" text */}
            <Text style={styles.title}>
              {t.welcome.greeting} <Text style={styles.highlight}>{t.welcome.appName}</Text>
            </Text>
            <Text style={styles.subtitle}>
              {t.welcome.trackBudget} <Text style={styles.highlight}>{t.welcome.budget}</Text>
            </Text>
            <Text style={styles.subtitle}>
              {t.welcome.trackSubs} <Text style={styles.highlight}>{t.welcome.subs}</Text>
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title={t.welcome.continueEmail}
              onPress={handleEmailPress}
              backgroundColor={colors.neonGreen}
              textColor={colors.black}
              iconName="email"
            />
            <AnimatedButton
              title={t.welcome.continueApple}
              onPress={handleApplePress}
              backgroundColor={colors.white}
              textColor={colors.black}
              iconName="apple"
            />
            <AnimatedButton
              title={t.welcome.continueGoogle}
              onPress={handleGooglePress}
              backgroundColor={colors.white}
              textColor={colors.black}
              iconName="login"
            />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footer}>
              Indem du fortfährst, bestätigst du, dass du die{' '}
              <Text style={styles.footerLink} onPress={() => handleLegalPress('terms')}>
                Nutzungsbedingungen
              </Text>
              {' '}und die{' '}
              <Text style={styles.footerLink} onPress={() => handleLegalPress('privacy')}>
                Datenschutzerklärung
              </Text>
              {' '}und die{' '}
              <Text style={styles.footerLink} onPress={() => handleLegalPress('agb')}>
                AGBs
              </Text>
              {' '}gelesen hast.
            </Text>
          </View>
        </View>

        {/* Legal Modal - FULL TEXT VISIBLE ON iOS */}
        <Modal
          visible={legalModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeLegalModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{legalModalContent.title}</Text>
                <Pressable onPress={closeLegalModal} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={colors.white} />
                </Pressable>
              </View>
              
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.modalText}>{legalModalContent.content}</Text>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  onPress={closeLegalModal}
                  style={styles.modalButton}
                  onPressIn={() => {
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>{t.common.ok}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  blurCircle: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    // BRIGHTER green with higher opacity
    backgroundColor: colors.neonGreen,
    opacity: 0.5,
  },
  blurView: {
    width: '100%',
    height: '100%',
    borderRadius: 175,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  textBlock: {
    marginBottom: 40,
  },
  // SMALLER "Hallo! ich bin" text (was 32, now 26)
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'left',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 43,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'left',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  highlight: {
    color: colors.neonGreen,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerContainer: {
    paddingHorizontal: 8,
  },
  footer: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  footerLink: {
    color: colors.neonGreen,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  modalText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    opacity: 0.9,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: 0.3,
  },
});
