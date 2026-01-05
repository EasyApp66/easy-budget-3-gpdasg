
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  textBlock: {
    marginBottom: 32, // Reduced spacing for better visual balance
  },
  titleText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  highlightText: {
    color: '#BFFE84',
  },
  budgetText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  abosText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  link: {
    color: '#BFFE84',
    textDecorationLine: 'underline',
  },
});

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();

  const AnimatedButton = ({
    title,
    onPress,
    backgroundColor,
    textColor,
    iosIcon,
    androidIcon,
  }: {
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    iosIcon: string;
    androidIcon: string;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = (callback: () => void) => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      scale.value = withSpring(0.95, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
      callback();
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[styles.button, { backgroundColor }]}
          onPress={() => handlePress(onPress)}
        >
          <View style={styles.buttonContent}>
            <IconSymbol
              ios_icon_name={iosIcon}
              android_material_icon_name={androidIcon}
              size={20}
              color={textColor}
            />
            <Text style={[styles.buttonText, { color: textColor }]}>
              {title}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const handleEmailPress = () => {
    router.push('/login');
  };

  const handleApplePress = async () => {
    try {
      await signInWithApple();
    } catch (error) {
      Alert.alert('Fehler', 'Apple-Anmeldung fehlgeschlagen');
    }
  };

  const handleGooglePress = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Fehler', 'Google-Anmeldung fehlgeschlagen');
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <Text style={styles.titleText}>
            Hallo! Ich bin <Text style={styles.highlightText}>EASY BUDGET</Text>
          </Text>
          <Text style={styles.budgetText}>
            Tracke dein <Text style={styles.highlightText}>BUDGET</Text>
          </Text>
          <Text style={styles.abosText}>
            Und Deine <Text style={styles.highlightText}>ABOS</Text>
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <AnimatedButton
            title="Mit E-Mail fortfahren"
            onPress={handleEmailPress}
            backgroundColor="#BFFE84"
            textColor="#000000"
            iosIcon="envelope.fill"
            androidIcon="email"
          />
          <AnimatedButton
            title="Mit Apple fortfahren"
            onPress={handleApplePress}
            backgroundColor="#FFFFFF"
            textColor="#000000"
            iosIcon="apple.logo"
            androidIcon="phone"
          />
          <AnimatedButton
            title="Mit Google anmelden"
            onPress={handleGooglePress}
            backgroundColor="#FFFFFF"
            textColor="#000000"
            iosIcon="g.circle.fill"
            androidIcon="account-circle"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Indem du fortfährst, bestätigst du, dass du die{' '}
            <Text style={styles.link} onPress={() => openLink('https://example.com/terms')}>
              Nutzungsbedingungen
            </Text>
            {' '}und die{' '}
            <Text style={styles.link} onPress={() => openLink('https://example.com/privacy')}>
              Datenschutzerklärung
            </Text>
            {' '}und die{' '}
            <Text style={styles.link} onPress={() => openLink('https://example.com/agb')}>
              AGBs
            </Text>
            {' '}gelesen hast.
          </Text>
        </View>
      </View>
    </>
  );
}
