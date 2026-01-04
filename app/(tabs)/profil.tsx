
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import React, { useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface SettingsItemProps {
  icon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SettingsItem({ icon, iconColor, title, onPress }: SettingsItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <AnimatedPressable style={[styles.settingsItem, animatedStyle]} onPress={handlePress}>
      <View style={styles.settingsItemContent}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={icon}
          size={24}
          color={iconColor}
        />
        <Text style={styles.settingsItemText}>{title}</Text>
      </View>
    </AnimatedPressable>
  );
}

export default function ProfilScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Fehler', 'Abmeldung fehlgeschlagen');
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Sprache', 'Sprachauswahl wird bald verfügbar sein');
  };

  const handleRestorePremium = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium wiederherstellen', 'Premium-Käufe werden wiederhergestellt...');
  };

  const handleBuyPremium = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setPremiumModalVisible(true);
  };

  const handlePurchase = (type: 'onetime' | 'monthly') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPremiumModalVisible(false);
    Alert.alert(
      'Kauf',
      type === 'onetime' 
        ? 'Einmalige Zahlung von CHF 10.00 wird verarbeitet...' 
        : 'Monatliches Abo von CHF 1.00/Monat wird verarbeitet...'
    );
  };

  const handleAGB = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('AGB', 'Allgemeine Geschäftsbedingungen');
  };

  const handleTerms = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Nutzungsbedingungen', 'Nutzungsbedingungen');
  };

  const handlePrivacy = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Datenschutz', 'Datenschutzerklärung');
  };

  const handleEditName = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Namen bearbeiten', 'Namensänderung wird bald verfügbar sein');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <Pressable style={styles.userCard} onPress={handleEditName}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Benutzer'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium: Ja</Text>
            </View>
          </View>
        </Pressable>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          <SettingsItem
            icon="language"
            iconColor={colors.white}
            title="Sprache"
            onPress={handleLanguageChange}
          />
          <SettingsItem
            icon="star"
            iconColor={colors.neonGreen}
            title="Premium kaufen"
            onPress={handleBuyPremium}
          />
          <SettingsItem
            icon="restore"
            iconColor={colors.white}
            title="Premium wiederherstellen"
            onPress={handleRestorePremium}
          />
          <SettingsItem
            icon="description"
            iconColor={colors.white}
            title="Nutzungsbedingungen"
            onPress={handleTerms}
          />
          <SettingsItem
            icon="privacy-tip"
            iconColor={colors.white}
            title="Datenschutz"
            onPress={handlePrivacy}
          />
          <SettingsItem
            icon="gavel"
            iconColor={colors.white}
            title="AGB"
            onPress={handleAGB}
          />
          <SettingsItem
            icon="logout"
            iconColor={colors.red}
            title="Abmelden"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Premium Modal */}
      <Modal
        visible={premiumModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPremiumModalVisible(false)}
        >
          <Pressable style={styles.premiumModal} onPress={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <Pressable
              style={styles.closeButton}
              onPress={() => setPremiumModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            {/* Star Icon */}
            <View style={styles.starIcon}>
              <Text style={styles.starEmoji}>⭐</Text>
            </View>

            {/* Title */}
            <Text style={styles.premiumTitle}>Premium Kaufen</Text>

            {/* Subtitle */}
            <Text style={styles.premiumSubtitle}>
              Erhalte unbegrenzte App-Funktionen:
            </Text>

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Unbegrenzte Abo Counter</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Unbegrenzte Ausgabenliste</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Unbegrenzte Monate</Text>
              </View>
            </View>

            {/* One-time Payment Option */}
            <View style={styles.paymentOption}>
              <Text style={styles.paymentTitle}>Einmalige Zahlung</Text>
              <Text style={styles.paymentPrice}>CHF 10.00</Text>
              <Pressable
                style={styles.paymentButton}
                onPress={() => handlePurchase('onetime')}
              >
                <Text style={styles.paymentButtonText}>Bezahlen</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <Text style={styles.divider}>ODER</Text>

            {/* Monthly Subscription Option */}
            <View style={styles.paymentOption}>
              <Text style={styles.paymentTitle}>Monatliches Abo</Text>
              <Text style={styles.paymentPrice}>CHF 1.00/Monat</Text>
              <Pressable
                style={styles.paymentButton}
                onPress={() => handlePurchase('monthly')}
              >
                <Text style={styles.paymentButtonText}>Bezahlen</Text>
              </Pressable>
            </View>
          </Pressable>
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  userCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.black,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    opacity: 0.7,
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 0.5,
  },
  settingsSection: {
    gap: 12,
  },
  settingsItem: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
  },
  starIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  starEmoji: {
    fontSize: 48,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  premiumSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  featuresList: {
    marginBottom: 24,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureBullet: {
    fontSize: 18,
    color: colors.neonGreen,
    fontWeight: '800',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  paymentOption: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  paymentPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neonGreen,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  paymentButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 0.5,
  },
  divider: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginVertical: 8,
    opacity: 0.5,
  },
});
