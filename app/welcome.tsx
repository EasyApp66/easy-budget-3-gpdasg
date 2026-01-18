
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
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t, language } = useLanguage();
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });

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

  const handleLegalPress = (title: string, content: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[Welcome] User tapped legal link: ${title}`);
    setLegalContent({ title, content });
    setLegalModalVisible(true);
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
              {language === 'DE' 
                ? 'Indem du fortfährst, bestätigst du, dass du die '
                : 'By continuing, you confirm that you have read the '}
              <Text 
                style={styles.footerLink}
                onPress={() => handleLegalPress(t.legal.termsTitle, t.legal.termsContent)}
              >
                {t.welcome.terms}
              </Text>
              {language === 'DE' ? ' und die ' : ', '}
              <Text 
                style={styles.footerLink}
                onPress={() => handleLegalPress(t.legal.privacyTitle, t.legal.privacyContent)}
              >
                {t.welcome.privacy}
              </Text>
              {language === 'DE' ? ' und die ' : ', and '}
              <Text 
                style={styles.footerLink}
                onPress={() => handleLegalPress(t.legal.agbTitle, t.legal.agbContent)}
              >
                {t.welcome.agb}
              </Text>
              {language === 'DE' ? ' gelesen hast.' : '.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Legal Text Modal */}
      <Modal
        visible={legalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLegalModalVisible(false)}>
          <Pressable style={styles.legalModal} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.closeButton} onPress={() => setLegalModalVisible(false)}>
              <IconSymbol 
                ios_icon_name="xmark" 
                android_material_icon_name="close"
                size={24} 
                color={colors.white} 
              />
            </Pressable>

            <Text style={styles.modalTitle}>{legalContent.title}</Text>

            <ScrollView 
              style={styles.legalScrollView}
              contentContainerStyle={styles.legalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.legalText}>{legalContent.content}</Text>
            </ScrollView>

            <View style={styles.legalButtonContainer}>
              <Pressable style={styles.legalOkButton} onPress={() => setLegalModalVisible(false)}>
                <Text style={styles.legalOkButtonText}>
                  {language === 'DE' ? 'OK' : 'OK'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  footerLink: {
    color: colors.neonGreen,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  legalScrollView: {
    flex: 1,
    marginBottom: 20,
  },
  legalScrollContent: {
    paddingBottom: 10,
  },
  legalText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 22,
  },
  legalButtonContainer: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  legalOkButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  legalOkButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
  },
});
