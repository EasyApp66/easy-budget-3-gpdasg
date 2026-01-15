
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { colors } from '@/styles/commonStyles';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1000,
  },
  tabBarInner: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 40,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabLabelActive: {
    color: '#BFFE84',
  },
  addButtonContainer: {
    marginLeft: 8,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#BFFE84',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#BFFE84',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px rgba(191, 254, 132, 0.5)',
      },
    }),
  },
  plusIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusVertical: {
    position: 'absolute',
    width: 4,
    height: 28,
    backgroundColor: '#000000',
    borderRadius: 3,
    left: 12,
    top: 0,
  },
  plusHorizontal: {
    position: 'absolute',
    width: 28,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 3,
    left: 0,
    top: 12,
  },
  bubbleIndicator: {
    position: 'absolute',
    bottom: 2,
    height: 3,
    backgroundColor: '#BFFE84',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 24,
    paddingBottom: 16,
    width: '95%',
    maxWidth: 440,
    minWidth: 340,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 18,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#000000',
  },
  saveButton: {
    backgroundColor: '#BFFE84',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  cancelButtonText: {
    color: '#FFFFFF',
  },
  saveButtonText: {
    color: '#000000',
  },
});

function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'subscription' | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const budgetScale = useSharedValue(1);
  const abosScale = useSharedValue(1);
  const profilScale = useSharedValue(1);
  const addScale = useSharedValue(1);
  
  // Animated bubble indicator
  const bubblePosition = useSharedValue(0);
  const bubbleWidth = useSharedValue(70);

  const isActive = (route: string) => {
    return pathname.includes(route);
  };

  // Update bubble position based on active tab with smooth iOS-style animation
  React.useEffect(() => {
    if (pathname.includes('budget')) {
      bubblePosition.value = withSpring(0, { 
        damping: 20, 
        stiffness: 180,
        mass: 0.8,
      });
    } else if (pathname.includes('abos')) {
      bubblePosition.value = withSpring(1, { 
        damping: 20, 
        stiffness: 180,
        mass: 0.8,
      });
    } else if (pathname.includes('profil')) {
      bubblePosition.value = withSpring(2, { 
        damping: 20, 
        stiffness: 180,
        mass: 0.8,
      });
    }
  }, [pathname, bubblePosition]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: bubblePosition.value * (bubbleWidth.value + 20),
        },
      ],
      width: bubbleWidth.value,
    };
  });

  const handleTabPress = (route: string) => {
    console.log(`[TabBar] Navigating to: ${route}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    console.log('[TabBar] Add button pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (pathname.includes('budget')) {
      setModalType('expense');
      setModalVisible(true);
    } else if (pathname.includes('abos')) {
      setModalType('subscription');
      setModalVisible(true);
    } else if (pathname.includes('profil')) {
      handleShare();
    }
  };

  const handleShare = async () => {
    console.log('[TabBar] Opening share dialog');
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('https://easybudget.app', {
          dialogTitle: 'Schau dir meine Budget-App an!',
        });
      } else {
        Alert.alert('Teilen nicht verfügbar', 'Teilen wird auf diesem Gerät nicht unterstützt.');
      }
    } catch (error) {
      console.error('[TabBar] Share error:', error);
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Validate input
    if (!name.trim()) {
      Alert.alert(t.common.error, modalType === 'expense' ? t.budget.expenseName : t.abos.subscriptionName);
      return;
    }
    
    const numericAmount = parseFloat(amount.replace(/'/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t.common.error, t.budget.amount);
      return;
    }
    
    console.log(`[TabBar] Saving ${modalType}: ${name}, ${numericAmount}`);
    
    // Call the appropriate global function to add the item
    if (modalType === 'expense') {
      // Call the budget screen's add function
      if ((global as any).addExpenseFromModal) {
        (global as any).addExpenseFromModal(name.toUpperCase(), numericAmount);
      }
    } else if (modalType === 'subscription') {
      // Call the abos screen's add function
      if ((global as any).addSubscriptionFromModal) {
        (global as any).addSubscriptionFromModal(name.toUpperCase(), numericAmount);
      }
    }
    
    // Close modal and reset
    setModalVisible(false);
    setName('');
    setAmount('');
  };

  const handleCancel = () => {
    console.log('[TabBar] Modal cancelled');
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
          scaleValue.value = withSpring(0.88, { 
            damping: 15, 
            stiffness: 300,
            mass: 0.5,
          });
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1, { 
            damping: 15, 
            stiffness: 300,
            mass: 0.5,
          });
        }}
        style={styles.tabButton}
      >
        <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
          <MaterialIcons
            name={androidIcon as any}
            size={28}
            color={active ? '#BFFE84' : '#FFFFFF'}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: addScale.value }],
    }));

    return (
      <View style={styles.addButtonContainer}>
        <Pressable
          onPress={handleAddPress}
          onPressIn={() => {
            addScale.value = withSpring(0.88, { 
              damping: 15, 
              stiffness: 300,
              mass: 0.5,
            });
          }}
          onPressOut={() => {
            addScale.value = withSpring(1, { 
              damping: 15, 
              stiffness: 300,
              mass: 0.5,
            });
          }}
        >
          <Animated.View style={[styles.addButton, animatedStyle]}>
            <View style={styles.plusIconContainer}>
              <View style={styles.plusVertical} />
              <View style={styles.plusHorizontal} />
            </View>
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  return (
    <>
      <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.tabBarInner}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={styles.blurView} tint="dark" />
          ) : (
            <View style={styles.blurView} />
          )}
          
          <View style={styles.tabsRow}>
            <TabButton
              androidIcon="attach-money"
              route="/budget"
              label="Budget"
              scaleValue={budgetScale}
            />
            
            <TabButton
              androidIcon="autorenew"
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
          </View>
          
          <AddButton />
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>
                {modalType === 'expense' ? t.budget.newExpense : t.abos.newSubscription}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder={modalType === 'expense' ? t.budget.namePlaceholder : t.abos.namePlaceholder}
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="characters"
              />
              
              <TextInput
                style={styles.input}
                placeholder={modalType === 'expense' ? t.budget.amountPlaceholder : t.abos.amountPlaceholder}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    {t.common.cancel}
                  </Text>
                </Pressable>
                
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={[styles.buttonText, styles.saveButtonText]}>
                    {t.common.add}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
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
          animation: 'fade',
          animationDuration: 150,
        }}
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="(home)" options={{ href: null }} />
      </Tabs>
      <CustomTabBar />
    </>
  );
}
