
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  Image,
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
import { useLanguage } from '@/contexts/LanguageContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t } = useLanguage();

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
        <Animated.View
          style={[
            styles.button,
            { backgroundColor },
            animatedStyle,
          ]}
        >
          {isGoogle ? (
            <View style={styles.googleIconContainer}>
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.googleIcon}
                resizeMode="contain"
              />
            </View>
          ) : iconName ? (
            <MaterialIcons name={iconName as any} size={20} color={textColor} style={styles.buttonIcon} />
          ) : null}
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

  const openLink = (url: string) => {
    Linking.openURL(url);
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
              isGoogle={true}
            />
          </View>

          <Text style={styles.footer}>
            {t.welcome.footer.split('Nutzungsbedingungen')[0]}
            <Text
              style={styles.link}
              onPress={() => openLink('https://example.com/terms')}
            >
              {t.welcome.terms}
            </Text>
            {' '}und die{' '}
            <Text
              style={styles.link}
              onPress={() => openLink('https://example.com/privacy')}
            >
              {t.welcome.privacy}
            </Text>
            {' '}und die{' '}
            <Text
              style={styles.link}
              onPress={() => openLink('https://example.com/agb')}
            >
              {t.welcome.agb}
            </Text>
            {' '}gelesen hast.
          </Text>
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
  googleIconContainer: {
    marginRight: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
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
});
