
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
import { IconSymbol } from '@/components/IconSymbol';
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

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t } = useLanguage();
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });

  const AnimatedButton = ({
    title,
    onPress,
    backgroundColor,
    textColor,
    iconName,
    isGoogle,
  }: {
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    iconName?: string;
    isGoogle?: boolean;
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
    router.push('/login');
  };

  const handleApplePress = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
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
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/budget');
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const openLegalModal = (type: 'terms' | 'privacy' | 'agb') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
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
    
    setLegalContent({ title, content });
    setLegalModalVisible(true);
  };

  const closeLegalModal = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLegalModalVisible(false);
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
              {t.welcome.footer.split(t.welcome.terms)[0]}
              <Text
                style={styles.link}
                onPress={() => openLegalModal('terms')}
              >
                {t.welcome.terms}
              </Text>
              {' '}und die{' '}
              <Text
                style={styles.link}
                onPress={() => openLegalModal('privacy')}
              >
                {t.welcome.privacy}
              </Text>
              {' '}und die{' '}
              <Text
                style={styles.link}
                onPress={() => openLegalModal('agb')}
              >
                {t.welcome.agb}
              </Text>
              {' '}gelesen hast.
            </Text>
          </View>
        </View>
      </View>

      {/* Legal Modal */}
      <Modal
        visible={legalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeLegalModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={closeLegalModal}>
              <MaterialIcons name="close" size={28} color={colors.white} />
            </Pressable>
            
            <Text style={styles.modalTitle}>{legalContent.title}</Text>
            
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.modalText}>{legalContent.content}</Text>
            </ScrollView>
            
            <Pressable 
              style={styles.okButton} 
              onPress={closeLegalModal}
              onPressIn={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={styles.okButtonText}>{t.common.ok}</Text>
            </Pressable>
          </View>
        </View>
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
  link: {
    color: colors.neonGreen,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '75%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 20,
    marginRight: 40,
    textAlign: 'left',
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  modalScrollContent: {
    paddingRight: 8,
    paddingBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    textAlign: 'left',
    opacity: 1,
  },
  okButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  okButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 0.5,
  },
});
