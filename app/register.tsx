
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LoadingScreen } from '@/components/LoadingScreen';
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
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useSupabaseAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const buttonScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert(t.common.error, t.register.errorAllFields);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.common.error, t.register.errorPasswordMatch);
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.common.error, t.register.errorPasswordLength);
      return;
    }

    setLoading(true);
    console.log('[Register] Attempting registration with email:', email);

    try {
      await signUpWithEmail(email, password);
      console.log('[Register] Registration successful, navigating to budget');
      router.replace('/(tabs)/budget');
    } catch (error: any) {
      console.error('[Register] Registration error:', error);
      Alert.alert(
        t.common.error,
        error.message || t.register.errorRegistration
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (callback: () => void) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1);
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
  }) => (
    <Pressable
      onPress={() => handlePress(onPress)}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          disabled && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </Pressable>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: { backgroundColor: colors.black },
          headerTintColor: colors.white,
          headerShadowVisible: false,
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
            <Text style={styles.title}>{t.register.title}</Text>
            <Text style={styles.subtitle}>{t.register.subtitle}</Text>
            
            {/* Trial Info */}
            <View style={styles.trialInfo}>
              <IconSymbol
                ios_icon_name="gift.fill"
                android_material_icon_name="card-giftcard"
                size={24}
                color="#BFFE84"
              />
              <Text style={styles.trialInfoText}>
                🎉 Erhalte 2 Wochen Premium GRATIS!
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={t.register.emailPlaceholder}
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder={t.register.passwordPlaceholder}
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder={t.register.confirmPasswordPlaceholder}
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AnimatedButton
                title={t.register.registerButton}
                onPress={handleRegister}
                disabled={loading}
              />

              <Pressable
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/login');
                }}
                style={styles.linkContainer}
              >
                <Text style={styles.link}>{t.register.haveAccount}</Text>
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a3d1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFFE84',
  },
  trialInfoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BFFE84',
    flex: 1,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: 18,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
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
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: {
    color: colors.neonGreen,
    fontSize: 14,
    fontWeight: '600',
  },
});
