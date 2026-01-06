
import { BlurView } from 'expo-blur';
import * as Sharing from 'expo-sharing';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import { Text } from 'react-native';
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 0,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.neonGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  plusIcon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH * 0.88,
    maxWidth: 420,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 24,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.black,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: colors.white,
    marginBottom: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'subscription'>('expense');
  const [inputName, setInputName] = useState('');
  const [inputAmount, setInputAmount] = useState('');

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
    
    if (pathname === '/budget') {
      setModalType('expense');
      setModalVisible(true);
    } else if (pathname === '/abos') {
      setModalType('subscription');
      setModalVisible(true);
    } else if (pathname === '/profil') {
      handleShare();
    }
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync('https://easybudget.app', {
          dialogTitle: 'Teile EASY BUDGET',
        });
      } else {
        Alert.alert('Teilen nicht verfügbar', 'Teilen wird auf diesem Gerät nicht unterstützt.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = () => {
    if (!inputName.trim() || !inputAmount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    console.log('Saving:', { type: modalType, name: inputName, amount: inputAmount });
    
    setModalVisible(false);
    setInputName('');
    setInputAmount('');
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    setInputName('');
    setInputAmount('');
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
          scaleValue.value = withSpring(0.85);
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1);
        }}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <MaterialIcons
            name={androidIcon as any}
            size={26}
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
        addScale.value = withSpring(0.85);
      }}
      onPressOut={() => {
        addScale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.addButton, addAnimatedStyle]}>
        <View style={{
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            position: 'absolute',
            width: 20,
            height: 3.5,
            backgroundColor: colors.black,
            borderRadius: 2,
          }} />
          <View style={{
            position: 'absolute',
            width: 3.5,
            height: 20,
            backgroundColor: colors.black,
            borderRadius: 2,
          }} />
        </View>
      </Animated.View>
    </Pressable>
  );

  return (
    <>
      <BlurView
        intensity={80}
        tint="dark"
        style={[
          styles.tabBar,
          styles.blurContainer,
          {
            paddingBottom: insets.bottom || 12,
          },
        ]}
      >
        <TabButton androidIcon="attach-money" route="/budget" label="Budget" scaleValue={budgetScale} />
        <TabButton androidIcon="autorenew" route="/abos" label="Abos" scaleValue={abosScale} />
        <TabButton androidIcon="person" route="/profil" label="Profil" scaleValue={profilScale} />
        <AddButton />
      </BlurView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'expense' ? 'Neue Ausgabe' : 'Neues Abo'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={modalType === 'expense' ? 'Name (z.B. ESSEN)' : 'Name des Abos'}
              placeholderTextColor="#666"
              value={inputName}
              onChangeText={setInputName}
            />
            <TextInput
              style={styles.input}
              placeholder="Betrag"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={inputAmount}
              onChangeText={setInputAmount}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Hinzufügen</Text>
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
    <>
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
    </>
  );
}
