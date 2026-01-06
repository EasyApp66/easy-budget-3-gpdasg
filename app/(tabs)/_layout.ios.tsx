
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { useRouter, usePathname } from 'expo-router';
import React, { useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  neonGreen: '#BFFE84',
  black: '#000000',
  white: '#FFFFFF',
  darkGray: '#232323',
  red: '#C43C3E',
  inactiveGray: '#666666',
};

const TABS = [
  { name: 'budget', route: '/budget', androidIcon: 'attach-money', label: 'Budget' },
  { name: 'abos', route: '/abos', androidIcon: 'sync', label: 'Abos' },
  { name: 'profil', route: '/profil', androidIcon: 'person', label: 'Profil' },
];

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'subscription'>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Initialize shared values at component top level
  const scaleValues = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];
  const addButtonScale = useSharedValue(1);

  const isActive = (route: string) => pathname === route;

  const handleTabPress = (route: string, scaleValue: Animated.SharedValue<number>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (pathname === '/profil') {
      handleShare();
    } else {
      setModalType(pathname === '/budget' ? 'expense' : 'subscription');
      setModalVisible(true);
    }
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync('https://easybudget.app', {
          dialogTitle: 'EASY BUDGET teilen',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    setName('');
    setAmount('');
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
        onPress={() => handleTabPress(route, scaleValue)}
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
            color={active ? COLORS.neonGreen : COLORS.inactiveGray}
          />
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: addButtonScale.value }],
    }));

    return (
      <Pressable
        onPress={handleAddPress}
        onPressIn={() => {
          addButtonScale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          addButtonScale.value = withSpring(1);
        }}
        style={styles.addButtonContainer}
      >
        <Animated.View style={[styles.addButton, animatedStyle]}>
          <Text style={styles.addButtonText}>+</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <>
      <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
        <BlurView intensity={80} tint="dark" style={styles.blurView}>
          <View style={styles.tabBar}>
            {TABS.map((tab, index) => (
              <TabButton
                key={tab.name}
                androidIcon={tab.androidIcon}
                route={tab.route}
                label={tab.label}
                scaleValue={scaleValues[index]}
              />
            ))}
            <AddButton />
          </View>
        </BlurView>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {modalType === 'expense' ? 'Neue Ausgabe' : 'Neues Abo'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder={modalType === 'expense' ? 'Name (z.B. ESSEN)' : 'Name (z.B. NETFLIX)'}
              placeholderTextColor="#555555"
              value={name}
              onChangeText={setName}
              autoCapitalize="characters"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Betrag"
              placeholderTextColor="#555555"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancel}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </Pressable>
              
              <Pressable
                style={styles.saveButton}
                onPress={handleSave}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={styles.saveButtonText}>Hinzufügen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurView: {
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(35, 35, 35, 0.8)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContainer: {
    marginLeft: 8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 28,
    padding: 36,
    width: '95%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 28,
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  input: {
    backgroundColor: COLORS.black,
    borderRadius: 18,
    padding: 22,
    fontSize: 17,
    color: COLORS.white,
    marginBottom: 18,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.neonGreen,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
        tabBar={() => <CustomTabBar />}
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
    </>
  );
}
