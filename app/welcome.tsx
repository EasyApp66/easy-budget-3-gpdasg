
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/styles/commonStyles';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t } = useLanguage();
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const AnimatedButton = ({
    title,
    onPress,
    backgroundColor,
    textColor,
    iconName,
    disabled,
  }: {
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    iconName?: string;
    disabled?: boolean;
  }) => {
    const buttonScale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
      opacity: disabled ? 0.5 : 1,
    }));

    return (
      <Pressable
        onPressIn={() => {
          if (!disabled) {
            buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }}
        onPressOut={() => {
          if (!disabled) {
            buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
          }
        }}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
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
    console.log('[Welcome] User tapped Apple sign in button - starting OAuth flow');
    setIsLoading(true);
    
    try {
      console.log('[Welcome] Calling signInWithApple()...');
      await signInWithApple();
      console.log('[Welcome] Apple sign in successful, navigating to budget screen');
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      console.error('[Welcome] Apple sign in error:', error);
      console.error('[Welcome] Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      
      const errorMessage = error?.message || 'Failed to sign in with Apple. Please try again.';
      Alert.alert(
        'Sign In Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Welcome] User tapped Google sign in button - starting OAuth flow');
    setIsLoading(true);
    
    try {
      console.log('[Welcome] Calling signInWithGoogle()...');
      await signInWithGoogle();
      console.log('[Welcome] Google sign in successful, navigating to budget screen');
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      console.error('[Welcome] Google sign in error:', error);
      console.error('[Welcome] Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      
      const errorMessage = error?.message || 'Failed to sign in with Google. Please try again.';
      Alert.alert(
        'Sign In Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegalPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Welcome] User tapped legal link - opening full legal modal');
    setLegalModalVisible(true);
  };

  const closeLegalModal = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Welcome] Closing legal modal');
    setLegalModalVisible(false);
  };

  const loadingText = isLoading ? 'Signing in...' : '';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.textBlock}>
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

          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title={t.welcome.continueEmail}
              onPress={handleEmailPress}
              backgroundColor={colors.neonGreen}
              textColor={colors.black}
              iconName="email"
              disabled={isLoading}
            />
            <AnimatedButton
              title={t.welcome.continueApple}
              onPress={handleApplePress}
              backgroundColor={colors.white}
              textColor={colors.black}
              iconName="apple"
              disabled={isLoading}
            />
            <AnimatedButton
              title={t.welcome.continueGoogle}
              onPress={handleGooglePress}
              backgroundColor={colors.white}
              textColor={colors.black}
              iconName="login"
              disabled={isLoading}
            />
          </View>

          <View style={styles.footerContainer}>
            <Pressable onPress={handleLegalPress}>
              <Text style={styles.footer}>
                {t.welcome.legalFooter}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Legal Modal - Full Legal Documents */}
        <Modal
          visible={legalModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeLegalModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rechtliches</Text>
                <Pressable onPress={closeLegalModal} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={colors.white} />
                </Pressable>
              </View>
              
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {/* Terms of Use */}
                <Text style={styles.sectionTitle}>{t.legal.termsTitle}</Text>
                <Text style={styles.modalText}>{t.legal.termsContent}</Text>

                <View style={styles.divider} />

                {/* Privacy Policy */}
                <Text style={styles.sectionTitle}>{t.legal.privacyTitle}</Text>
                <Text style={styles.modalText}>{t.legal.privacyContent}</Text>

                <View style={styles.divider} />

                {/* AGB */}
                <Text style={styles.sectionTitle}>{t.legal.agbTitle}</Text>
                <Text style={styles.modalText}>{t.legal.agbContent}</Text>

                <View style={styles.divider} />

                {/* Impressum - At the bottom */}
                <Text style={styles.sectionTitle}>{t.legal.impressumTitle}</Text>
                <Text style={styles.modalText}>{t.legal.impressumContent}</Text>
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
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    height: '80%',
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.neonGreen,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    opacity: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 24,
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
