
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
import * as MailComposer from 'expo-mail-composer';

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
  const [username, setUsername] = useState('mirosnic.ivan');
  const [isPremium, setIsPremium] = useState(true);
  const [language, setLanguage] = useState<'Deutsch' | 'English'>('Deutsch');
  
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
    Alert.alert('Ausloggen', 'Möchtest du dich wirklich ausloggen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Ausloggen',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/welcome');
        },
      },
    ]);
  };

  const handleLanguageChange = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newLang = language === 'Deutsch' ? 'English' : 'Deutsch';
    setLanguage(newLang);
    Alert.alert(
      'Sprache geändert',
      `Die App-Sprache wurde zu ${newLang} geändert. Diese Funktion wird in einer zukünftigen Version vollständig implementiert.`
    );
  };

  const handleRestorePremium = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium wiederherstellen', 'Käufe werden wiederhergestellt...', [
      {
        text: 'OK',
        onPress: () => {
          // TODO: Backend Integration - Restore premium purchases
          console.log('Restore premium purchases');
        },
      },
    ]);
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
    const price = type === 'onetime' ? '9.99' : '2.99';
    Alert.alert(
      'Premium kaufen',
      `${type === 'onetime' ? 'Einmaliger Kauf' : 'Monatliches Abo'} für CHF ${price}?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Kaufen',
          onPress: () => {
            // TODO: Backend Integration - Process premium purchase
            console.log(`Purchase premium: ${type}`);
            setIsPremium(true);
            setPremiumModalVisible(false);
            Alert.alert('Erfolg!', 'Premium wurde aktiviert!');
          },
        },
      ]
    );
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
      Alert.alert('Fehler', 'Bitte beschreibe den Fehler.');
      return;
    }

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['support@easybudget.app'],
          subject: 'Bug Report - EASY BUDGET',
          body: `Bug Beschreibung:\n\n${bugDescription}\n\n---\nUser: ${username}\nVersion: 1.0.0\nPlatform: ${Platform.OS}`,
        });
      } else {
        Alert.alert('Fehler', 'E-Mail ist auf diesem Gerät nicht verfügbar.');
      }
    } catch (error) {
      console.error('Error sending bug report:', error);
      Alert.alert('Fehler', 'Fehler beim Senden des Bug Reports.');
    }
    
    setBugModalVisible(false);
    setBugDescription('');
  };

  const processDonation = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const amount = customDonation || selectedDonation.toString();
    Alert.alert('Danke!', `Deine Spende von CHF ${amount}.00 wird verarbeitet.`, [
      {
        text: 'OK',
        onPress: () => {
          // TODO: Backend Integration - Process donation payment
          console.log(`Process donation: CHF ${amount}`);
          setDonateModalVisible(false);
          setCustomDonation('');
          setSelectedDonation(5);
        },
      },
    ]);
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
          subject: 'Support Anfrage - EASY BUDGET',
          body: `Hallo Support Team,\n\n`,
        });
      } else {
        Alert.alert('Fehler', 'E-Mail ist auf diesem Gerät nicht verfügbar.');
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
          subject: 'Vorschlag - EASY BUDGET',
          body: `Mein Vorschlag:\n\n`,
        });
      } else {
        Alert.alert('Fehler', 'E-Mail ist auf diesem Gerät nicht verfügbar.');
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
              color={colors.white} 
            />
          </View>
          <Pressable onPress={handleEditName}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.usernameHint}>Tippe um Namen zu ändern</Text>
          </Pressable>
          <Text style={styles.premiumStatus}>Premium: {isPremium ? 'Ja' : 'Nein'}</Text>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsList}>
          <SettingsItem
            iosIcon="arrow.right.square"
            androidIcon="exit-to-app"
            iconColor={colors.neonGreen}
            title="Ausloggen"
            onPress={handleLogout}
          />
          <SettingsItem
            iosIcon="globe"
            androidIcon="language"
            iconColor={colors.neonGreen}
            title={`Sprache ändern: ${language}`}
            onPress={handleLanguageChange}
          />
          <SettingsItem
            iosIcon="arrow.clockwise"
            androidIcon="refresh"
            iconColor={colors.neonGreen}
            title="Premium Wiederherstellen"
            onPress={handleRestorePremium}
          />
          <SettingsItem
            iosIcon="star.fill"
            androidIcon="star"
            iconColor={colors.neonGreen}
            title="Premium Kaufen"
            onPress={handleBuyPremium}
          />
          <SettingsItem
            iosIcon="doc.text"
            androidIcon="description"
            iconColor={colors.white}
            title="AGB"
            onPress={() => handleTextPage('AGB', 'Allgemeine Geschäftsbedingungen\n\nHier stehen die AGBs...')}
          />
          <SettingsItem
            iosIcon="shield"
            androidIcon="shield"
            iconColor={colors.white}
            title="Nutzungsbedingungen"
            onPress={() => handleTextPage('Nutzungsbedingungen', 'Nutzungsbedingungen\n\nHier stehen die Nutzungsbedingungen...')}
          />
          <SettingsItem
            iosIcon="lock.shield"
            androidIcon="lock"
            iconColor={colors.white}
            title="Datenschutz"
            onPress={() => handleTextPage('Datenschutz', 'Datenschutzerklärung\n\nHier steht die Datenschutzerklärung...')}
          />
          <SettingsItem
            iosIcon="info.circle"
            androidIcon="info"
            iconColor={colors.white}
            title="Impressum"
            onPress={() => handleTextPage('Impressum', 'Impressum\n\nEASY BUDGET 3.0\nVersion 1.0.0')}
          />
          <SettingsItem
            iosIcon="envelope"
            androidIcon="email"
            iconColor={colors.white}
            title="Support"
            onPress={handleSupport}
          />
          <SettingsItem
            iosIcon="lightbulb"
            androidIcon="lightbulb-outline"
            iconColor={colors.white}
            title="Vorschlag"
            onPress={handleSuggestion}
          />
          <SettingsItem
            iosIcon="ant"
            androidIcon="bug-report"
            iconColor={colors.neonGreen}
            title="Bug Melden"
            onPress={handleBugReport}
          />
          <SettingsItem
            iosIcon="heart.fill"
            androidIcon="favorite"
            iconColor={colors.red}
            title="Donation"
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
            <Text style={styles.modalTitle}>Namen ändern</Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Neuer Name"
              placeholderTextColor="#666"
              autoFocus
            />
            <Pressable style={styles.primaryButton} onPress={saveNewUsername}>
              <Text style={styles.primaryButtonText}>Speichern</Text>
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

            <Text style={styles.modalTitle}>Bug Melden</Text>

            <TextInput
              style={styles.bugInput}
              value={bugDescription}
              onChangeText={setBugDescription}
              placeholder="Beschreibe den Fehler..."
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
              <Text style={styles.sendButtonText}>Senden</Text>
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

            <Text style={styles.modalTitle}>Donate</Text>
            <Text style={styles.donateSubtitle}>Support the development of the app</Text>

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
              placeholder="CHF Custom amount"
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
                Donate CHF {customDonation || selectedDonation}.00
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Premium Purchase Modal */}
      <Modal
        visible={premiumModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPremiumModalVisible(false)}>
          <View style={styles.premiumModal}>
            <Pressable style={styles.closeButton} onPress={() => setPremiumModalVisible(false)}>
              <IconSymbol 
                ios_icon_name="xmark" 
                android_material_icon_name="close"
                size={24} 
                color={colors.white} 
              />
            </Pressable>

            <View style={styles.starIconContainer}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star"
                size={40} 
                color={colors.neonGreen} 
              />
            </View>

            <Text style={styles.modalTitle}>Premium Kaufen</Text>
            <Text style={styles.premiumSubtitle}>Schalte alle Premium-Funktionen frei</Text>

            <Pressable 
              style={styles.premiumOption} 
              onPress={() => handlePurchasePremium('onetime')}
            >
              <View>
                <Text style={styles.premiumOptionTitle}>Einmaliger Kauf</Text>
                <Text style={styles.premiumOptionDesc}>Lebenslanger Zugang</Text>
              </View>
              <Text style={styles.premiumOptionPrice}>CHF 9.99</Text>
            </Pressable>

            <Pressable 
              style={styles.premiumOption} 
              onPress={() => handlePurchasePremium('monthly')}
            >
              <View>
                <Text style={styles.premiumOptionTitle}>Monatliches Abo</Text>
                <Text style={styles.premiumOptionDesc}>Jederzeit kündbar</Text>
              </View>
              <Text style={styles.premiumOptionPrice}>CHF 2.99/Monat</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  premiumModal: {
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
  starIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a20',
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
  premiumSubtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
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
  premiumOption: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumOptionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 5,
  },
  premiumOptionDesc: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  premiumOptionPrice: {
    color: colors.neonGreen,
    fontSize: 18,
    fontWeight: '800',
  },
});
