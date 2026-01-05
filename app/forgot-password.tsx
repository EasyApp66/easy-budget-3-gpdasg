
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
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { authClient } from '@/lib/auth';
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
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const backScale = useSharedValue(1);

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
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

  const handleSendLink = async () => {
    if (!email) {
      Alert.alert('Fehler', 'Bitte gib deine E-Mail-Adresse ein');
      return;
    }

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      Alert.alert(
        'Link gesendet',
        'Wir haben dir einen Link zum Zurücksetzen deines Passworts gesendet. Bitte überprüfe deine E-Mails.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Fehler', error.message || 'Link konnte nicht gesendet werden');
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

          <Text style={styles.title}>Passwort vergessen</Text>
          <Text style={styles.subtitle}>
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen
          </Text>

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

          <AnimatedButton
            title="Link senden"
            onPress={handleSendLink}
            disabled={!email}
          />

          <View style={styles.linkContainer}>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.link}>Zurück zur Anmeldung</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
