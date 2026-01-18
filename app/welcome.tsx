
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContent, setLegalContent] = useState<{ title: string; content: string }>({ title: '', content: '' });

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

  const handleLegalPress = (type: 'terms' | 'privacy' | 'agb') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    console.log('[Welcome] Opening legal popup:', type);
    
    if (type === 'terms') {
      setLegalContent({ title: t.legal.termsTitle, content: t.legal.termsContent });
    } else if (type === 'privacy') {
      setLegalContent({ title: t.legal.privacyTitle, content: t.legal.privacyContent });
    } else if (type === 'agb') {
      setLegalContent({ title: t.legal.agbTitle, content: t.legal.agbContent });
    }
    
    setLegalModalVisible(true);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t.welcome.greeting} <Text style={[styles.highlight, { color: colors.neonGreen }]}>{t.welcome.appName}</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              {t.welcome.trackBudget} <Text style={[styles.highlight, { color: colors.neonGreen }]}>{t.welcome.budget}</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              {t.welcome.trackSubs} <Text style={[styles.highlight, { color: colors.neonGreen }]}>{t.welcome.subs}</Text>
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
            <Text style={[styles.footer, { color: colors.text }]}>
              {t.welcome.footer}
            </Text>
            <View style={styles.legalLinks}>
              <Pressable onPress={() => handleLegalPress('terms')}>
                <Text style={[styles.legalLink, { color: colors.neonGreen }]}>{t.welcome.terms}</Text>
              </Pressable>
              <Text style={[styles.legalSeparator, { color: colors.text }]}>·</Text>
              <Pressable onPress={() => handleLegalPress('privacy')}>
                <Text style={[styles.legalLink, { color: colors.neonGreen }]}>{t.welcome.privacy}</Text>
              </Pressable>
              <Text style={[styles.legalSeparator, { color: colors.text }]}>·</Text>
              <Pressable onPress={() => handleLegalPress('agb')}>
                <Text style={[styles.legalLink, { color: colors.neonGreen }]}>{t.welcome.agb}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Legal Modal */}
      <Modal
        visible={legalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLegalModalVisible(false)}>
          <Pressable style={[styles.legalModal, { backgroundColor: colors.cardBackground }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{legalContent.title}</Text>
              <Pressable onPress={() => setLegalModalVisible(false)} style={styles.closeButton}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              <Text style={[styles.modalContent, { color: colors.text }]}>{legalContent.content}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'left',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 43,
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  highlight: {
    // color set dynamically
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
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 12,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalModal: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalContent: {
    fontSize: 14,
    lineHeight: 22,
  },
});
