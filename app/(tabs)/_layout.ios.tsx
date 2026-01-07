
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

function CustomTabBar() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const budgetScale = useSharedValue(1);
  const abosScale = useSharedValue(1);
  const profilScale = useSharedValue(1);
  const addScale = useSharedValue(1);

  const budgetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: budgetScale.value }],
  }));

  const abosStyle = useAnimatedStyle(() => ({
    transform: [{ scale: abosScale.value }],
  }));

  const profilStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profilScale.value }],
  }));

  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const isActive = (route: string) => {
    return pathname.includes(route);
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
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync('https://example.com');
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (newItemName.trim()) {
      // Save logic here
      setNewItemName('');
      setModalVisible(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewItemName('');
    setModalVisible(false);
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
        onPressIn={() => {
          scaleValue.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1);
        }}
        onPress={() => handleTabPress(route)}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <MaterialIcons
            name={androidIcon as any}
            size={24}
            color={active ? colors.neonGreen : colors.white}
          />
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => (
    <Pressable
      onPressIn={() => {
        addScale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        addScale.value = withSpring(1);
      }}
      onPress={handleAddPress}
      style={styles.addButton}
    >
      <Animated.View style={[styles.addButtonInner, addStyle]}>
        <Text style={styles.addButtonText}>+</Text>
      </Animated.View>
    </Pressable>
  );

  return (
    <>
      <View style={[styles.tabBarContainer, { paddingLeft: insets.left, paddingRight: insets.right }]}>
        <BlurView intensity={80} tint="dark" style={styles.blurView}>
          <View style={styles.tabBarContent}>
            <TabButton androidIcon="attach-money" route="/budget" label="Budget" scaleValue={budgetScale} />
            <TabButton androidIcon="sync" route="/abos" label="Abos" scaleValue={abosScale} />
            <TabButton androidIcon="person" route="/profil" label="Profil" scaleValue={profilScale} />
            <AddButton />
          </View>
        </BlurView>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Neue Ausgabe</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name eingeben"
              placeholderTextColor="#666"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={handleCancel} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Hinzufügen</Text>
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
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={() => <CustomTabBar />}
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 0,
  },
  blurView: {
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabButton: {
    padding: 8,
  },
  addButton: {
    padding: 0,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.black,
    color: colors.white,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.neonGreen,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  modalButtonTextPrimary: {
    color: colors.black,
  },
});
