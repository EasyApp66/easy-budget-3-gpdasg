
import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/styles/commonStyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  titleContainer: {
    marginBottom: 60,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1,
  },
  titleHighlight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
    marginLeft: 8,
  },
  titleLarge: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonTextPrimary: {
    color: colors.background,
  },
  buttonTextSecondary: {
    color: colors.background,
  },
  iconContainer: {
    marginRight: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default function WelcomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const emailScale = useSharedValue(1);
  const appleScale = useSharedValue(1);
  const googleScale = useSharedValue(1);

  const emailAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emailScale.value }],
  }));

  const appleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: appleScale.value }],
  }));

  const googleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.value }],
  }));

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
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.button,
            { backgroundColor },
            disabled && styles.buttonDisabled,
          ]}
        >
          {iconName && (
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name={iconName}
                android_material_icon_name={iconName}
                size={20}
                color={textColor}
              />
            </View>
          )}
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const handleEmailPress = () => {
    console.log('User tapped Email button');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/login');
  };

  const handleApplePress = async () => {
    console.log('User tapped Apple button');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (Platform.OS !== 'ios' && Platform.OS !== 'web') {
      console.log('Apple Sign In only available on iOS and Web');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithApple();
      console.log('Apple Sign In successful, navigating to app');
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = async () => {
    console.log('User tapped Google button');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    try {
      await signInWithGoogle();
      console.log('Google Sign In successful, navigating to app');
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      console.error('Google Sign In error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyPress = () => {
    console.log('User tapped Privacy Policy link');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/privacy-policy');
  };

  const handleTermsPress = () => {
    console.log('User tapped Terms of Service link');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/terms-of-service');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <View style={styles.titleLine}>
              <Text style={styles.titleText}>Hallo! Ich bin</Text>
            </View>
            <View style={styles.titleLine}>
              <Text style={[styles.titleText, styles.titleLarge, styles.titleHighlight]}>
                EASY BUDGET
              </Text>
            </View>
            <View style={styles.titleLine}>
              <Text style={styles.titleText}>Tracke dein</Text>
            </View>
            <View style={styles.titleLine}>
              <Text style={[styles.titleText, styles.titleLarge, styles.titleHighlight]}>
                BUDGET
              </Text>
            </View>
            <View style={styles.titleLine}>
              <Text style={styles.titleText}>Und Deine</Text>
            </View>
            <View style={styles.titleLine}>
              <Text style={[styles.titleText, styles.titleLarge, styles.titleHighlight]}>
                ABOS
              </Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <AnimatedButton
              title="Mit E-Mail fortfahren"
              onPress={handleEmailPress}
              backgroundColor={colors.primary}
              textColor={colors.background}
              iconName="email"
              disabled={isLoading}
            />

            <AnimatedButton
              title="Mit Apple fortfahren"
              onPress={handleApplePress}
              backgroundColor={colors.text}
              textColor={colors.background}
              iconName="phone"
              disabled={isLoading || (Platform.OS !== 'ios' && Platform.OS !== 'web')}
            />

            <AnimatedButton
              title="Mit Google anmelden"
              onPress={handleGooglePress}
              backgroundColor={colors.text}
              textColor={colors.background}
              iconName="account-circle"
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Indem du fortfährst, bestätigst du, dass du die{' '}
              <Text style={styles.footerLink} onPress={handleTermsPress}>
                Nutzungsbedingungen
              </Text>
              {' '}und die{' '}
              <Text style={styles.footerLink} onPress={handlePrivacyPress}>
                Datenschutzerklärung
              </Text>
              {' '}gelesen hast.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
