
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n/translations";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const theme = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await setLanguage(newLanguage);
      setShowLanguageModal(false);
    } catch (error) {
      Alert.alert(t.common.error, 'Failed to change language');
    }
  };

  const MenuItem = ({ icon, title, onPress, color }: {
    icon: string;
    title: string;
    onPress: () => void;
    color?: string;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      onPress();
    };

    return (
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.menuItem, animatedStyle]}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
            color={color || theme.colors.text}
          />
          <Text style={[styles.menuText, { color: color || theme.colors.text }]}>
            {title}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        {/* Profile Header with BLACK icon in GREEN circle */}
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <View style={styles.iconCircle}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={50} 
              color="#000000"
            />
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>John Doe</Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>john.doe@example.com</Text>
        </GlassView>

        {/* Settings Section */}
        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <MenuItem
            icon="language"
            title={`${t.profile.language}: ${language}`}
            onPress={() => setShowLanguageModal(true)}
          />
          <MenuItem
            icon="star"
            title={t.profile.premium}
            onPress={() => {}}
          />
          <MenuItem
            icon="support"
            title={t.profile.support}
            onPress={() => {}}
          />
          <MenuItem
            icon="bug-report"
            title={t.profile.bugReport}
            onPress={() => {}}
          />
          <MenuItem
            icon="logout"
            title={t.profile.logout}
            onPress={() => {}}
            color="#C43C3E"
          />
        </GlassView>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t.profile.language}
            </Text>
            
            <Pressable
              style={[
                styles.languageOption,
                language === 'DE' && styles.languageOptionSelected
              ]}
              onPress={() => handleLanguageChange('DE')}
            >
              <Text style={[
                styles.languageText,
                { color: theme.colors.text },
                language === 'DE' && styles.languageTextSelected
              ]}>
                DE
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.languageOption,
                language === 'EN' && styles.languageOptionSelected
              ]}
              onPress={() => handleLanguageChange('EN')}
            >
              <Text style={[
                styles.languageText,
                { color: theme.colors.text },
                language === 'EN' && styles.languageTextSelected
              ]}>
                EN
              </Text>
            </Pressable>

            <Pressable
              style={styles.closeButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeButtonText}>{t.common.close}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#BFFE84',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  languageOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  languageOptionSelected: {
    borderColor: '#BFFE84',
    backgroundColor: 'rgba(191, 254, 132, 0.1)',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageTextSelected: {
    color: '#BFFE84',
  },
  closeButton: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#232323',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
