
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as MailComposer from 'expo-mail-composer';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import { usePremium } from '@/hooks/usePremium';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
  black: '#000000',
  white: '#FFFFFF',
  neonGreen: '#BFFE84',
  darkGray: '#232323',
  red: '#C43C3E',
  mysticalPurple: '#9D4EDD',
  mysticalBlue: '#3A86FF',
  mysticalGold: '#FFD60A',
};

const SUPPORT_EMAIL = 'ivanmirosnic006@gmail.com';

interface SettingsItemProps {
  iosIcon: string;
  androidIcon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
}

const SettingsItem = ({ iosIcon, androidIcon, iconColor, title, onPress }: SettingsItemProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.settingsItem, animatedStyle]}>
        <View style={styles.settingsItemLeft}>
          <IconSymbol 
            ios_icon_name={iosIcon} 
            android_material_icon_name={androidIcon}
            size={24} 
            color={iconColor} 
          />
          <Text style={styles.settingsItemText}>{title}</Text>
        </View>
        <IconSymbol 
          ios_icon_name="chevron.right" 
          android_material_icon_name="chevron-right"
          size={20} 
          color="#666" 
        />
      </Animated.View>
    </Pressable>
  );
};

export default function ProfilScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { isPremium } = usePremium();
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState('mirosnic.ivan');
  
  // Premium status state
  const [premiumStatus, setPremiumStatus] = useState<{
    isPremium: boolean;
    daysRemaining?: number;
    expiresAt?: string;
    isLifetime?: boolean;
  }>({ isPremium: false });
  
  // Modal states
  const [bugModalVisible, setBugModalVisible] = useState(false);
  const [donateModalVisible, setDonateModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [promoCodeModalVisible, setPromoCodeModalVisible] = useState(false);
  const [secretCodeModalVisible, setSecretCodeModalVisible] = useState(false);
  
  // Form states
  const [bugDescription, setBugDescription] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(5);
  const [customDonation, setCustomDonation] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [secretCode, setSecretCode] = useState('');

  // Load premium status on mount
  useEffect(() => {
    loadPremiumStatus();
  }, [user]);

  // Expose secret code modal function globally for tab bar
  useEffect(() => {
    (global as any).openSecretCodeModal = () => {
      console.log('[Profile] Opening secret code modal from tab bar');
      setSecretCodeModalVisible(true);
    };
    return () => {
      delete (global as any).openSecretCodeModal;
    };
  }, []);

  const loadPremiumStatus = async () => {
    const ADMIN_EMAIL = 'mirosnic.ivan@icloud.com';
    
    // Check if user is admin
    if (user?.email === ADMIN_EMAIL) {
      console.log('[Profile] Admin user detected, granting premium access');
      setPremiumStatus({ isPremium: true, isLifetime: true });
      return;
    }

    // First check local storage for offline premium code
    try {
      const expiresAt = await AsyncStorage.getItem('premium_expires_at');
      const codeUsed = await AsyncStorage.getItem('premium_code_used');
      
      if (expiresAt && codeUsed === 'EASY2') {
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        
        if (expiryDate > now) {
          // Premium is still valid
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log('[Profile] Local premium active, days remaining:', daysRemaining);
          
          setPremiumStatus({ 
            isPremium: true, 
            expiresAt: expiresAt,
            daysRemaining: daysRemaining,
            isLifetime: false
          });
          return;
        } else {
          // Premium expired, clear local storage
          console.log('[Profile] Local premium expired');
          await AsyncStorage.removeItem('premium_expires_at');
          await AsyncStorage.removeItem('premium_code_used');
        }
      }
    } catch (error) {
      console.error('[Profile] Error checking local premium status:', error);
    }

    // Check premium status from backend
    try {
      if (user?.email) {
        console.log('[Profile] Checking premium status for:', user.email);
        
        // Import API utilities
        const { authenticatedGet, BACKEND_URL } = await import('@/utils/api');
        
        if (!BACKEND_URL) {
          console.warn('[Profile] Backend URL not configured, defaulting to non-premium');
          setPremiumStatus({ isPremium: false });
          return;
        }

        // Call backend to check premium status
        const data = await authenticatedGet<{ 
          isPremium: boolean; 
          expiresAt?: string;
          daysRemaining?: number;
          isLifetime?: boolean;
        }>('/api/premium/status');
        
        console.log('[Profile] Status received:', data);
        setPremiumStatus(data);
      } else {
        console.log('[Profile] No user email, defaulting to non-premium');
        setPremiumStatus({ isPremium: false });
      }
    } catch (error) {
      console.error('[Profile] Error checking premium status:', error);
      // If endpoint doesn't exist yet (404), default to non-premium
      setPremiumStatus({ isPremium: false });
    }
  };

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert(t.common.error, language === 'DE' ? 'Bitte gib einen Code ein' : 'Please enter a code');
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const code = promoCode.trim().toUpperCase();
    console.log('[Profile] Redeeming promo code:', code);

    // Check if code is EASY2 (works offline)
    if (code === 'EASY2') {
      try {
        // Calculate expiry date (1 month from now)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        // Store premium status locally
        await AsyncStorage.setItem('premium_expires_at', expiryDate.toISOString());
        await AsyncStorage.setItem('premium_code_used', 'EASY2');
        
        console.log('[Profile] EASY2 code redeemed offline, expires:', expiryDate.toISOString());
        
        Alert.alert(
          language === 'DE' ? 'Code eingelöst!' : 'Code Redeemed!',
          language === 'DE' 
            ? 'Du hast 1 Monat Premium erhalten!' 
            : 'You received 1 month of Premium!'
        );
        
        setPromoCodeModalVisible(false);
        setPromoCode('');
        
        // Reload premium status
        await loadPremiumStatus();
        
        return;
      } catch (error) {
        console.error('[Profile] Error storing premium status locally:', error);
      }
    }

    // For other codes, try backend
    try {
      const { authenticatedPost, BACKEND_URL } = await import('@/utils/api');
      
      if (!BACKEND_URL) {
        console.warn('[Profile] Backend URL not configured');
        Alert.alert(
          t.profile.invalidCode,
          language === 'DE' ? 'Ungültiger Code' : 'Invalid code'
        );
        return;
      }

      const response = await authenticatedPost<{
        success: boolean;
        message: string;
        expiresAt?: string;
        daysRemaining?: number;
      }>('/api/premium/redeem-code', {
        code: code,
      });

      console.log('[Profile] Redeem code response:', response);

      if (response.success) {
        Alert.alert(
          t.profile.codeRedeemed,
          t.profile.codeRedeemedMessage
        );
        setPromoCodeModalVisible(false);
        setPromoCode('');
        // Reload premium status
        await loadPremiumStatus();
      } else {
        Alert.alert(
          t.profile.invalidCode,
          response.message || t.profile.invalidCodeMessage
        );
      }
    } catch (error: any) {
      console.error('[Profile] Error redeeming code:', error);
      
      Alert.alert(
        t.profile.invalidCode,
        language === 'DE' ? 'Ungültiger Code' : 'Invalid code'
      );
    }
  };

  const handleSecretCodeRedeem = async () => {
    if (!secretCode.trim()) {
      Alert.alert(t.common.error, language === 'DE' ? 'Bitte gib einen Code ein' : 'Please enter a code');
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const code = secretCode.trim().toUpperCase();
    console.log('[Profile] Redeeming secret code:', code);

    // Check if code is EASY2 (works offline)
    if (code === 'EASY2') {
      try {
        // Calculate expiry date (1 month from now)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        // Store premium status locally
        await AsyncStorage.setItem('premium_expires_at', expiryDate.toISOString());
        await AsyncStorage.setItem('premium_code_used', 'EASY2');
        
        console.log('[Profile] EASY2 secret code redeemed offline, expires:', expiryDate.toISOString());
        
        Alert.alert(
          language === 'DE' ? '🎉 Code eingelöst!' : '🎉 Code Redeemed!',
          language === 'DE' 
            ? 'Du hast 1 Monat Premium erhalten!' 
            : 'You received 1 month of Premium!'
        );
        
        setSecretCodeModalVisible(false);
        setSecretCode('');
        
        // Reload premium status
        await loadPremiumStatus();
        
        return;
      } catch (error) {
        console.error('[Profile] Error storing premium status locally:', error);
      }
    } else {
      Alert.alert(
        t.profile.invalidCode,
        language === 'DE' ? 'Ungültiger Code' : 'Invalid code'
      );
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      t.profile.logout,
      t.profile.logoutConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.logout,
          style: 'destructive',
          onPress: async () => {
            console.log('[Profile] User logging out');
            await signOut();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handleLanguageChange = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newLang = language === 'DE' ? 'EN' : 'DE';
    console.log(`[Profile] Changing language to: ${newLang}`);
    await setLanguage(newLang);
  };

  const handleBuyPremium = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[Profile] Opening premium modal');
    setPremiumModalVisible(true);
  };

  const handlePurchasePremium = async (type: 'onetime' | 'monthly') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    console.log(`[Profile] Initiating premium purchase: ${type}`);
    
    try {
      const { authenticatedPost, BACKEND_URL } = await import('@/utils/api');
      
      if (!BACKEND_URL) {
        console.warn('[Profile] Backend URL not configured');
        Alert.alert(t.common.error, language === 'DE' ? 'Backend nicht konfiguriert' : 'Backend not configured');
        return;
      }

      console.log(`[Profile] Calling premium purchase endpoint`);

      const response = await authenticatedPost<{
        success: boolean;
        isPremium: boolean;
        expiresAt?: string;
        message?: string;
      }>('/api/premium/purchase', {
        type,
      });

      console.log('[Profile] Premium purchase response:', response);

      if (response.success) {
        Alert.alert(
          t.common.success,
          language === 'DE' ? 'Premium wurde aktiviert!' : 'Premium activated!'
        );
        setPremiumModalVisible(false);
        // Reload premium status
        await loadPremiumStatus();
      } else {
        Alert.alert(t.common.error, response.message || (language === 'DE' ? 'Zahlung fehlgeschlagen' : 'Payment failed'));
      }
    } catch (error: any) {
      console.error('[Profile] Premium purchase error:', error);
      
      if (error.message?.includes('404')) {
        Alert.alert(
          language === 'DE' ? 'In Entwicklung' : 'In Development',
          language === 'DE' 
            ? 'Premium-Zahlungen werden bald verfügbar sein.' 
            : 'Premium payments will be available soon.'
        );
      } else {
        Alert.alert(
          t.common.error,
          language === 'DE' ? 'Zahlung fehlgeschlagen' : 'Payment failed'
        );
      }
    }
  };

  const handlePremiumClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPremiumModalVisible(false);
  };

  const handleEditName = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNewUsername(username);
    setEditNameModalVisible(true);
  };

  const saveNewUsername = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (newUsername.trim()) {
      console.log(`[Profile] Saving new username: ${newUsername.trim()}`);
      setUsername(newUsername.trim());
      setEditNameModalVisible(false);
    }
  };

  const handleBugReport = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Profile] Opening bug report modal');
    setBugModalVisible(true);
  };

  const handleDonation = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Profile] Opening donation modal');
    setDonateModalVisible(true);
  };

  const sendBugReport = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!bugDescription.trim()) {
      Alert.alert(t.common.error, language === 'DE' ? 'Bitte beschreibe den Fehler.' : 'Please describe the bug.');
      return;
    }

    console.log('[Profile] Sending bug report');

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [SUPPORT_EMAIL],
          subject: `Bug Report - EASY BUDGET`,
          body: `Bug Description:\n\n${bugDescription}\n\n---\nUser: ${username}\nVersion: 1.0.0\nPlatform: ${Platform.OS}`,
        });
      } else {
        Alert.alert(t.common.error, language === 'DE' ? 'E-Mail ist auf diesem Gerät nicht verfügbar.' : 'Email is not available on this device.');
      }
    } catch (error) {
      console.error('[Profile] Error sending bug report:', error);
      Alert.alert(t.common.error, language === 'DE' ? 'Fehler beim Senden des Bug Reports.' : 'Error sending bug report.');
    }
    
    setBugModalVisible(false);
    setBugDescription('');
  };

  const processDonation = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const amount = customDonation || selectedDonation.toString();
    console.log(`[Profile] Processing donation: CHF ${amount}`);
    
    try {
      const { authenticatedPost, BACKEND_URL } = await import('@/utils/api');
      
      if (!BACKEND_URL) {
        console.warn('[Profile] Backend URL not configured');
        Alert.alert(t.common.error, language === 'DE' ? 'Backend nicht konfiguriert' : 'Backend not configured');
        return;
      }

      console.log('[Profile] Calling donation endpoint: /api/payments/donation');

      const response = await authenticatedPost<{
        success: boolean;
        paymentUrl?: string;
        transactionId?: string;
        message?: string;
      }>('/api/payments/donation', {
        amount: parseFloat(amount),
        currency: 'CHF',
        platform: Platform.OS,
      });

      console.log('[Profile] Donation response:', response);

      if (response.success) {
        Alert.alert(
          language === 'DE' ? 'Danke!' : 'Thank you!',
          language === 'DE' 
            ? `Deine Spende von CHF ${amount}.00 wurde verarbeitet!` 
            : `Your donation of CHF ${amount}.00 has been processed!`
        );
        setDonateModalVisible(false);
        setCustomDonation('');
        setSelectedDonation(5);
      } else {
        Alert.alert(t.common.error, response.message || (language === 'DE' ? 'Spende fehlgeschlagen' : 'Donation failed'));
      }
    } catch (error: any) {
      console.error('[Profile] Donation error:', error);
      
      if (error.message?.includes('404')) {
        Alert.alert(
          language === 'DE' ? 'In Entwicklung' : 'In Development',
          language === 'DE' 
            ? 'Spenden werden bald verfügbar sein. Die Backend-Integration ist noch in Arbeit.' 
            : 'Donations will be available soon. Backend integration is still in progress.'
        );
      } else {
        Alert.alert(
          t.common.error,
          language === 'DE' ? 'Spende fehlgeschlagen' : 'Donation failed'
        );
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      t.profile.deleteAccount,
      t.profile.deleteAccountConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            console.log('[Profile] User confirmed account deletion');
            
            try {
              const { authenticatedDelete, BACKEND_URL } = await import('@/utils/api');
              
              if (!BACKEND_URL) {
                console.warn('[Profile] Backend URL not configured');
                Alert.alert(t.common.error, language === 'DE' ? 'Backend nicht konfiguriert' : 'Backend not configured');
                return;
              }

              console.log('[Profile] Calling account deletion endpoint: DELETE /api/user/account');

              const response = await authenticatedDelete<{
                success: boolean;
                message?: string;
              }>('/api/user/account');

              console.log('[Profile] Account deletion response:', response);

              if (response.success) {
                Alert.alert(
                  t.profile.accountDeleted,
                  t.profile.accountDeletedMessage,
                  [
                    {
                      text: t.common.ok,
                      onPress: async () => {
                        console.log('[Profile] Account deleted, signing out');
                        await signOut();
                        router.replace('/welcome');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(t.common.error, response.message || (language === 'DE' ? 'Konto konnte nicht gelöscht werden' : 'Could not delete account'));
              }
            } catch (error: any) {
              console.error('[Profile] Account deletion error:', error);
              
              if (error.message?.includes('404')) {
                Alert.alert(
                  language === 'DE' ? 'In Entwicklung' : 'In Development',
                  language === 'DE' 
                    ? 'Konto-Löschung wird bald verfügbar sein.' 
                    : 'Account deletion will be available soon.'
                );
              } else {
                Alert.alert(
                  t.common.error,
                  language === 'DE' ? 'Konto konnte nicht gelöscht werden' : 'Could not delete account'
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleSupport = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Profile] Opening support email');
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [SUPPORT_EMAIL],
          subject: language === 'DE' ? 'Support Anfrage - EASY BUDGET' : 'Support Request - EASY BUDGET',
          body: language === 'DE' ? `Hallo Support Team,\n\n` : `Hello Support Team,\n\n`,
        });
      } else {
        Alert.alert(t.common.error, language === 'DE' ? 'E-Mail ist auf diesem Gerät nicht verfügbar.' : 'Email is not available on this device.');
      }
    } catch (error) {
      console.error('[Profile] Error opening mail composer:', error);
    }
  };

  const handleSuggestion = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('[Profile] Opening suggestion email');
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [SUPPORT_EMAIL],
          subject: language === 'DE' ? 'Vorschlag - EASY BUDGET' : 'Suggestion - EASY BUDGET',
          body: language === 'DE' ? `Mein Vorschlag:\n\n` : `My suggestion:\n\n`,
        });
      } else {
        Alert.alert(t.common.error, language === 'DE' ? 'E-Mail ist auf diesem Gerät nicht verfügbar.' : 'Email is not available on this device.');
      }
    } catch (error) {
      console.error('[Profile] Error opening mail composer:', error);
    }
  };

  const handleTextPage = (title: string, content: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[Profile] Opening legal page: ${title}`);
    Alert.alert(title, content);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.userIconContainer}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person"
              size={60} 
              color={colors.black} 
            />
          </View>
          <Pressable onPress={handleEditName}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.usernameHint}>
              {language === 'DE' ? 'Tippe um Namen zu ändern' : 'Tap to change name'}
            </Text>
          </Pressable>
          
          {/* Premium Status */}
          <View style={styles.premiumStatusContainer}>
            <Text style={styles.premiumStatusLabel}>
              {t.profile.premiumStatus}:
            </Text>
            <Text style={[
              styles.premiumStatusValue,
              { color: premiumStatus.isPremium ? colors.neonGreen : colors.white }
            ]}>
              {premiumStatus.isPremium 
                ? (premiumStatus.isLifetime 
                    ? t.profile.premiumYes 
                    : `${t.profile.premiumYes} (${premiumStatus.daysRemaining} ${t.profile.premiumDays})`)
                : t.profile.premiumNo
              }
            </Text>
          </View>

          {/* Promo Code Input */}
          {!premiumStatus.isPremium && (
            <View style={styles.promoCodeContainer}>
              <TextInput
                style={styles.promoCodeInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder={t.profile.promoCodePlaceholder}
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              <Pressable 
                style={styles.redeemButton}
                onPress={handleRedeemCode}
              >
                <Text style={styles.redeemButtonText}>{t.profile.redeemCode}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Settings Items */}
        <View style={styles.settingsList}>
          <SettingsItem
            iosIcon="arrow.right.square"
            androidIcon="exit-to-app"
            iconColor={colors.neonGreen}
            title={t.profile.logout}
            onPress={handleLogout}
          />
          <SettingsItem
            iosIcon="globe"
            androidIcon="language"
            iconColor={colors.neonGreen}
            title={`${t.profile.language}: ${language}`}
            onPress={handleLanguageChange}
          />
          <SettingsItem
            iosIcon="star.fill"
            androidIcon="star"
            iconColor={colors.neonGreen}
            title={t.profile.premium}
            onPress={handleBuyPremium}
          />
          <SettingsItem
            iosIcon="doc.text"
            androidIcon="description"
            iconColor={colors.white}
            title={t.profile.agb}
            onPress={() => handleTextPage(t.legal.agbTitle, t.legal.agbContent)}
          />
          <SettingsItem
            iosIcon="shield"
            androidIcon="shield"
            iconColor={colors.white}
            title={t.profile.terms}
            onPress={() => handleTextPage(t.legal.termsTitle, t.legal.termsContent)}
          />
          <SettingsItem
            iosIcon="lock.shield"
            androidIcon="lock"
            iconColor={colors.white}
            title={t.profile.privacy}
            onPress={() => handleTextPage(t.legal.privacyTitle, t.legal.privacyContent)}
          />
          <SettingsItem
            iosIcon="info.circle"
            androidIcon="info"
            iconColor={colors.white}
            title={t.profile.impressum}
            onPress={() => handleTextPage(t.legal.impressumTitle, t.legal.impressumContent)}
          />
          <SettingsItem
            iosIcon="envelope"
            androidIcon="email"
            iconColor={colors.white}
            title={t.profile.support}
            onPress={handleSupport}
          />
          <SettingsItem
            iosIcon="lightbulb"
            androidIcon="lightbulb-outline"
            iconColor={colors.white}
            title={t.profile.suggestion}
            onPress={handleSuggestion}
          />
          <SettingsItem
            iosIcon="ant"
            androidIcon="bug-report"
            iconColor={colors.neonGreen}
            title={t.profile.bugReport}
            onPress={handleBugReport}
          />
          <SettingsItem
            iosIcon="heart.fill"
            androidIcon="favorite"
            iconColor={colors.red}
            title={t.profile.donation}
            onPress={handleDonation}
          />
          <SettingsItem
            iosIcon="trash"
            androidIcon="delete"
            iconColor={colors.red}
            title={t.profile.deleteAccount}
            onPress={handleDeleteAccount}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>
            Made with <Text style={{ color: colors.red }}>❤️</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={editNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditNameModalVisible(false)}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>
              {language === 'DE' ? 'Namen ändern' : 'Change Name'}
            </Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder={language === 'DE' ? 'Neuer Name' : 'New Name'}
              placeholderTextColor="#666"
              autoFocus
            />
            <Pressable style={styles.primaryButton} onPress={saveNewUsername}>
              <Text style={styles.primaryButtonText}>{t.common.save}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Bug Report Modal */}
      <Modal
        visible={bugModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBugModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setBugModalVisible(false)}>
          <View style={styles.bugModal}>
            <Pressable style={styles.closeButton} onPress={() => setBugModalVisible(false)}>
              <IconSymbol 
                ios_icon_name="xmark" 
                android_material_icon_name="close"
                size={24} 
                color={colors.white} 
              />
            </Pressable>

            <View style={styles.bugIconContainer}>
              <IconSymbol 
                ios_icon_name="ant" 
                android_material_icon_name="bug-report"
                size={40} 
                color={colors.neonGreen} 
              />
            </View>

            <Text style={styles.modalTitle}>{t.profile.bugReport}</Text>

            <TextInput
              style={styles.bugInput}
              value={bugDescription}
              onChangeText={setBugDescription}
              placeholder={language === 'DE' ? 'Beschreibe den Fehler...' : 'Describe the bug...'}
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Pressable style={styles.sendButton} onPress={sendBugReport}>
              <IconSymbol 
                ios_icon_name="paperplane.fill" 
                android_material_icon_name="send"
                size={20} 
                color={colors.black} 
              />
              <Text style={styles.sendButtonText}>
                {language === 'DE' ? 'Senden' : 'Send'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Donation Modal */}
      <Modal
        visible={donateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDonateModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDonateModalVisible(false)}>
          <View style={styles.donateModal}>
            <Pressable style={styles.closeButton} onPress={() => setDonateModalVisible(false)}>
              <IconSymbol 
                ios_icon_name="xmark" 
                android_material_icon_name="close"
                size={24} 
                color={colors.white} 
              />
            </Pressable>

            <View style={styles.heartIconContainer}>
              <Text style={styles.heartIcon}>❤️</Text>
            </View>

            <Text style={styles.modalTitle}>
              {language === 'DE' ? 'Spenden' : 'Donate'}
            </Text>
            <Text style={styles.donateSubtitle}>
              {language === 'DE' ? 'Unterstütze die Entwicklung der App' : 'Support the development of the app'}
            </Text>

            <View style={styles.donationAmounts}>
              {[1, 5, 10, 20].map((amount) => (
                <Pressable
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedDonation === amount && styles.amountButtonSelected,
                  ]}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedDonation(amount);
                    setCustomDonation('');
                  }}
                >
                  <Text
                    style={[
                      styles.amountText,
                      selectedDonation === amount && styles.amountTextSelected,
                    ]}
                  >
                    {amount}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.customAmountInput}
              value={customDonation}
              onChangeText={setCustomDonation}
              placeholder={language === 'DE' ? 'CHF Eigener Betrag' : 'CHF Custom amount'}
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Pressable style={styles.donateButton} onPress={processDonation}>
              <IconSymbol 
                ios_icon_name="heart.fill" 
                android_material_icon_name="favorite"
                size={20} 
                color={colors.white} 
              />
              <Text style={styles.donateButtonText}>
                {language === 'DE' ? 'Spenden' : 'Donate'} CHF {customDonation || selectedDonation}.00
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Secret Code Modal - Mystical Design */}
      <Modal
        visible={secretCodeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecretCodeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSecretCodeModalVisible(false)}>
          <Animated.View 
            style={styles.secretCodeModal}
            entering={withSequence(
              withTiming({ opacity: 0, scale: 0.8 }, { duration: 0 }),
              withSpring({ opacity: 1, scale: 1 }, { damping: 15, stiffness: 150 })
            )}
          >
            <Pressable style={styles.closeButton} onPress={() => setSecretCodeModalVisible(false)}>
              <IconSymbol 
                ios_icon_name="xmark" 
                android_material_icon_name="close"
                size={24} 
                color={colors.mysticalGold} 
              />
            </Pressable>

            {/* Mystical Icon */}
            <View style={styles.mysticalIconContainer}>
              <Text style={styles.mysticalIcon}>✨</Text>
            </View>

            <Text style={styles.secretModalTitle}>
              {language === 'DE' ? 'Geheimcode gefunden!!!' : 'Secret Code Found!!!'}
            </Text>
            
            <Text style={styles.secretModalSubtitle}>
              {language === 'DE' 
                ? 'Löse den Geheimcode ein um einen Monat Premium zu erhalten!' 
                : 'Redeem the secret code to get one month of Premium!'}
            </Text>

            <View style={styles.codeDisplayContainer}>
              <Text style={styles.codeLabel}>
                {language === 'DE' ? 'Code:' : 'Code:'}
              </Text>
              <Text style={styles.codeDisplay}>Easy2</Text>
            </View>

            <TextInput
              style={styles.secretCodeInput}
              value={secretCode}
              onChangeText={setSecretCode}
              placeholder={language === 'DE' ? 'Code eingeben...' : 'Enter code...'}
              placeholderTextColor="#666"
              autoCapitalize="characters"
              autoFocus
            />

            <Pressable style={styles.secretRedeemButton} onPress={handleSecretCodeRedeem}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star"
                size={20} 
                color={colors.black} 
              />
              <Text style={styles.secretRedeemButtonText}>
                {language === 'DE' ? 'Einlösen' : 'Redeem'}
              </Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Premium Purchase Modal */}
      <PremiumPaywallModal
        visible={premiumModalVisible}
        onClose={handlePremiumClose}
        onPurchase={handlePurchasePremium}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  userIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 5,
  },
  usernameHint: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  premiumStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  premiumStatusLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  premiumStatusValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  promoCodeContainer: {
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  promoCodeInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  redeemButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 15,
  },
  redeemButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  settingsList: {
    gap: 12,
  },
  settingsItem: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  settingsItemText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  bugModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  donateModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  secretCodeModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.mysticalGold,
    shadowColor: colors.mysticalGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  bugIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  heartIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3a2020',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  heartIcon: {
    fontSize: 40,
  },
  mysticalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.mysticalPurple,
  },
  mysticalIcon: {
    fontSize: 50,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  secretModalTitle: {
    color: colors.mysticalGold,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: colors.mysticalGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  secretModalSubtitle: {
    color: colors.white,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  codeDisplayContainer: {
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.mysticalPurple,
    alignItems: 'center',
  },
  codeLabel: {
    color: colors.mysticalPurple,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  codeDisplay: {
    color: colors.mysticalGold,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
  },
  donateSubtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  bugInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  secretCodeInput: {
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.mysticalBlue,
  },
  primaryButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 15,
  },
  primaryButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  sendButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
  },
  secretRedeemButton: {
    backgroundColor: colors.mysticalGold,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.mysticalGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  secretRedeemButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
  },
  donationAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  amountButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  amountButtonSelected: {
    backgroundColor: colors.neonGreen,
  },
  amountText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  amountTextSelected: {
    color: colors.black,
  },
  customAmountInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: colors.red,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  donateButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
});
