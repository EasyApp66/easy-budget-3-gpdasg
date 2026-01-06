
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

const CustomTabBar = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

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
    setShowModal(true);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Share functionality
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!modalName.trim() || !modalAmount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }
    // Save logic here
    setShowModal(false);
    setModalName('');
    setModalAmount('');
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModal(false);
    setModalName('');
    setModalAmount('');
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
        <Animated.View style={[styles.tabContent, animatedStyle]}>
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
      style={styles.addButtonContainer}
    >
      <Animated.View style={[styles.addButton, addAnimatedStyle]}>
        <MaterialIcons name="add" size={32} color={colors.black} />
      </Animated.View>
    </Pressable>
  );

  return (
    <>
      <View style={[styles.tabBarContainer, { bottom: insets.bottom + 30 }]}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View style={styles.tabBar}>
            <TabButton
              androidIcon="attach-money"
              route="/budget"
              label="Budget"
              scaleValue={budgetScale}
            />
            <TabButton
              androidIcon="sync"
              route="/abos"
              label="Abos"
              scaleValue={abosScale}
            />
            <TabButton
              androidIcon="person"
              route="/profil"
              label="Profil"
              scaleValue={profilScale}
            />
            <AddButton />
          </View>
        </BlurView>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {pathname === '/budget' ? 'NEUE AUSGABE' : 'NEUES ABO'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={pathname === '/budget' ? 'Name (z.B. ESSEN)' : 'Name (z.B. NETFLIX)'}
              placeholderTextColor="#666"
              value={modalName}
              onChangeText={setModalName}
            />

            <TextInput
              style={styles.input}
              placeholder="Betrag"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={modalAmount}
              onChangeText={setModalAmount}
            />

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Hinzufügen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  blurContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addButtonContainer: {
    marginLeft: 8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '98%',
    minWidth: 340,
    maxWidth: 600,
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 28,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 24,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    minHeight: 56,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    marginBottom: 0,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    minHeight: 56,
  },
  cancelButton: {
    backgroundColor: '#000000',
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  saveButtonText: {
    color: colors.black,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
      <CustomTabBar />
    </>
  );
}
