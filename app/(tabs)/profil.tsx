
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import React, { useState, useEffect } from 'react';
import { FadeInView } from '@/components/FadeInView';
import * as MailComposer from 'expo-mail-composer';
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
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';

const SUPPORT_EMAIL = 'ivanmirosnic006@gmail.com';

interface SettingsItemProps {
  iosIcon: string;
  androidIcon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
}

function SettingsItem({ iosIcon, androidIcon, iconColor, title, onPress }: SettingsItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.settingsItem, animatedStyle]}>
        <IconSymbol
          ios_icon_name={iosIcon}
          android_material_icon_name={androidIcon}
          size={24}
          color={iconColor}
        />
        <Text style={styles.settingsItemText}>{title}</Text>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="chevron-right"
          size={20}
          color="#666"
        />
      </Animated.View>
    </Pressable>
  );
}

export default function ProfilScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const {
    user,
    signOut,
    isPremium,
    premiumExpiresAt,
    isLifetimePremium,
    trialDaysRemaining,
    hasUsedTrial,
    checkPremiumStatus,
    redeemPromoCode,
  } = useSupabaseAuth();

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (user) {
      console.log('[Profile] User loaded:', user.email);
      checkPremiumStatus();
    }
  }, [user, checkPremiumStatus]);

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert(t.common.error, 'Bitte gib einen Promo-Code ein');
      return;
    }

    console.log('[Profile] Redeeming promo code:', promoCode);
    const result = await redeemPromoCode(promoCode);

    if (result.success) {
      Alert.alert(
        '✅ Code eingelöst!',
        result.message,
        [
          {
            text: t.common.ok,
            onPress: () => {
              setShowPromoCodeModal(false);
              setPromoCode('');
            },
          },
        ]
      );
    } else {
      Alert.alert('❌ Fehler', result.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t.profile.logout,
      t.profile.logoutConfirm,
      [
        {
          text: t.profile.no,
          style: 'cancel',
        },
        {
          text: t.profile.yes,
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/welcome');
            } catch (error) {
              console.error('[Profile] Logout error:', error);
              Alert.alert(t.common.error, 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    const newLang = language === 'DE' ? 'EN' : 'DE';
    console.log('[Profile] Changing language to:', newLang);
    setLanguage(newLang);
  };

  const handleBuyPremium = () => {
    console.log('[Profile] Opening premium modal');
    setShowPremiumModal(true);
  };

  const handlePurchasePremium = (type: 'onetime' | 'monthly') => {
    console.log('[Profile] Premium purchased:', type);
    checkPremiumStatus();
  };

  const handlePremiumClose = () => {
    console.log('[Profile] Closing premium modal');
    setShowPremiumModal(false);
  };

  const handleEditName = () => {
    setNewUsername(user?.user_metadata?.name || '');
    setShowEditNameModal(true);
  };

  const saveNewUsername = async () => {
    // TODO: Implement username update via Supabase
    console.log('[Profile] Saving new username:', newUsername);
    setShowEditNameModal(false);
  };

  const handleBugReport = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [SUPPORT_EMAIL],
        subject: 'Bug Report - EASY BUDGET',
        body: 'Please describe the bug:\n\n',
      });
    } else {
      Alert.alert(t.common.error, 'Email not available on this device');
    }
  };

  const handleDonation = () => {
    // TODO: Implement donation via Stripe
    Alert.alert('Donation', 'Donation feature coming soon!');
  };

  const sendBugReport = async () => {
    await handleBugReport();
  };

  const processDonation = () => {
    handleDonation();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.profile.deleteAccount,
      t.profile.deleteAccountConfirm,
      [
        {
          text: t.common.cancel,
          style: 'cancel',
        },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement account deletion
            console.log('[Profile] Deleting account');
          },
        },
      ]
    );
  };

  const handleSupport = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [SUPPORT_EMAIL],
        subject: 'Support Request - EASY BUDGET',
        body: 'How can we help you?\n\n',
      });
    } else {
      Alert.alert(t.common.error, 'Email not available on this device');
    }
  };

  const handleSuggestion = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [SUPPORT_EMAIL],
        subject: 'Feature Suggestion - EASY BUDGET',
        body: 'I would like to suggest:\n\n',
      });
    } else {
      Alert.alert(t.common.error, 'Email not available on this device');
    }
  };

  const handleLegalPress = () => {
    setShowLegalModal(true);
  };

  const closeLegalModal = () => {
    setShowLegalModal(false);
  };

  const username = user?.user_metadata?.name || user?.email || 'User';
  
  // Premium status text
  let premiumStatusText = '';
  let premiumStatusColor = colors.red;
  let premiumExpiryText = '';
  
  if (isLifetimePremium) {
    premiumStatusText = '♾️ Lifetime Premium';
    premiumStatusColor = colors.neonGreen;
    premiumExpiryText = 'Für immer aktiv!';
  } else if (isPremium && trialDaysRemaining > 0 && !hasUsedTrial) {
    premiumStatusText = '🎁 Premium Trial';
    premiumStatusColor = colors.neonGreen;
    const daysText = trialDaysRemaining === 1 ? 'Tag' : 'Tage';
    premiumExpiryText = `Noch ${trialDaysRemaining} ${daysText} verbleibend`;
  } else if (isPremium) {
    premiumStatusText = '✅ Premium Aktiv';
    premiumStatusColor = colors.neonGreen;
    const premiumDaysRemaining = premiumExpiresAt
      ? Math.ceil((premiumExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const daysText = premiumDaysRemaining === 1 ? 'Tag' : 'Tage';
    premiumExpiryText = `Noch ${premiumDaysRemaining} ${daysText} verbleibend`;
  } else {
    premiumStatusText = '❌ Kein Premium';
    premiumStatusColor = colors.red;
    premiumExpiryText = hasUsedTrial ? 'Testversion abgelaufen' : '';
  }

  return (
    <FadeInView>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t.profile.title}</Text>

          {/* User Info */}
          <View style={styles.section}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={40}
                  color={colors.neonGreen}
                />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Premium Status */}
          <View style={styles.section}>
            <View style={styles.premiumCard}>
              <View style={styles.premiumHeader}>
                <Text style={styles.premiumTitle}>Premium Status</Text>
                <Text style={[styles.premiumStatus, { color: premiumStatusColor }]}>
                  {premiumStatusText}
                </Text>
              </View>
              {premiumExpiryText && (
                <Text style={styles.premiumExpiry}>{premiumExpiryText}</Text>
              )}
              {!isPremium && (
                <Pressable style={styles.premiumButton} onPress={handleBuyPremium}>
                  <Text style={styles.premiumButtonText}>{t.profile.premium}</Text>
                </Pressable>
              )}
              {!isLifetimePremium && (
                <View style={styles.promoHint}>
                  <IconSymbol
                    ios_icon_name="info.circle.fill"
                    android_material_icon_name="info"
                    size={20}
                    color="#FFD93D"
                  />
                  <Text style={styles.promoHintText}>
                    Tipp: Nutze den Code "EASY2030" für Lifetime Premium!
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <SettingsItem
              iosIcon="globe"
              androidIcon="language"
              iconColor={colors.neonGreen}
              title={`${t.profile.language}: ${language}`}
              onPress={handleLanguageChange}
            />
            <SettingsItem
              iosIcon="ticket.fill"
              androidIcon="confirmation-number"
              iconColor={colors.neonGreen}
              title={t.profile.promoCode}
              onPress={() => setShowPromoCodeModal(true)}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <SettingsItem
              iosIcon="envelope.fill"
              androidIcon="email"
              iconColor={colors.neonGreen}
              title={t.profile.support}
              onPress={handleSupport}
            />
            <SettingsItem
              iosIcon="exclamationmark.triangle.fill"
              androidIcon="bug-report"
              iconColor="#FF6B6B"
              title={t.profile.bugReport}
              onPress={sendBugReport}
            />
            <SettingsItem
              iosIcon="lightbulb.fill"
              androidIcon="lightbulb"
              iconColor="#FFD93D"
              title={t.profile.suggestion}
              onPress={handleSuggestion}
            />
            <SettingsItem
              iosIcon="heart.fill"
              androidIcon="favorite"
              iconColor="#FF6B9D"
              title={t.profile.donation}
              onPress={processDonation}
            />
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <SettingsItem
              iosIcon="doc.text.fill"
              androidIcon="description"
              iconColor="#999"
              title={t.profile.terms}
              onPress={handleLegalPress}
            />
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <SettingsItem
              iosIcon="trash.fill"
              androidIcon="delete"
              iconColor={colors.red}
              title={t.profile.deleteAccount}
              onPress={handleDeleteAccount}
            />
            <SettingsItem
              iosIcon="rectangle.portrait.and.arrow.right.fill"
              androidIcon="logout"
              iconColor={colors.red}
              title={t.profile.logout}
              onPress={handleLogout}
            />
          </View>
        </ScrollView>

        {/* Premium Modal */}
        <PremiumPaywallModal
          visible={showPremiumModal}
          onClose={handlePremiumClose}
          onPurchase={handlePurchasePremium}
        />

        {/* Promo Code Modal */}
        <Modal
          visible={showPromoCodeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPromoCodeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Promo-Code einlösen</Text>
              <Text style={styles.modalSubtitle}>
                Gib deinen Promo-Code ein, um Premium zu aktivieren
              </Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. EASY2030"
                placeholderTextColor="#666"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <View style={styles.codeHint}>
                <IconSymbol
                  ios_icon_name="sparkles"
                  android_material_icon_name="stars"
                  size={16}
                  color="#FFD93D"
                />
                <Text style={styles.codeHintText}>
                  Tipp: "EASY2030" = Lifetime Premium!
                </Text>
              </View>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowPromoCodeModal(false);
                    setPromoCode('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={handleRedeemCode}>
                  <Text style={styles.modalButtonText}>Einlösen</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Legal Modal */}
        <Modal
          visible={showLegalModal}
          transparent
          animationType="fade"
          onRequestClose={closeLegalModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.legalModalContent}>
              <View style={styles.legalModalHeader}>
                <Text style={styles.legalModalTitle}>{t.legal.modalTitle}</Text>
                <Pressable onPress={closeLegalModal}>
                  <MaterialIcons name="close" size={24} color={colors.white} />
                </Pressable>
              </View>
              <ScrollView style={styles.legalScrollView}>
                <Text style={styles.legalSectionTitle}>{t.legal.termsTitle}</Text>
                <Text style={styles.legalText}>{t.legal.termsContent}</Text>
                <View style={styles.legalDivider} />
                <Text style={styles.legalSectionTitle}>{t.legal.privacyTitle}</Text>
                <Text style={styles.legalText}>{t.legal.privacyContent}</Text>
                <View style={styles.legalDivider} />
                <Text style={styles.legalSectionTitle}>{t.legal.agbTitle}</Text>
                <Text style={styles.legalText}>{t.legal.agbContent}</Text>
                <View style={styles.legalDivider} />
                <Text style={styles.legalSectionTitle}>{t.legal.impressumTitle}</Text>
                <Text style={styles.legalText}>{t.legal.impressumContent}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </FadeInView>
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
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginTop: 20,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999',
  },
  premiumCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  premiumStatus: {
    fontSize: 16,
    fontWeight: '800',
  },
  premiumExpiry: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  premiumButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
  promoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  promoHintText: {
    fontSize: 13,
    color: '#FFD93D',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  codeHintText: {
    fontSize: 13,
    color: '#FFD93D',
    fontWeight: '600',
    marginLeft: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
  cancelButtonText: {
    color: colors.white,
  },
  legalModalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    height: '90%',
    overflow: 'hidden',
  },
  legalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  legalModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  legalScrollView: {
    flex: 1,
    padding: 20,
  },
  legalSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginTop: 16,
    marginBottom: 12,
  },
  legalText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    opacity: 0.9,
  },
  legalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
});
