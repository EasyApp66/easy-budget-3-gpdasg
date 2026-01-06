
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { usePremium } from '@/hooks/usePremium';

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

export default function AbosScreen() {
  const { isPremium, showPaywall, setShowPaywall } = usePremium();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'NETFLIX', monthlyCost: 15.9, isPinned: false },
    { id: '2', name: 'SPOTIFY', monthlyCost: 12.9, isPinned: false },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'name' | 'amount'>('name');
  const [editValue, setEditValue] = useState('');
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const totalYearlyCost = totalMonthlyCost * 12;

  const handleLongPress = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItemId(itemId);
    setContextMenuVisible(true);
  };

  const handleDeleteSub = (id: string) => {
    Alert.alert('Abo löschen', 'Möchtest du dieses Abo wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setSubscriptions(subscriptions.filter((s) => s.id !== id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handlePinToggle = () => {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === selectedItemId ? { ...s, isPinned: !s.isPinned } : s
      )
    );
    setContextMenuVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDuplicate = () => {
    if (!isPremium) {
      setContextMenuVisible(false);
      setShowPaywall(true);
      return;
    }
    const subToDuplicate = subscriptions.find((s) => s.id === selectedItemId);
    if (subToDuplicate) {
      const newSub: Subscription = {
        ...subToDuplicate,
        id: Date.now().toString(),
        isPinned: false,
      };
      setSubscriptions([...subscriptions, newSub]);
    }
    setContextMenuVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openEditModal = (type: 'name' | 'amount', itemId: string, currentValue: string) => {
    setEditType(type);
    setEditItemId(itemId);
    setEditValue(currentValue);
    setEditModalVisible(true);
    setContextMenuVisible(false);
  };

  const saveEdit = () => {
    if (editType === 'name') {
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === editItemId ? { ...s, name: editValue.toUpperCase() } : s
        )
      );
    } else if (editType === 'amount') {
      const numValue = parseFloat(editValue) || 0;
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === editItemId ? { ...s, monthlyCost: numValue } : s
        )
      );
    }
    setEditModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveNewSubscription = () => {
    if (!newSubName.trim() || !newSubAmount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }

    const amount = parseFloat(newSubAmount);
    if (isNaN(amount)) {
      Alert.alert('Fehler', 'Bitte gib einen gültigen Betrag ein.');
      return;
    }

    const newSub: Subscription = {
      id: Date.now().toString(),
      name: newSubName.toUpperCase(),
      monthlyCost: amount,
      isPinned: false,
    };

    setSubscriptions([...subscriptions, newSub]);
    setNewSubName('');
    setNewSubAmount('');
    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCancelNewSubscription = () => {
    setNewSubName('');
    setNewSubAmount('');
    setShowAddModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    Alert.alert('Premium', `${type === 'onetime' ? 'Einmaliger' : 'Monatlicher'} Kauf wird verarbeitet...`);
    setShowPaywall(false);
  };

  const handlePremiumClose = () => {
    setShowPaywall(false);
  };

  const SubscriptionPill = ({ subscription }: { subscription: Subscription }) => (
    <Animated.View style={animatedStyle}>
      <Pressable
        onLongPress={() => handleLongPress(subscription.id)}
        delayLongPress={600}
        onPressIn={() => {
          scale.value = withSpring(0.98);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <View style={styles.subPill}>
          <Text style={styles.subName}>{subscription.name}</Text>
          <Text style={styles.subAmount}>CHF {formatNumber(subscription.monthlyCost)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>MONATLICH</Text>
            <Text style={styles.summaryValue}>CHF {formatNumber(totalMonthlyCost)}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>JÄHRLICH</Text>
            <Text style={[styles.summaryValue, { color: '#C43C3E' }]}>
              CHF {formatNumber(totalYearlyCost)}
            </Text>
          </View>
        </View>

        {subscriptions.map((sub) => (
          <SubscriptionPill key={sub.id} subscription={sub} />
        ))}
      </ScrollView>

      {/* NEW COMPACT ADD SUBSCRIPTION MODAL */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelNewSubscription}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancelNewSubscription}>
          <Pressable style={styles.newModalContainer} onPress={() => {}}>
            <Text style={styles.newModalTitle}>Neues Abo</Text>
            
            <TextInput
              style={styles.newModalInput}
              placeholder="Name (z.B. NETFLIX)"
              placeholderTextColor="#666"
              value={newSubName}
              onChangeText={setNewSubName}
              autoCapitalize="characters"
            />
            
            <TextInput
              style={styles.newModalInput}
              placeholder="Betrag"
              placeholderTextColor="#666"
              value={newSubAmount}
              onChangeText={setNewSubAmount}
              keyboardType="decimal-pad"
            />
            
            <View style={styles.newModalButtonRow}>
              <Pressable
                style={styles.newModalCancelButton}
                onPress={handleCancelNewSubscription}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={styles.newModalCancelText}>Abbrechen</Text>
              </Pressable>
              
              <Pressable
                style={styles.newModalAddButton}
                onPress={handleSaveNewSubscription}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={styles.newModalAddText}>Hinzufügen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
                setContextMenuVisible(false);
                const sub = subscriptions.find((s) => s.id === selectedItemId);
                if (sub) {
                  openEditModal('name', sub.id, sub.name);
                }
              }}
            >
              <Text style={styles.contextMenuText}>Bearbeiten</Text>
            </Pressable>
            <Pressable style={styles.contextMenuItem} onPress={handlePinToggle}>
              <Text style={styles.contextMenuText}>Anpinnen</Text>
            </Pressable>
            <Pressable style={styles.contextMenuItem} onPress={handleDuplicate}>
              <Text style={styles.contextMenuText}>Duplizieren</Text>
            </Pressable>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                setContextMenuVisible(false);
                if (selectedItemId) {
                  handleDeleteSub(selectedItemId);
                }
              }}
            >
              <Text style={[styles.contextMenuText, { color: '#C43C3E' }]}>Löschen</Text>
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
            <Text style={styles.editModalTitle}>Bearbeiten</Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder="Neuer Wert"
              placeholderTextColor="#666"
              keyboardType={editType === 'amount' ? 'decimal-pad' : 'default'}
              autoCapitalize={editType === 'name' ? 'characters' : 'none'}
            />
            <View style={styles.editModalButtons}>
              <Pressable
                style={styles.editCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.editCancelText}>Abbrechen</Text>
              </Pressable>
              <Pressable style={styles.editSaveButton} onPress={saveEdit}>
                <Text style={styles.editSaveText}>Speichern</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <PremiumPaywallModal
        visible={showPaywall}
        onClose={handlePremiumClose}
        onPurchase={handlePremiumPurchase}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryPill: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BFFE84',
    letterSpacing: 0.5,
  },
  subPill: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // NEW COMPACT MODAL STYLES
  newModalContainer: {
    width: 320,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  newModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  newModalInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  newModalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  newModalCancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newModalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  newModalAddButton: {
    flex: 1,
    backgroundColor: '#BFFE84',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newModalAddText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.3,
  },

  contextMenu: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
  },
  contextMenuItem: {
    padding: 16,
    borderRadius: 8,
  },
  contextMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  editModal: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editCancelButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editSaveButton: {
    flex: 1,
    backgroundColor: '#BFFE84',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
