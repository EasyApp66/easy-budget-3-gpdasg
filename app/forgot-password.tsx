
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
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { authClient } from '@/lib/auth';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const buttonScale = useSharedValue(1);

  const handlePress = (callback: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    callback();
  };

  const AnimatedButton = ({ title, onPress, disabled }: {
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
          scale.value = withSpring(0.97);
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        disabled={disabled}
      >
        <Animated.View style={[styles.button, animatedStyle, disabled && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>{title}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  const handleSendLink = async () => {
    if (!email) {
      Alert.alert(t.common.error, t.forgotPassword.errorEmail);
      return;
    }

    setLoading(true);
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      Alert.alert(
        t.forgotPassword.successTitle,
        t.forgotPassword.successMessage,
        [
          {
            text: t.common.ok,
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.forgotPassword.errorSend);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Simple Back Button - No Glass Effect */}
        <Pressable
          onPress={() => {
            handlePress(() => router.back());
          }}
          style={styles.backButton}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>{t.forgotPassword.title}</Text>
          <Text style={styles.subtitle}>{t.forgotPassword.subtitle}</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t.forgotPassword.emailPlaceholder}
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AnimatedButton
              title={loading ? t.forgotPassword.loading : t.forgotPassword.sendButton}
              onPress={handleSendLink}
              disabled={loading}
            />

            <Pressable
              onPress={() => handlePress(() => router.back())}
              style={styles.linkContainer}
            >
              <Text style={styles.link}>{t.forgotPassword.backToLogin}</Text>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
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
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
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
    letterSpacing: 0.5,
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: {
    color: colors.neonGreen,
    fontSize: 14,
    fontWeight: '700',
  },
});
