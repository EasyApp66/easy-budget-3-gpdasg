
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import { usePremium } from '@/hooks/usePremium';

const colors = {
  black: '#000000',
  white: '#FFFFFF',
  neonGreen: '#BFFE84',
  darkGray: '#232323',
  red: '#C43C3E',
};

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

export default function AbosScreen() {
  const { isPremium, checkLimit } = usePremium();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'NETFLIX', monthlyCost: 15, isPinned: true },
    { id: '2', name: 'APPLE CARE', monthlyCost: 14, isPinned: false },
  ]);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editType, setEditType] = useState<'name' | 'amount'>('name');
  const [editValue, setEditValue] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [pendingSubId, setPendingSubId] = useState<string | null>(null);

  const totalCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const totalCount = subscriptions.length;

  // Format number with Swiss apostrophe formatting
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  const handleLongPress = (itemId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedSubId(itemId);
    setContextMenuVisible(true);
  };

  const handleDeleteSub = (id: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
  };

  const handlePinToggle = (id?: string) => {
    const targetId = id || selectedSubId;
    if (!targetId) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === targetId ? { ...sub, isPinned: !sub.isPinned } : sub
      )
    );
    if (!id) {
      setContextMenuVisible(false);
    }
  };

  const handleDuplicate = () => {
    if (!selectedSubId) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const subToDuplicate = subscriptions.find((sub) => sub.id === selectedSubId);
    if (subToDuplicate) {
      const newSub = {
        ...subToDuplicate,
        id: Date.now().toString(),
      };
      setSubscriptions([...subscriptions, newSub]);
    }
    setContextMenuVisible(false);
  };

  const openEditModal = (type: 'name' | 'amount', itemId: string, currentValue: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditType(type);
    setEditValue(currentValue);
    setSelectedSubId(itemId);
    setContextMenuVisible(false);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!selectedSubId) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === selectedSubId
          ? editType === 'name'
            ? { ...sub, name: editValue.toUpperCase() }
            : { ...sub, monthlyCost: parseFloat(editValue) || 0 }
          : sub
      )
    );
    setEditModalVisible(false);
    setEditValue('');
  };

  const handleAddSubscription = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setNewSubName('');
    setNewSubAmount('');
    setAddModalVisible(true);
  };

  const saveNewSubscription = () => {
    if (!newSubName.trim() || !newSubAmount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Check premium limit
    if (checkLimit(0, 0, subscriptions.length + 1)) {
      const newSubId = Date.now().toString();
      const newSub: Subscription = {
        id: newSubId,
        name: newSubName.toUpperCase(),
        monthlyCost: parseFloat(newSubAmount) || 0,
        isPinned: false,
      };
      setSubscriptions([...subscriptions, newSub]);
      setPendingSubId(newSubId);
      setAddModalVisible(false);
      setNewSubName('');
      setNewSubAmount('');
      setPremiumModalVisible(true);
      return;
    }
    
    const newSub: Subscription = {
      id: Date.now().toString(),
      name: newSubName.toUpperCase(),
      monthlyCost: parseFloat(newSubAmount) || 0,
      isPinned: false,
    };
    setSubscriptions([...subscriptions, newSub]);
    setAddModalVisible(false);
    setNewSubName('');
    setNewSubAmount('');
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: Backend Integration - Process premium purchase via Stripe
    console.log(`Premium purchase: ${type}`);
    Alert.alert('Erfolg!', 'Premium wurde aktiviert! (Placeholder - Stripe Integration folgt)');
    setPremiumModalVisible(false);
    setPendingSubId(null);
  };

  const handlePremiumClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Delete the pending subscription when closing without purchase
    if (pendingSubId) {
      setSubscriptions(subscriptions.filter((sub) => sub.id !== pendingSubId));
      setPendingSubId(null);
    }
    setPremiumModalVisible(false);
  };

  // Expose add function globally for tab bar
  React.useEffect(() => {
    (global as any).addSubscription = handleAddSubscription;
    return () => {
      delete (global as any).addSubscription;
    };
  }, []);

  const SubscriptionPill = ({ subscription }: { subscription: Subscription }) => {
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
        // Fade out when swiping
        if (Math.abs(event.translationX) > 50) {
          opacity.value = 1 - Math.abs(event.translationX) / 200;
        }
      })
      .onEnd((event) => {
        if (event.translationX < -100) {
          // Swipe left to delete - slide out animation
          translateX.value = withTiming(-500, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(handleDeleteSub)(subscription.id);
          });
        } else if (event.translationX > 100) {
          // Swipe right to pin/unpin - slide animation
          runOnJS(handlePinToggle)(subscription.id);
          translateX.value = withSpring(0);
          opacity.value = withSpring(1);
        } else {
          translateX.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      });

    const longPressGesture = Gesture.LongPress()
      .minDuration(600)
      .onStart(() => {
        scale.value = withSpring(0.95);
        runOnJS(handleLongPress)(subscription.id);
      })
      .onEnd(() => {
        scale.value = withSpring(1);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, longPressGesture)}>
        <Animated.View
          style={[
            styles.subscriptionPill,
            subscription.isPinned && styles.pinnedPill,
            animatedStyle,
          ]}
        >
          <Text style={styles.subscriptionName}>{subscription.name}</Text>
          <Text style={styles.subscriptionAmount}>{subscription.monthlyCost}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Pills - REDESIGNED with flexible layout matching Budget screen */}
          <View style={styles.topPillsContainer}>
            <View style={styles.topPillLarge}>
              <Text style={styles.topPillLabel}>ABO KOSTEN</Text>
              <Text style={styles.topPillValue}>{totalCost}</Text>
            </View>

            <View style={styles.topPill}>
              <Text style={styles.topPillLabel}>TOTAL</Text>
              <Text style={styles.topPillValue}>{totalCount}</Text>
            </View>
          </View>

          {/* Subscription List */}
          <View style={styles.subscriptionList}>
            {sortedSubscriptions.map((sub) => (
              <SubscriptionPill key={sub.id} subscription={sub} />
            ))}
          </View>

          {/* Swipe Hint */}
          <Text style={styles.swipeHint}>
            ← Wischen zum Löschen · Wischen zum Fixieren →
          </Text>
        </ScrollView>

        {/* Context Menu Modal */}
        <Modal
          visible={contextMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setContextMenuVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setContextMenuVisible(false)}>
            <View style={styles.contextMenu}>
              <Pressable
                style={styles.contextMenuItem}
                onPress={() => {
                  const sub = subscriptions.find((s) => s.id === selectedSubId);
                  if (sub) openEditModal('name', sub.id, sub.name);
                }}
              >
                <Text style={styles.contextMenuText}>Namen anpassen</Text>
              </Pressable>

              <Pressable
                style={styles.contextMenuItem}
                onPress={() => {
                  const sub = subscriptions.find((s) => s.id === selectedSubId);
                  if (sub) openEditModal('amount', sub.id, sub.monthlyCost.toString());
                }}
              >
                <Text style={styles.contextMenuText}>Zahl anpassen</Text>
              </Pressable>

              <Pressable style={styles.contextMenuItem} onPress={handleDuplicate}>
                <Text style={styles.contextMenuText}>Duplizieren</Text>
              </Pressable>

              <Pressable style={styles.contextMenuItem} onPress={() => handlePinToggle()}>
                <Text style={styles.contextMenuText}>Fixieren</Text>
              </Pressable>

              <Pressable
                style={styles.contextMenuItem}
                onPress={() => {
                  if (selectedSubId) handleDeleteSub(selectedSubId);
                  setContextMenuVisible(false);
                }}
              >
                <Text style={[styles.contextMenuText, { color: colors.red }]}>Löschen</Text>
              </Pressable>

              <Pressable
                style={[styles.contextMenuItem, styles.contextMenuItemLast]}
                onPress={() => setContextMenuVisible(false)}
              >
                <Text style={styles.contextMenuText}>Abbrechen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Edit Modal */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
            <View style={styles.editModal}>
              <Text style={styles.editModalTitle}>
                {editType === 'name' ? 'Namen anpassen' : 'Zahl anpassen'}
              </Text>
              <TextInput
                style={styles.editInput}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={editType === 'name' ? 'Name' : 'Betrag'}
                placeholderTextColor="#666"
                keyboardType={editType === 'amount' ? 'numeric' : 'default'}
                autoFocus
              />
              <Pressable style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveButtonText}>Speichern</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Add Subscription Modal */}
        <Modal
          visible={addModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setAddModalVisible(false)}>
            <View style={styles.editModal}>
              <Text style={styles.editModalTitle}>Neues Abo hinzufügen</Text>
              <TextInput
                style={styles.editInput}
                value={newSubName}
                onChangeText={setNewSubName}
                placeholder="Name (z.B. SPOTIFY)"
                placeholderTextColor="#666"
                autoFocus
              />
              <TextInput
                style={styles.editInput}
                value={newSubAmount}
                onChangeText={setNewSubAmount}
                placeholder="Betrag (z.B. 10)"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Pressable style={styles.saveButton} onPress={saveNewSubscription}>
                <Text style={styles.saveButtonText}>Hinzufügen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Premium Paywall Modal */}
        <PremiumPaywallModal
          visible={premiumModalVisible}
          onClose={handlePremiumClose}
          onPurchase={handlePremiumPurchase}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  topPillsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  // REDESIGNED: Larger, flexible layout matching Budget screen
  topPillLarge: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 28,
    minHeight: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
  },
  // Title stays top-left, smaller size
  topPillLabel: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
  },
  // Amount goes bottom-right, large and bold
  topPillValue: {
    color: colors.white,
    fontSize: 56,
    fontWeight: '800',
    alignSelf: 'flex-end',
  },
  subscriptionList: {
    gap: 12,
  },
  subscriptionPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
  },
  pinnedPill: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  subscriptionName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subscriptionAmount: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  swipeHint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    width: '80%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  contextMenuItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  contextMenuItemLast: {
    borderBottomWidth: 0,
  },
  contextMenuText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  editModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 30,
    width: '80%',
    maxWidth: 400,
  },
  editModalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 15,
    marginTop: 5,
  },
  saveButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
