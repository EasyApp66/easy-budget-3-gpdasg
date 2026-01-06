
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
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
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import { usePremium } from '@/hooks/usePremium';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

export default function AbosScreen() {
  const { isPremium } = usePremium();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'SPOTIFY', monthlyCost: 12.99, isPinned: false },
    { id: '2', name: 'NETFLIX', monthlyCost: 17.90, isPinned: false },
  ]);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    itemId: string | null;
  }>({
    visible: false,
    itemId: null,
  });

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    type: 'name' | 'amount' | null;
    itemId: string;
    value: string;
  }>({
    visible: false,
    type: null,
    itemId: '',
    value: '',
  });

  const [addModal, setAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');

  const [premiumModal, setPremiumModal] = useState(false);

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleLongPress = (itemId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setContextMenu({ visible: true, itemId });
  };

  const handleDeleteSub = (id: string) => {
    Alert.alert('Abo löschen', 'Möchtest du dieses Abo wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setSubscriptions(subscriptions.filter((s) => s.id !== id));
          setContextMenu({ visible: false, itemId: null });
        },
      },
    ]);
  };

  const handlePinToggle = () => {
    const { itemId } = contextMenu;
    if (itemId) {
      setSubscriptions(
        subscriptions.map((s) => (s.id === itemId ? { ...s, isPinned: !s.isPinned } : s))
      );
    }
    setContextMenu({ visible: false, itemId: null });
  };

  const handleDuplicate = () => {
    const { itemId } = contextMenu;
    if (itemId) {
      const sub = subscriptions.find((s) => s.id === itemId);
      if (sub) {
        const newSub = { ...sub, id: Date.now().toString(), name: sub.name + ' KOPIE' };
        setSubscriptions([...subscriptions, newSub]);
      }
    }
    setContextMenu({ visible: false, itemId: null });
  };

  const openEditModal = (type: 'name' | 'amount', itemId: string, currentValue: string) => {
    setEditModal({ visible: true, type, itemId, value: currentValue });
    setContextMenu({ visible: false, itemId: null });
  };

  const saveEdit = () => {
    const { type, itemId, value } = editModal;
    if (type === 'name') {
      setSubscriptions(
        subscriptions.map((s) => (s.id === itemId ? { ...s, name: value.toUpperCase() } : s))
      );
    } else if (type === 'amount') {
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === itemId ? { ...s, monthlyCost: parseFloat(value) || 0 } : s
        )
      );
    }
    setEditModal({ visible: false, type: null, itemId: '', value: '' });
  };

  const handleAddSubscription = () => {
    if (!isPremium && subscriptions.length >= 2) {
      setPremiumModal(true);
      return;
    }
    setAddModal(true);
  };

  const saveNewSubscription = () => {
    if (newSubName && newSubAmount) {
      const newSub: Subscription = {
        id: Date.now().toString(),
        name: newSubName.toUpperCase(),
        monthlyCost: parseFloat(newSubAmount) || 0,
        isPinned: false,
      };
      setSubscriptions([...subscriptions, newSub]);
      setAddModal(false);
      setNewSubName('');
      setNewSubAmount('');
    }
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    Alert.alert('Premium', `${type === 'onetime' ? 'Einmalzahlung' : 'Monatlich'} ausgewählt`);
    setPremiumModal(false);
  };

  const handlePremiumClose = () => {
    setPremiumModal(false);
  };

  const SubscriptionPill = ({ subscription }: { subscription: Subscription }) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    }));

    const gesture = Gesture.Pan()
      .onUpdate((e) => {
        translateX.value = e.translationX;
      })
      .onEnd((e) => {
        if (Math.abs(e.translationX) > 100) {
          translateX.value = withTiming(e.translationX > 0 ? 500 : -500, { duration: 200 }, () => {
            runOnJS(handleDeleteSub)(subscription.id);
          });
        } else {
          translateX.value = withSpring(0);
        }
      });

    return (
      <GestureDetector gesture={gesture}>
        <Pressable
          onLongPress={() => handleLongPress(subscription.id)}
          onPress={() => {
            if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            scale.value = withSpring(0.98, {}, () => {
              scale.value = withSpring(1);
            });
          }}
        >
          <Animated.View style={[styles.subPill, animatedStyle]}>
            <View style={styles.subRow}>
              <Text style={styles.subName}>{subscription.name}</Text>
              {subscription.isPinned && <Text style={styles.pinIcon}>📌</Text>}
            </View>
            <Text style={styles.subAmount}>{formatNumber(subscription.monthlyCost)}</Text>
          </Animated.View>
        </Pressable>
      </GestureDetector>
    );
  };

  const totalMonthlyCost = subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>ABOS</Text>

          <View style={styles.topPill}>
            <Text style={styles.topPillLabel}>ABO KOSTEN</Text>
            <Text style={styles.topPillValue}>{formatNumber(totalMonthlyCost)}</Text>
          </View>

          <View style={styles.topPill}>
            <Text style={styles.topPillLabel}>TOTAL</Text>
            <Text style={[styles.topPillValue, { color: '#BFFE84' }]}>
              {formatNumber(totalMonthlyCost)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MEINE ABOS</Text>
            {subscriptions.map((sub) => (
              <SubscriptionPill key={sub.id} subscription={sub} />
            ))}
            <Pressable
              style={styles.addButton}
              onPress={() => {
                if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleAddSubscription();
              }}
            >
              <Text style={styles.addButtonText}>+ ABO HINZUFÜGEN</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Context Menu Modal */}
        <Modal visible={contextMenu.visible} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setContextMenu({ visible: false, itemId: null })}
          >
            <View style={styles.contextMenu}>
              <Pressable
                style={styles.contextMenuItem}
                onPress={() => {
                  const sub = subscriptions.find((s) => s.id === contextMenu.itemId);
                  if (sub) openEditModal('name', sub.id, sub.name);
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
                  if (contextMenu.itemId) handleDeleteSub(contextMenu.itemId);
                }}
              >
                <Text style={[styles.contextMenuText, { color: '#C43C3E' }]}>Löschen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={editModal.visible} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditModal({ visible: false, type: null, itemId: '', value: '' })}
          >
            <View style={styles.editModal}>
              <Text style={styles.editModalTitle}>Bearbeiten</Text>
              <TextInput
                style={styles.editModalInput}
                value={editModal.value}
                onChangeText={(text) => setEditModal({ ...editModal, value: text })}
                placeholder="Wert eingeben"
                placeholderTextColor="#666"
                keyboardType={editModal.type === 'amount' ? 'numeric' : 'default'}
              />
              <View style={styles.editModalButtons}>
                <Pressable
                  style={styles.editModalButton}
                  onPress={() => setEditModal({ visible: false, type: null, itemId: '', value: '' })}
                >
                  <Text style={styles.editModalButtonText}>Abbrechen</Text>
                </Pressable>
                <Pressable
                  style={[styles.editModalButton, styles.editModalButtonPrimary]}
                  onPress={saveEdit}
                >
                  <Text style={[styles.editModalButtonText, { color: '#000000' }]}>Speichern</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Add Subscription Modal */}
        <Modal visible={addModal} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setAddModal(false)}>
            <View style={styles.addModal}>
              <Text style={styles.addModalTitle}>Neues Abo</Text>
              <TextInput
                style={styles.addModalInput}
                value={newSubName}
                onChangeText={setNewSubName}
                placeholder="Name des Abos"
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.addModalInput}
                value={newSubAmount}
                onChangeText={setNewSubAmount}
                placeholder="Betrag (CHF/EUR)"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <View style={styles.addModalButtons}>
                <Pressable
                  style={styles.addModalButton}
                  onPress={() => {
                    setAddModal(false);
                    setNewSubName('');
                    setNewSubAmount('');
                  }}
                >
                  <Text style={styles.addModalButtonText}>Abbre</Text>
                </Pressable>
                <Pressable
                  style={[styles.addModalButton, styles.addModalButtonPrimary]}
                  onPress={saveNewSubscription}
                >
                  <Text style={[styles.addModalButtonText, { color: '#000000' }]}>Speichern</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        <PremiumPaywallModal
          visible={premiumModal}
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
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 2,
  },
  topPill: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topPillLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  topPillValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  subPill: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  pinIcon: {
    fontSize: 16,
  },
  subAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: '#BFFE84',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  contextMenuItem: {
    padding: 16,
  },
  contextMenuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  editModal: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 24,
    width: '92%',
    maxWidth: 500,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  editModalInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  editModalButtonPrimary: {
    backgroundColor: '#BFFE84',
  },
  editModalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  addModal: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 24,
    width: '92%',
    maxWidth: 500,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  addModalInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  addModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  addModalButtonPrimary: {
    backgroundColor: '#BFFE84',
  },
  addModalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
