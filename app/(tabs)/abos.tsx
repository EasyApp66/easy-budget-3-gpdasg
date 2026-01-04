
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

export default function AbosScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'NETFLIX', monthlyCost: 15, isPinned: true },
    { id: '2', name: 'APPLE CARE', monthlyCost: 14, isPinned: false },
  ]);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    itemId: string | null;
  }>({ visible: false, itemId: null });

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    type: 'name' | 'amount' | null;
    value: string;
    itemId: string | null;
  }>({ visible: false, type: null, value: '', itemId: null });

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const totalCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);

  const handleLongPress = (itemId: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setContextMenu({ visible: true, itemId });
  };

  const handleDeleteSub = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    setContextMenu({ visible: false, itemId: null });
  };

  const handlePinToggle = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { itemId } = contextMenu;
    if (itemId) {
      setSubscriptions(
        subscriptions.map(sub =>
          sub.id === itemId ? { ...sub, isPinned: !sub.isPinned } : sub
        )
      );
    }
    setContextMenu({ visible: false, itemId: null });
  };

  const handleDuplicate = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { itemId } = contextMenu;
    if (itemId) {
      const sub = subscriptions.find(s => s.id === itemId);
      if (sub) {
        const newSub = {
          ...sub,
          id: Date.now().toString(),
          isPinned: false,
        };
        setSubscriptions([...subscriptions, newSub]);
      }
    }
    setContextMenu({ visible: false, itemId: null });
  };

  const openEditModal = (
    type: 'name' | 'amount',
    itemId: string,
    currentValue: string
  ) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditModal({ visible: true, type, value: currentValue, itemId });
    setContextMenu({ visible: false, itemId: null });
  };

  const saveEdit = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { type, value, itemId } = editModal;

    if (type === 'name' && itemId) {
      setSubscriptions(
        subscriptions.map(sub =>
          sub.id === itemId ? { ...sub, name: value } : sub
        )
      );
    } else if (type === 'amount' && itemId) {
      setSubscriptions(
        subscriptions.map(sub =>
          sub.id === itemId ? { ...sub, monthlyCost: parseFloat(value) || 0 } : sub
        )
      );
    }

    setEditModal({ visible: false, type: null, value: '', itemId: null });
  };

  const SubscriptionPill = ({ subscription }: { subscription: Subscription }) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
      ],
    }));

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        if (event.translationX < -100) {
          // Swipe left to delete
          runOnJS(handleDeleteSub)(subscription.id);
        } else if (event.translationX > 100) {
          // Swipe right to pin
          runOnJS(handlePinToggle)();
        }
        translateX.value = withSpring(0);
      });

    return (
      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          style={[
            styles.subPill,
            subscription.isPinned && styles.pinnedBorder,
            animatedStyle,
          ]}
          onPressIn={() => {
            scale.value = withSpring(0.98);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          onLongPress={() => handleLongPress(subscription.id)}
          delayLongPress={600}
        >
          <Text style={styles.subName}>{subscription.name}</Text>
          <Text style={styles.subCost}>{subscription.monthlyCost}</Text>
        </AnimatedPressable>
      </GestureDetector>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Abo Kosten Card */}
          <View style={styles.costCard}>
            <Text style={styles.costLabel}>ABO KOSTEN</Text>
            <Text style={styles.costValue}>{totalCost}</Text>
          </View>

          {/* Total Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{subscriptions.length}</Text>
            </View>
          </View>

          {/* Subscription Pills */}
          <View style={styles.subList}>
            {sortedSubscriptions.map((sub) => (
              <SubscriptionPill key={sub.id} subscription={sub} />
            ))}
          </View>

          {/* Swipe Hint */}
          <Text style={styles.swipeHint}>
            ← Wischen zum Löschen • Wischen zum Fixieren →
          </Text>
        </ScrollView>

        {/* Context Menu Modal */}
        <Modal
          visible={contextMenu.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setContextMenu({ visible: false, itemId: null })}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setContextMenu({ visible: false, itemId: null })}
          >
            <View style={styles.contextMenu}>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  const sub = subscriptions.find(s => s.id === contextMenu.itemId);
                  if (sub) {
                    openEditModal('name', contextMenu.itemId!, sub.name);
                  }
                }}
              >
                <Text style={styles.menuItemText}>Namen anpassen</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  const sub = subscriptions.find(s => s.id === contextMenu.itemId);
                  if (sub) {
                    openEditModal('amount', contextMenu.itemId!, sub.monthlyCost.toString());
                  }
                }}
              >
                <Text style={styles.menuItemText}>Zahl anpassen</Text>
              </Pressable>

              <Pressable style={styles.menuItem} onPress={handleDuplicate}>
                <Text style={styles.menuItemText}>Duplizieren</Text>
              </Pressable>

              <Pressable style={styles.menuItem} onPress={handlePinToggle}>
                <Text style={styles.menuItemText}>Fixieren</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  if (contextMenu.itemId) {
                    handleDeleteSub(contextMenu.itemId);
                  }
                }}
              >
                <Text style={[styles.menuItemText, styles.menuItemDanger]}>Löschen</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => setContextMenu({ visible: false, itemId: null })}
              >
                <Text style={styles.menuItemText}>Abbrechen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Edit Modal */}
        <Modal
          visible={editModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModal({ visible: false, type: null, value: '', itemId: null })}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditModal({ visible: false, type: null, value: '', itemId: null })}
          >
            <Pressable style={styles.editModal} onPress={(e) => e.stopPropagation()}>
              <TextInput
                style={styles.editInput}
                value={editModal.value}
                onChangeText={(text) => setEditModal({ ...editModal, value: text })}
                keyboardType={editModal.type === 'amount' ? 'numeric' : 'default'}
                autoFocus
                placeholderTextColor={colors.darkGray}
              />
              <Pressable style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveButtonText}>Speichern</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  costCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  costValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  totalCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subList: {
    gap: 16,
    marginBottom: 24,
  },
  subPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  pinnedBorder: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  subName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subCost: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  swipeHint: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.5,
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
    overflow: 'hidden',
  },
  menuItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  menuItemDanger: {
    color: colors.red,
  },
  editModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    gap: 16,
  },
  editInput: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
