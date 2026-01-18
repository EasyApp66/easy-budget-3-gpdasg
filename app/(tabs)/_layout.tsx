
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Text } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/hooks/usePremium';

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
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
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    padding: 15,
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
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButtonText: {
    // color set dynamically
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const { colors } = useTheme();
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

    // Check if we're on the profile page
    if (pathname === '/profil' || pathname.startsWith('/profil')) {
      console.log('[TabBar] Opening secret code modal on profile page');
      setSecretCodeModalVisible(true);
      return;
    }

    // Open modal for adding expense or subscription
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

    // Call the appropriate add function based on current route
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
        language === 'DE' 
          ? 'Du hast 1 Monat Premium freigeschaltet!' 
          : 'You have unlocked 1 month of Premium!',
        [
          {
            text: 'OK',
            onPress: () => {
              setSecretCodeModalVisible(false);
              // Refresh premium status
              checkPremiumStatus();
            },
          },
        ]
      );
    } else {
      Alert.alert(language === 'DE' ? 'Fehler' : 'Error', result.message);
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
      <Animated.View style={[styles.addButton, { backgroundColor: colors.neonGreen }, addStyle]}>
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

  return (
    <>
      <BlurView intensity={80} tint="dark" style={[styles.tabBar, { marginBottom: insets.bottom }]}>
        <TabButton androidIcon="attach-money" route="/budget" label="Budget" scaleValue={budgetScale} />
        <TabButton androidIcon="subscriptions" route="/abos" label="Abos" scaleValue={abosScale} />
        <AddButton />
        <TabButton androidIcon="person" route="/profil" label="Profil" scaleValue={profilScale} />
      </BlurView>

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.cardBackground }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{getModalTitle()}</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={itemName}
              onChangeText={setItemName}
              placeholder={getNamePlaceholder()}
              placeholderTextColor="#666"
              autoFocus
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={itemAmount}
              onChangeText={setItemAmount}
              placeholder={getAmountPlaceholder()}
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]} onPress={handleCancel}>
                <Text style={[styles.buttonText, styles.cancelButtonText, { color: colors.text }]}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable style={[styles.button, { backgroundColor: colors.neonGreen }]} onPress={handleSave}>
                <Text style={[styles.buttonText, { color: colors.black }]}>{t.common.save}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Secret Code Modal */}
      <Modal
        visible={secretCodeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecretCodeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSecretCodeModalVisible(false)}>
          <Pressable style={styles.secretCodeModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.secretCodeTitle}>
              {language === 'DE' ? '✨ Geheimcode gefunden! ✨' : '✨ Secret Code Found! ✨'}
            </Text>
            
            <Text style={styles.secretCodeDescription}>
              {language === 'DE' 
                ? 'Löse den Geheimcode ein um einen Monat Premium zu erhalten!' 
                : 'Redeem the secret code to get one month of Premium!'}
            </Text>

            <View style={styles.secretCodeBox}>
              <Text style={styles.secretCodeLabel}>
                {language === 'DE' ? 'Code:' : 'Code:'}
              </Text>
              <Text style={styles.secretCodeValue}>EASY2</Text>
            </View>

            <Pressable style={styles.secretCodeButton} onPress={handleRedeemSecretCode}>
              <Text style={styles.secretCodeButtonText}>
                {language === 'DE' ? 'Code einlösen' : 'Redeem Code'}
              </Text>
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
