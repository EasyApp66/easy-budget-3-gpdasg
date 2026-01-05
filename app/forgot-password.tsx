
import React, { useState } from 'react';
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
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { authClient } from '@/lib/auth';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePress = (callback: () => void) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
      <AnimatedPressable
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          animatedStyle,
        ]}
        onPressIn={() => {
          if (!disabled) {
            scale.value = withSpring(0.95);
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </AnimatedPressable>
    );
  };

  const handleSendLink = async () => {
    if (!email) {
      Alert.alert('Fehler', 'Bitte E-Mail-Adresse eingeben');
      return;
    }

    setLoading(true);
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: '/reset-password', // User will receive email with reset link
      });
      console.log('[ForgotPassword] Password reset email sent to:', email);
      Alert.alert(
        'Link gesendet',
        'Wir haben dir einen Link zum Zurücksetzen deines Passworts gesendet.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('[ForgotPassword] Password reset failed:', error);
      Alert.alert('Fehler', 'Link konnte nicht gesendet werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.black,
          },
          headerTintColor: colors.white,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              style={styles.backButton}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.white}
              />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Passwort vergessen</Text>
              <Text style={styles.subtitle}>
                Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-MAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="deine@email.com"
                  placeholderTextColor={colors.white + '60'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              <AnimatedButton
                title={loading ? 'Wird gesendet...' : 'Link senden'}
                onPress={handleSendLink}
                disabled={loading}
              />

              <Pressable
                onPress={() => handlePress(() => router.back())}
              >
                <Text style={styles.backToLogin}>Zurück zur Anmeldung</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'left',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'left',
    opacity: 0.7,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.white,
  },
  button: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: 0.3,
  },
  backToLogin: {
    fontSize: 14,
    color: colors.neonGreen,
    textAlign: 'center',
    fontWeight: '600',
  },
});
