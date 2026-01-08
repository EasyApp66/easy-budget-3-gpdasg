
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
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as MailComposer from 'expo-mail-composer';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import { usePremium } from '@/hooks/usePremium';

const colors = {
  black: '#000000',
  white: '#FFFFFF',
  neonGreen: '#BFFE84',
  darkGray: '#232323',
  red: '#C43C3E',
};

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
  
  // Modal states
  const [bugModalVisible, setBugModalVisible] = useState(false);
  const [donateModalVisible, setDonateModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  
  // Form states
  const [bugDescription, setBugDescription] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(5);
  const [customDonation, setCustomDonation] = useState('');
  const [newUsername, setNewUsername] = useState('');

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
    await setLanguage(newLang);
  };

  const handleBuyPremium = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setPremiumModalVisible(true);
  };

  const handlePurchasePremium = (type: 'onetime' | 'monthly') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: Backend Integration - Process premium purchase via Stripe
    console.log(`Premium purchase: ${type}`);
    Alert.alert(t.common.success, 'Premium activated! (Placeholder - Stripe Integration coming)');
    setPremiumModalVisible(false);
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
      setUsername(newUsername.trim());
      setEditNameModalVisible(false);
    }
  };

  const handleBugReport = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBugModalVisible(true);
  };

  const handleDonation = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['support@easybudget.app'],
          subject: `Bug Report - EASY BUDGET`,
          body: `Bug Description:\n\n${bugDescription}\n\n---\nUser: ${username}\nVersion: 1.0.0\nPlatform: ${Platform.OS}`,
        });
      } else {
        Alert.alert(t.common.error, language === 'DE' ? 'E-Mail ist auf diesem Gerät nicht verfügbar.' : 'Email is not available on this device.');
      }
    } catch (error) {
      console.error('Error sending bug report:', error);
      Alert.alert(t.common.error, language === 'DE' ? 'Fehler beim Senden des Bug Reports.' : 'Error sending bug report.');
    }
    
    setBugModalVisible(false);
    setBugDescription('');
  };

  const processDonation = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const amount = customDonation || selectedDonation.toString();
    Alert.alert(
      language === 'DE' ? 'Danke!' : 'Thank you!',
      language === 'DE' ? `Deine Spende von CHF ${amount}.00 wird verarbeitet.` : `Your donation of CHF ${amount}.00 is being processed.`,
      [
        {
          text: t.common.ok,
          onPress: () => {
            // TODO: Backend Integration - Process donation payment
            console.log(`Process donation: CHF ${amount}`);
            setDonateModalVisible(false);
            setCustomDonation('');
            setSelectedDonation(5);
          },
        },
      ]
    );
  };

  const handleSupport = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['support@easybudget.app'],
          subject: language === 'DE' ? 'Support Anfrage - EASY BUDGET' : 'Support Request - EASY BUDGET',
          body: language === 'DE' ? `Hallo Support Team,\n\n` : `Hello Support Team,\n\n`,
        });
      } else {
        Alert.alert(t.common.error, language === 'DE' ? 'E-Mail ist auf diesem Gerät nicht verfügbar.' : 'Email is not available on this device.');
      }
    } catch (error) {
      console.error('Error opening mail composer:', error);
    }
  };

  const handleSuggestion = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['feedback@easybudget.app'],
          subject: language === 'DE' ? 'Vorschlag - EASY BUDGET' : 'Suggestion - EASY BUDGET',
          body: language === 'DE' ? `Mein Vorschlag:\n\n` : `My suggestion:\n\n`,
        });
      } else {
        Alert.alert(t.common.error, language === 'DE' ? 'E-Mail ist auf diesem Gerät nicht verfügbar.' : 'Email is not available on this device.');
      }
    } catch (error) {
      console.error('Error opening mail composer:', error);
    }
  };

  const handleTextPage = (title: string, content: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
          <Text style={styles.premiumStatus}>
            Premium: {isPremium ? (language === 'DE' ? 'Ja' : 'Yes') : (language === 'DE' ? 'Nein' : 'No')}
          </Text>
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
  premiumStatus: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
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
  modalTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
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
