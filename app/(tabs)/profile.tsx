
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";
import { authenticatedGet, authenticatedPatch } from "@/utils/api";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface UserProfile {
  id: string;
  email: string;
  name: string;
  premiumStatus: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, fetchUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Fetch user profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log("[Profile] Fetching user profile from backend...");
      const data = await authenticatedGet<UserProfile>("/api/user/profile");
      console.log("[Profile] Successfully loaded user profile:", data);
      setProfile(data);
      setNewName(data.name || "");
    } catch (error) {
      console.error("[Profile] Failed to load profile:", error);
      Alert.alert("Fehler", "Profil konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert("Fehler", "Name darf nicht leer sein");
      return;
    }

    try {
      console.log("[Profile] Updating profile name to:", newName.trim());
      const updatedProfile = await authenticatedPatch<UserProfile>("/api/user/profile", {
        name: newName.trim(),
      });
      console.log("[Profile] Successfully updated profile:", updatedProfile);
      setProfile(updatedProfile);
      setEditingName(false);
      // Refresh auth context user
      await fetchUser();
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Erfolg", "Name wurde aktualisiert");
    } catch (error) {
      console.error("[Profile] Failed to update name:", error);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Fehler", "Name konnte nicht aktualisiert werden");
    }
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    color = colors.neonGreen,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    color?: string;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        style={[styles.menuItem, animatedStyle]}
        onPressIn={() => {
          scale.value = withSpring(0.95);
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
      >
        <View style={styles.menuItemLeft}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
            color={color}
          />
          <Text style={styles.menuItemText}>{title}</Text>
        </View>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="arrow-forward"
          size={20}
          color={colors.white}
        />
      </AnimatedPressable>
    );
  };

  const handleLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await signOut();
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Lädt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={48}
                color={colors.black}
              />
            </View>
          </View>
          
          {editingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Name eingeben"
                placeholderTextColor={colors.white + '60'}
                autoFocus
              />
              <View style={styles.nameEditButtons}>
                <Pressable
                  style={[styles.nameEditButton, styles.nameEditButtonCancel]}
                  onPress={() => {
                    setEditingName(false);
                    setNewName(profile?.name || "");
                  }}
                >
                  <Text style={styles.nameEditButtonText}>Abbrechen</Text>
                </Pressable>
                <Pressable
                  style={[styles.nameEditButton, styles.nameEditButtonSave]}
                  onPress={handleUpdateName}
                >
                  <Text style={[styles.nameEditButtonText, { color: colors.black }]}>Speichern</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.username}>{profile?.name || profile?.email || 'Benutzer'}</Text>
              <Pressable onPress={() => setEditingName(true)}>
                <Text style={styles.subtitle}>Tippe um Namen zu ändern</Text>
              </Pressable>
            </>
          )}
          
          <Text style={styles.email}>{profile?.email}</Text>
          <Text style={styles.premium}>
            Premium: {profile?.premiumStatus ? 'Ja' : 'Nein'}
          </Text>
          {profile?.emailVerified && (
            <View style={styles.verifiedBadge}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="verified"
                size={16}
                color={colors.neonGreen}
              />
              <Text style={styles.verifiedText}>E-Mail verifiziert</Text>
            </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          <MenuItem
            icon="logout"
            title="Ausloggen"
            onPress={handleLogout}
            color={colors.neonGreen}
          />
          <MenuItem
            icon="language"
            title="Sprache ändern: English"
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Change language');
            }}
            color={colors.neonGreen}
          />
          <MenuItem
            icon="refresh"
            title="Premium Wiederherstellen"
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Restore premium');
            }}
            color={colors.neonGreen}
          />
          <MenuItem
            icon="star"
            title="Premium Kaufen"
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Buy premium');
            }}
            color={colors.neonGreen}
          />
          <MenuItem
            icon="description"
            title="AGB"
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Terms');
            }}
            color={colors.neonGreen}
          />
          <MenuItem
            icon="security"
            title="Nutzungsbedingungen"
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Terms of use');
            }}
            color={colors.neonGreen}
          />
          <MenuItem
            icon="lock"
            title="Datenschutz"
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Privacy');
            }}
            color={colors.neonGreen}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neonGreen,
    opacity: 0.8,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  email: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.6,
    marginBottom: 8,
  },
  premium: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.darkGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.neonGreen,
    fontWeight: '600',
  },
  nameEditContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '700',
  },
  nameEditButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  nameEditButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nameEditButtonCancel: {
    backgroundColor: colors.darkGray,
  },
  nameEditButtonSave: {
    backgroundColor: colors.neonGreen,
  },
  nameEditButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
