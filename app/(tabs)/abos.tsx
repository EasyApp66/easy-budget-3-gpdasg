
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { usePremium } from '@/hooks/usePremium';
import React, { useState, useCallback } from 'react';
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
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

export default function AbosScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'NETFLIX', monthlyCost: 1799, isPinned: false },
    { id: '2', name: 'SPOTIFY', monthlyCost: 999, isPinned: false },
  ]);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'name' | 'amount'>('name');
  const [editValue, setEditValue] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');

  const [paywallVisible, setPaywallVisible] = useState(false);
  const { isPremium } = usePremium();

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const totalYearlyCost = totalMonthlyCost * 12;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  const handleLongPress = useCallback((itemId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedItemId(itemId);
    setContextMenuVisible(true);
  }, []);

  const handleDeleteSub = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    setContextMenuVisible(false);
  };

  const handlePinToggle = () => {
    if (!isPremium) {
      setContextMenuVisible(false);
      setPaywallVisible(true);
      return;
    }
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === selectedItemId ? { ...sub, isPinned: !sub.isPinned } : sub
      )
    );
    setContextMenuVisible(false);
  };

  const handleDuplicate = () => {
    if (!isPremium) {
      setContextMenuVisible(false);
      setPaywallVisible(true);
      return;
    }
    const subToDuplicate = subscriptions.find(s => s.id === selectedItemId);
    if (subToDuplicate) {
      const newSub = {
        ...subToDuplicate,
        id: Date.now().toString(),
        isPinned: false,
      };
      setSubscriptions(prev => [...prev, newSub]);
    }
    setContextMenuVisible(false);
  };

  const openEditModal = (type: 'name' | 'amount', itemId: string, currentValue: string) => {
    setEditType(type);
    setEditValue(currentValue);
    setSelectedItemId(itemId);
    setContextMenuVisible(false);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!editValue.trim()) return;

    setSubscriptions(prev =>
      prev.map(sub => {
        if (sub.id === selectedItemId) {
          if (editType === 'name') {
            return { ...sub, name: editValue };
          } else {
            const numValue = parseInt(editValue.replace(/'/g, ''));
            return { ...sub, monthlyCost: isNaN(numValue) ? sub.monthlyCost : numValue };
          }
        }
        return sub;
      })
    );

    setEditModalVisible(false);
    setEditValue('');
  };

  const handleAddSubscription = () => {
    setAddModalVisible(true);
  };

  const saveNewSubscription = () => {
    if (!newSubName.trim() || !newSubAmount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }

    const amount = parseInt(newSubAmount.replace(/'/g, ''));
    if (isNaN(amount)) {
      Alert.alert('Fehler', 'Ungültiger Betrag');
      return;
    }

    const newSub: Subscription = {
      id: Date.now().toString(),
      name: newSubName.toUpperCase(),
      monthlyCost: amount,
      isPinned: false,
    };

    setSubscriptions(prev => [...prev, newSub]);
    setAddModalVisible(false);
    setNewSubName('');
    setNewSubAmount('');
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    Alert.alert('Premium', `${type === 'onetime' ? 'Einmaliger' : 'Monatlicher'} Kauf wird verarbeitet...`);
    setPaywallVisible(false);
  };

  const handlePremiumClose = () => {
    setPaywallVisible(false);
  };

  const SubscriptionPill = ({ subscription }: { subscription: Subscription }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={[styles.subscriptionPill, animatedStyle]}>
        <Pressable
          onPress={() => {
            scale.value = withSpring(0.95, {}, () => {
              scale.value = withSpring(1);
            });
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          onLongPress={() => handleLongPress(subscription.id)}
          style={styles.pillPressable}
        >
          <View style={styles.pillContent}>
            <Text style={styles.subscriptionName}>{subscription.name}</Text>
            <Text style={styles.subscriptionAmount}>{formatNumber(subscription.monthlyCost)}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ABOS</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>MONATLICH</Text>
            <Text style={styles.summaryValue}>{formatNumber(totalMonthlyCost)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>JÄHRLICH</Text>
            <Text style={styles.summaryValue}>{formatNumber(totalYearlyCost)}</Text>
          </View>
        </View>

        <View style={styles.subscriptionsList}>
          {subscriptions.map(sub => (
            <SubscriptionPill key={sub.id} subscription={sub} />
          ))}
        </View>
      </ScrollView>

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
              onPress={handlePinToggle}
            >
              <Text style={styles.contextMenuText}>
                {subscriptions.find(s => s.id === selectedItemId)?.isPinned ? 'Unpin' : 'Pin'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                const sub = subscriptions.find(s => s.id === selectedItemId);
                if (sub) openEditModal('name', sub.id, sub.name);
              }}
            >
              <Text style={styles.contextMenuText}>Name bearbeiten</Text>
            </Pressable>

            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                const sub = subscriptions.find(s => s.id === selectedItemId);
                if (sub) openEditModal('amount', sub.id, sub.monthlyCost.toString());
              }}
            >
              <Text style={styles.contextMenuText}>Betrag bearbeiten</Text>
            </Pressable>

            <Pressable
              style={styles.contextMenuItem}
              onPress={handleDuplicate}
            >
              <Text style={styles.contextMenuText}>Duplizieren</Text>
            </Pressable>

            <Pressable
              style={[styles.contextMenuItem, styles.deleteItem]}
              onPress={() => selectedItemId && handleDeleteSub(selectedItemId)}
            >
              <Text style={styles.deleteText}>Löschen</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>
              {editType === 'name' ? 'Name bearbeiten' : 'Betrag bearbeiten'}
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
            <View style={styles.editModalButtons}>
              <Pressable
                style={[styles.editModalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.editModalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Speichern</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAddModalVisible(false)}>
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>Neues Abo</Text>
            <TextInput
              style={styles.editInput}
              value={newSubName}
              onChangeText={setNewSubName}
              placeholder="Name"
              placeholderTextColor="#666"
              autoFocus
            />
            <TextInput
              style={[styles.editInput, { marginTop: 12 }]}
              value={newSubAmount}
              onChangeText={setNewSubAmount}
              placeholder="Betrag"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <View style={styles.editModalButtons}>
              <Pressable
                style={[styles.editModalButton, styles.cancelButton]}
                onPress={() => {
                  setAddModalVisible(false);
                  setNewSubName('');
                  setNewSubAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.editModalButton, styles.saveButton]}
                onPress={saveNewSubscription}
              >
                <Text style={styles.saveButtonText}>Speichern</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <PremiumPaywallModal
        visible={paywallVisible}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  summaryCard: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#BFFE84',
    letterSpacing: 1,
  },
  subscriptionsList: {
    gap: 12,
  },
  subscriptionPill: {
    backgroundColor: '#232323',
    borderRadius: 20,
    overflow: 'hidden',
  },
  pillPressable: {
    padding: 20,
  },
  pillContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  subscriptionAmount: {
    fontSize: 44,
    fontWeight: '800',
    color: '#BFFE84',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 8,
    minWidth: 250,
  },
  contextMenuItem: {
    padding: 16,
    borderRadius: 12,
  },
  contextMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  deleteItem: {
    marginTop: 4,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C43C3E',
    textAlign: 'center',
  },
  editModal: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 1,
  },
  editInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  editModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#000000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#BFFE84',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
