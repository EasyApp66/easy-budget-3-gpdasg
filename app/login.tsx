
import React, { useState } from 'react';
import { colors } from '@/styles/commonStyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.darkGray,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.7,
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    color: colors.neonGreen,
    textDecorationLine: 'underline',
  },
  forgotLink: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default function LoginScreen() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const backScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePress = (callback: () => void, scaleValue: Animated.SharedValue<number>) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });
    callback();
  };

  const AnimatedButton = ({
    title,
    onPress,
    disabled,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[styles.button, disabled && { opacity: 0.5 }]}
          onPress={() => {
            if (!disabled) {
              handlePress(onPress, scale);
            }
          }}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }

    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      Alert.alert('Fehler', error.message || 'Anmeldung fehlgeschlagen');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.backButton, backAnimatedStyle]}>
            <Pressable
              onPress={() => handlePress(() => router.back(), backScale)}
              style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconSymbol
                name="chevron.left"
                size={24}
                color={colors.white}
              />
            </Pressable>
          </Animated.View>

          <Text style={styles.title}>Willkommen zurück</Text>
          <Text style={styles.subtitle}>Melde dich an, um fortzufahren</Text>

          <Text style={styles.label}>E-Mail</Text>
          <TextInput
            style={styles.input}
            placeholder="deine@email.com"
            placeholderTextColor={colors.white + '50'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Passwort</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.white + '50'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotLink}>Passwort vergessen?</Text>
          </Pressable>

          <AnimatedButton
            title="Anmelden"
            onPress={handleLogin}
            disabled={!email || !password}
          />

          <View style={styles.linkContainer}>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.link}>Noch kein Konto? Registrieren</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
