
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';
import { Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 24,
    paddingBottom: 20,
    width: '95%',
    maxWidth: 440,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: colors.white,
    marginBottom: 14,
    fontWeight: '600',
    minHeight: 56,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 0,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButton: {
    backgroundColor: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelButtonText: {
    color: colors.white,
  },
  saveButtonText: {
    color: colors.black,
  },
});

function CustomTabBar() {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const budgetScale = useSharedValue(1);
  const abosScale = useSharedValue(1);
  const profilScale = useSharedValue(1);
  const addScale = useSharedValue(1);

  const budgetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: budgetScale.value }],
  }));

  const abosAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: abosScale.value }],
  }));

  const profilAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profilScale.value }],
  }));

  const addAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const isActive = (route: string) => {
    return pathname === route;
  };

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      Alert.alert('Teilen', 'Teilen-Funktion wird implementiert');
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }
    setModalVisible(false);
    setName('');
    setAmount('');
    Alert.alert('Erfolg', 'Eintrag hinzugefügt');
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    setName('');
    setAmount('');
  };

  const TabButton = ({ 
    androidIcon, 
    route, 
    label,
    scaleValue 
  }: { 
    androidIcon: string;
    route: string; 
    label: string;
    scaleValue: Animated.SharedValue<number>;
  }) => {
    const active = isActive(route);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));

    return (
      <Pressable
        onPress={() => handleTabPress(route)}
        onPressIn={() => {
          scaleValue.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1);
        }}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <MaterialIcons
            name={androidIcon as any}
            size={24}
            color={active ? colors.neonGreen : colors.white}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: active ? colors.neonGreen : colors.white },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => (
    <Pressable
      onPress={handleAddPress}
      onPressIn={() => {
        addScale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        addScale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.addButton, addAnimatedStyle]}>
        <MaterialIcons name="add" size={32} color={colors.black} />
      </Animated.View>
    </Pressable>
  );

  const currentRoute = pathname.split('/').pop();
  const modalTitle = currentRoute === 'budget' ? 'Neue Ausgabe' : 'Neues Abo';
  const namePlaceholder = currentRoute === 'budget' ? 'Name (z.B. ESSEN)' : 'Name (z.B. NETFLIX)';

  return (
    <>
      <View style={[styles.blurContainer, { paddingBottom: insets.bottom }]}>
        <BlurView intensity={80} tint="dark" style={styles.tabBar}>
          <TabButton androidIcon="attach-money" route="/budget" label="Budget" scaleValue={budgetScale} />
          <TabButton androidIcon="sync" route="/abos" label="Abos" scaleValue={abosScale} />
          <TabButton androidIcon="person" route="/profil" label="Profil" scaleValue={profilScale} />
          <AddButton />
        </BlurView>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={namePlaceholder}
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Betrag"
              placeholderTextColor="#666"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Abbrechen
                </Text>
              </Pressable>
              
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Hinzufügen
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="budget" />
      <Tabs.Screen name="abos" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
