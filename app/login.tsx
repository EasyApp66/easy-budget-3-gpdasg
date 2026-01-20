
import React, { useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async () => {
    console.log('[LoginScreen] User tapped login button');
    if (!email || !password) {
      Alert.alert(t.common.error, t.register.errorAllFields);
      return;
    }

    try {
      setLoading(true);
      console.log('[LoginScreen] Attempting login with email:', email);
      await signInWithEmail(email, password);
      console.log('[LoginScreen] Login successful, redirecting to budget screen');
      // Redirect to budget screen after successful login
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      console.log('[LoginScreen] Login failed:', error.message);
      Alert.alert(t.common.error, error.message || t.register.errorRegistration);
      setLoading(false);
    }
  };

  const handlePress = (callback: () => void) => {
    if (Platform.OS !== 'web') {
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
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95);
          handlePress(() => {});
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => handlePress(onPress)}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
            animatedStyle,
          ]}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => {
            console.log('[LoginScreen] User tapped back button');
            handlePress(() => router.back());
          }}
          style={styles.backButton}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.lightGray}
          />
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>{t.login.title}</Text>
          <Text style={styles.subtitle}>{t.login.subtitle}</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t.login.emailPlaceholder}
              placeholderTextColor={colors.lightGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder={t.login.passwordPlaceholder}
              placeholderTextColor={colors.lightGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <AnimatedButton
              title={t.login.loginButton}
              onPress={handleLogin}
              disabled={!email || !password}
            />

            <Pressable
              onPress={() => {
                console.log('[LoginScreen] User tapped forgot password link');
                handlePress(() => router.push('/forgot-password'));
              }}
              style={styles.linkContainer}
            >
              <Text style={styles.link}>{t.login.forgotPassword}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                console.log('[LoginScreen] User tapped register link');
                handlePress(() => router.push('/register'));
              }}
              style={styles.linkContainer}
            >
              <Text style={styles.registerLink}>
                {t.login.noAccount}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightGray,
    marginBottom: 40,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.neonGreen,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  link: {
    color: colors.neonGreen,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  registerLink: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
