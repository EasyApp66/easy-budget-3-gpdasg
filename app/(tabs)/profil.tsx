
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingsItemProps {
  icon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
}

const SettingsItem = ({ icon, iconColor, title, onPress }: SettingsItemProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.settingsItem, animatedStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={handlePress}
    >
      <View style={styles.settingsItemLeft}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={icon}
          size={24}
          color={iconColor}
        />
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
      <IconSymbol
        ios_icon_name="chevron.right"
        android_material_icon_name="chevron-right"
        size={20}
        color={colors.white + '60'}
      />
    </AnimatedPressable>
  );
};

export default function ProfilScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Ausloggen',
      'Möchtest du dich wirklich ausloggen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Ausloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/welcome');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Fehler', 'Ausloggen fehlgeschlagen');
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
    Alert.alert('Sprache ändern', 'Sprachauswahl (wird implementiert)');
  };

  const handleRestorePremium = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium wiederherstellen', 'Wiederherstellung (wird implementiert)');
  };

  const handleBuyPremium = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium kaufen', 'Premium-Kauf (wird implementiert)');
  };

  const handleAGB = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('AGB', 'Allgemeine Geschäftsbedingungen (wird implementiert)');
  };

  const handleTerms = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Nutzungsbedingungen', 'Nutzungsbedingungen (wird implementiert)');
  };

  const handlePrivacy = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Datenschutz', 'Datenschutzerklärung (wird implementiert)');
  };

  const handleEditName = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Namen ändern', 'Namensänderung (wird implementiert)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Pressable style={styles.userCard} onPress={handleEditName}>
          <View style={styles.avatarContainer}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={40}
              color={colors.black}
            />
          </View>
          <Text style={styles.username}>
            {user?.name || user?.email?.split('@')[0] || 'mirosnic.ivan'}
          </Text>
          <Text style={styles.editHint}>Tippe um Namen zu ändern</Text>
          <Text style={styles.premiumStatus}>Premium: Ja</Text>
        </Pressable>

        {/* Settings Items */}
        <View style={styles.settingsList}>
          <SettingsItem
            icon="exit-to-app"
            iconColor={colors.neonGreen}
            title="Ausloggen"
            onPress={handleLogout}
          />
          <SettingsItem
            icon="language"
            iconColor={colors.neonGreen}
            title="Sprache ändern: English"
            onPress={handleLanguageChange}
          />
          <SettingsItem
            icon="refresh"
            iconColor={colors.neonGreen}
            title="Premium Wiederherstellen"
            onPress={handleRestorePremium}
          />
          <SettingsItem
            icon="star"
            iconColor={colors.neonGreen}
            title="Premium Kaufen"
            onPress={handleBuyPremium}
          />
          <SettingsItem
            icon="description"
            iconColor={colors.neonGreen}
            title="AGB"
            onPress={handleAGB}
          />
          <SettingsItem
            icon="shield"
            iconColor={colors.neonGreen}
            title="Nutzungsbedingungen"
            onPress={handleTerms}
          />
          <SettingsItem
            icon="lock"
            iconColor={colors.neonGreen}
            title="Datenschutz"
            onPress={handlePrivacy}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  userCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  editHint: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.6,
    marginBottom: 12,
  },
  premiumStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  settingsList: {
    gap: 12,
  },
  settingsItem: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.3,
  },
});
