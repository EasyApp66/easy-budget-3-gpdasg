
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGAL_INFO_KEY = '@easy_budget_has_seen_legal_info';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t, language } = useLanguage();
  
  // Legal information popup state
  const [legalInfoVisible, setLegalInfoVisible] = useState(false);
  const [legalContentVisible, setLegalContentVisible] = useState(false);
  const [legalContentType, setLegalContentType] = useState<'agb' | 'terms' | 'privacy'>('agb');

  // Check if user has seen legal info on mount
  useEffect(() => {
    checkLegalInfoStatus();
  }, []);

  const checkLegalInfoStatus = async () => {
    try {
      const hasSeenLegalInfo = await AsyncStorage.getItem(LEGAL_INFO_KEY);
      if (!hasSeenLegalInfo) {
        console.log('[Welcome] First launch - showing legal information popup');
        setLegalInfoVisible(true);
      }
    } catch (error) {
      console.error('[Welcome] Error checking legal info status:', error);
    }
  };

  const handleAcceptLegalInfo = async () => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      console.log('[Welcome] User accepted legal information');
      await AsyncStorage.setItem(LEGAL_INFO_KEY, 'true');
      setLegalInfoVisible(false);
    } catch (error) {
      console.error('[Welcome] Error saving legal info status:', error);
    }
  };

  const openLegalContent = (type: 'agb' | 'terms' | 'privacy') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[Welcome] Opening legal content: ${type}`);
    setLegalContentType(type);
    setLegalContentVisible(true);
  };

  const getLegalContent = () => {
    switch (legalContentType) {
      case 'agb':
        return { title: t.legal.agbTitle, content: t.legal.agbContent };
      case 'terms':
        return { title: t.legal.termsTitle, content: t.legal.termsContent };
      case 'privacy':
        return { title: t.legal.privacyTitle, content: t.legal.privacyContent };
      default:
        return { title: '', content: '' };
    }
  };

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
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
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
              {t.welcome.footer}
            </Text>
          </View>
        </View>

        {/* Legal Information Popup - Shows on first launch */}
        <Modal
          visible={legalInfoVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.legalInfoOverlay}>
            <Pressable style={styles.legalInfoModal} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.legalInfoTitle}>
                {language === 'DE' ? 'Rechtliche Hinweise' : 'Legal Information'}
              </Text>
              
              <View style={styles.legalLinksList}>
                <Pressable 
                  style={styles.legalLinkItem}
                  onPress={() => openLegalContent('agb')}
                >
                  <Text style={styles.legalLinkText}>
                    {language === 'DE' ? 'Allgemeine Geschäftsbedingungen (AGB)' : 'Terms and Conditions (AGB)'}
                  </Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.neonGreen} />
                </Pressable>

                <Pressable 
                  style={styles.legalLinkItem}
                  onPress={() => openLegalContent('terms')}
                >
                  <Text style={styles.legalLinkText}>
                    {language === 'DE' ? 'Nutzungsbedingungen' : 'Terms of Use'}
                  </Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.neonGreen} />
                </Pressable>

                <Pressable 
                  style={styles.legalLinkItem}
                  onPress={() => openLegalContent('privacy')}
                >
                  <Text style={styles.legalLinkText}>
                    {language === 'DE' ? 'Datenschutzerklärung' : 'Privacy Policy'}
                  </Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.neonGreen} />
                </Pressable>
              </View>

              <Pressable 
                style={styles.acceptButton}
                onPress={handleAcceptLegalInfo}
              >
                <Text style={styles.acceptButtonText}>
                  {language === 'DE' ? 'Akzeptieren' : 'Accept'}
                </Text>
              </Pressable>
            </Pressable>
          </View>
        </Modal>

        {/* Legal Content Modal - Shows full legal text */}
        <Modal
          visible={legalContentVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLegalContentVisible(false)}
        >
          <Pressable 
            style={styles.legalContentOverlay} 
            onPress={() => setLegalContentVisible(false)}
          >
            <Pressable style={styles.legalContentModal} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.legalContentTitle}>{getLegalContent().title}</Text>
              <ScrollView 
                style={styles.legalContentScrollView}
                contentContainerStyle={styles.legalContentScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.legalContentText}>{getLegalContent().content}</Text>
              </ScrollView>
              <View style={styles.legalContentButtonContainer}>
                <Pressable 
                  style={styles.legalContentOkButton} 
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setLegalContentVisible(false);
                  }}
                >
                  <Text style={styles.legalContentOkButtonText}>OK</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
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
    fontSize: 32,
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
  // Legal Information Popup Styles
  legalInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  legalInfoModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 450,
  },
  legalInfoTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 24,
  },
  legalLinksList: {
    gap: 16,
    marginBottom: 28,
  },
  legalLinkItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legalLinkText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  acceptButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
  },
  // Legal Content Modal Styles (Full Text)
  legalContentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  legalContentModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  legalContentTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 16,
  },
  legalContentScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  legalContentScrollContent: {
    paddingBottom: 10,
  },
  legalContentText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  legalContentButtonContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  legalContentOkButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  legalContentOkButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
  },
});
