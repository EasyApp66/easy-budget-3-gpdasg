
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handlePress = (callback: () => void) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback();
  };

  const AnimatedButton = ({
    title,
    onPress,
    backgroundColor,
    textColor,
    icon,
  }: {
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    icon?: string;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        style={[
          styles.button,
          { backgroundColor },
          animatedStyle,
        ]}
        onPressIn={() => {
          scale.value = withSpring(0.95);
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </AnimatedPressable>
    );
  };

  const handleEmailPress = () => {
    handlePress(() => router.push('/login'));
  };

  const handleApplePress = async () => {
    handlePress(async () => {
      try {
        console.log('[Welcome] Starting Apple sign in...');
        await signInWithApple();
        console.log('[Welcome] Apple sign in successful');
        router.replace('/(tabs)/(home)');
      } catch (error) {
        console.error('[Welcome] Apple sign in failed:', error);
        Alert.alert('Fehler', 'Apple-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      }
    });
  };

  const handleGooglePress = async () => {
    handlePress(async () => {
      try {
        console.log('[Welcome] Starting Google sign in...');
        await signInWithGoogle();
        console.log('[Welcome] Google sign in successful');
        router.replace('/(tabs)/(home)');
      } catch (error) {
        console.error('[Welcome] Google sign in failed:', error);
        Alert.alert('Fehler', 'Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      }
    });
  };

  const openLink = (url: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Hallo! Ich bin</Text>
            <Text style={[styles.titleText, styles.titleHighlight]}>
              EASY BUDGET
            </Text>
            <Text style={styles.subtitleText}>Tracke dein</Text>
            <Text style={[styles.subtitleText, styles.subtitleHighlight]}>
              BUDGET
            </Text>
            <Text style={styles.subtitleText}>Und Deine</Text>
            <Text style={[styles.subtitleText, styles.subtitleHighlight]}>
              ABOS
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Mit E-Mail fortfahren"
              onPress={handleEmailPress}
              backgroundColor={colors.neonGreen}
              textColor={colors.black}
            />
            <AnimatedButton
              title="Mit Apple fortfahren"
              onPress={handleApplePress}
              backgroundColor={colors.white}
              textColor={colors.black}
            />
            <AnimatedButton
              title="Mit Google anmelden"
              onPress={handleGooglePress}
              backgroundColor={colors.white}
              textColor={colors.black}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Indem du fortfährst, bestätigst du, dass du die{' '}
              <Text
                style={styles.footerLink}
                onPress={() => openLink('https://example.com/terms')}
              >
                Nutzungsbedingungen
              </Text>{' '}
              und die{' '}
              <Text
                style={styles.footerLink}
                onPress={() => openLink('https://example.com/privacy')}
              >
                Datenschutzerklärung
              </Text>{' '}
              und die{' '}
              <Text
                style={styles.footerLink}
                onPress={() => openLink('https://example.com/agb')}
              >
                AGBs
              </Text>{' '}
              gelesen hast.
            </Text>
          </View>
        </View>
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
  titleContainer: {
    marginBottom: 40,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'left',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  titleHighlight: {
    color: colors.neonGreen,
    fontSize: 36,
    marginBottom: 24,
  },
  subtitleText: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'left',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitleHighlight: {
    color: colors.neonGreen,
    fontSize: 48,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  footerLink: {
    color: colors.neonGreen,
    textDecorationLine: 'underline',
  },
});
