
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Text } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/usePremium';

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButtonText: {
    color: colors.white,
  },
  secretCodeModal: {
    backgroundColor: '#1a0f2e',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  secretCodeTitle: {
    color: '#fbbf24',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: '#fbbf24',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  secretCodeDescription: {
    color: '#e0e7ff',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  secretCodeBox: {
    backgroundColor: '#2d1b4e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  secretCodeLabel: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  secretCodeValue: {
    color: '#fbbf24',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
  },
  secretCodeButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secretCodeButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
});

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { redeemPromoCode, checkPremiumStatus } = usePremium();

  const [modalVisible, setModalVisible] = useState(false);
  const [secretCodeModalVisible, setSecretCodeModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');

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
    return pathname === route || pathname.startsWith(route);
  };

  const handleTabPress = (route: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`[TabBar] Navigating to: ${route}`);
    router.push(route as any);
  };

  const handleAddPress = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[TabBar] Add button pressed, current route:', pathname);
    
    addScale.value = withSpring(0.9, {}, () => {
      addScale.value = withSpring(1);
    });

    if (pathname === '/profil' || pathname.startsWith('/profil')) {
      console.log('[TabBar] Opening secret code modal on profile page');
      setSecretCodeModalVisible(true);
      return;
    }

    setItemName('');
    setItemAmount('');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!itemName.trim() || !itemAmount.trim()) {
      Alert.alert(t.common.error, t.budget.errorAllFields || 'Bitte fülle alle Felder aus');
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const amount = parseFloat(itemAmount);
    if (isNaN(amount)) {
      Alert.alert(t.common.error, t.budget.errorInvalidAmount || 'Ungültiger Betrag');
      return;
    }

    console.log('[TabBar] Saving item:', { name: itemName, amount, route: pathname });

    if (pathname === '/budget' || pathname.startsWith('/budget')) {
      if (typeof (global as any).addExpenseFromModal === 'function') {
        (global as any).addExpenseFromModal(itemName.toUpperCase(), amount);
      }
    } else if (pathname === '/abos' || pathname.startsWith('/abos')) {
      if (typeof (global as any).addSubscriptionFromModal === 'function') {
        (global as any).addSubscriptionFromModal(itemName.toUpperCase(), amount);
      }
    }

    setModalVisible(false);
    setItemName('');
    setItemAmount('');
  };

  const handleCancel = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setModalVisible(false);
    setItemName('');
    setItemAmount('');
  };

  const handleRedeemSecretCode = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    console.log('[TabBar] Redeeming secret code: EASY2');
    
    const result = await redeemPromoCode('EASY2');
    
    if (result.success) {
      Alert.alert(
        '🎉 Premium Aktiviert!',
        'Du hast 1 Monat Premium freigeschaltet!',
        [
          {
            text: 'OK',
            onPress: () => {
              setSecretCodeModalVisible(false);
              checkPremiumStatus();
            },
          },
        ]
      );
    } else {
      Alert.alert('Fehler', result.message);
    }
  };

  const TabButton = ({ 
    androidIcon, 
    route, 
    label,
    scaleValue,
  }: { 
    androidIcon: string;
    route: string; 
    label: string;
    scaleValue: Animated.SharedValue<number>;
  }) => {
    const active = isActive(route);

    return (
      <Pressable
        style={styles.tabButton}
        onPress={() => {
          scaleValue.value = withSpring(0.9, {}, () => {
            scaleValue.value = withSpring(1);
          });
          handleTabPress(route);
        }}
      >
        <Animated.View style={scaleValue === budgetScale ? budgetStyle : scaleValue === abosScale ? abosStyle : profilStyle}>
          <MaterialIcons
            name={androidIcon as any}
            size={28}
            color={active ? colors.neonGreen : colors.white}
          />
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => (
    <Pressable onPress={handleAddPress}>
      <Animated.View style={[styles.addButton, addStyle]}>
        <MaterialIcons name="add" size={32} color={colors.black} />
      </Animated.View>
    </Pressable>
  );

  const getModalTitle = () => {
    if (pathname === '/budget' || pathname.startsWith('/budget')) {
      return t.budget.newExpense;
    } else if (pathname === '/abos' || pathname.startsWith('/abos')) {
      return t.abos.newSubscription;
    }
    return t.budget.newExpense;
  };

  const getNamePlaceholder = () => {
    if (pathname === '/budget' || pathname.startsWith('/budget')) {
      return t.budget.namePlaceholder;
    } else if (pathname === '/abos' || pathname.startsWith('/abos')) {
      return t.abos.namePlaceholder;
    }
    return t.budget.namePlaceholder;
  };

  const getAmountPlaceholder = () => {
    if (pathname === '/budget' || pathname.startsWith('/budget')) {
      return t.budget.amountPlaceholder;
    } else if (pathname === '/abos' || pathname.startsWith('/abos')) {
      return t.abos.amountPlaceholder;
    }
    return t.budget.amountPlaceholder;
  };

  const bottomPadding = insets.bottom;

  return (
    <>
      <BlurView intensity={80} tint="dark" style={[styles.tabBar, { marginBottom: bottomPadding }]}>
        <TabButton androidIcon="attach-money" route="/budget" label="Budget" scaleValue={budgetScale} />
        <TabButton androidIcon="subscriptions" route="/abos" label="Abos" scaleValue={abosScale} />
        <AddButton />
        <TabButton androidIcon="person" route="/profil" label="Profil" scaleValue={profilScale} />
      </BlurView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder={getNamePlaceholder()}
              placeholderTextColor="#666"
              autoFocus
            />
            
            <TextInput
              style={styles.input}
              value={itemAmount}
              onChangeText={setItemAmount}
              placeholder={getAmountPlaceholder()}
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={[styles.buttonText, styles.cancelButtonText]}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>{t.common.save}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={secretCodeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecretCodeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSecretCodeModalVisible(false)}>
          <Pressable style={styles.secretCodeModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.secretCodeTitle}>✨ Geheimcode gefunden! ✨</Text>
            
            <Text style={styles.secretCodeDescription}>
              Löse den Geheimcode ein um einen Monat Premium zu erhalten!
            </Text>

            <View style={styles.secretCodeBox}>
              <Text style={styles.secretCodeLabel}>Code:</Text>
              <Text style={styles.secretCodeValue}>EASY2</Text>
            </View>

            <Pressable style={styles.secretCodeButton} onPress={handleRedeemSecretCode}>
              <Text style={styles.secretCodeButtonText}>Code einlösen</Text>
            </Pressable>
          </Pressable>
        </Pressable>
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
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
      <CustomTabBar />
    </>
  );
}
