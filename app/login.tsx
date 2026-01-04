
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
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Fehler', 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
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
              <Text style={styles.title}>Willkommen zurück</Text>
              <Text style={styles.subtitle}>Melde dich an, um fortzufahren</Text>
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

              <View style={styles.inputContainer}>
                <Text style={styles.label}>PASSWORT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.white + '60'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Pressable
                onPress={() => handlePress(() => router.push('/forgot-password'))}
              >
                <Text style={styles.forgotPassword}>Passwort vergessen?</Text>
              </Pressable>

              <AnimatedButton
                title={loading ? 'Wird geladen...' : 'Anmelden'}
                onPress={handleLogin}
                disabled={loading}
              />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Noch kein Konto? </Text>
                <Pressable
                  onPress={() => handlePress(() => router.push('/register'))}
                >
                  <Text style={styles.registerLink}>Registrieren</Text>
                </Pressable>
              </View>
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
  forgotPassword: {
    fontSize: 14,
    color: colors.neonGreen,
    textAlign: 'center',
    fontWeight: '600',
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: colors.white,
  },
  registerLink: {
    fontSize: 14,
    color: colors.neonGreen,
    fontWeight: '600',
  },
});
