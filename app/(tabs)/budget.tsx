
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
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
  Dimensions,
} from 'react-native';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import { colors } from '@/styles/commonStyles';
import { usePremium } from '@/hooks/usePremium';
import * as Haptics from 'expo-haptics';

interface Expense {
  id: string;
  name: string;
  amount: number;
  isPinned: boolean;
}

interface Month {
  id: string;
  name: string;
  isPinned: boolean;
  cash: number;
  expenses: Expense[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BudgetScreen() {
  const { isPremium } = usePremium();
  
  const [months, setMonths] = useState<Month[]>([
    {
      id: '1',
      name: 'JANUAR',
      isPinned: false,
      cash: 2500,
      expenses: [
        { id: 'e1', name: 'ESSEN', amount: 450, isPinned: false },
        { id: 'e2', name: 'TRANSPORT', amount: 120, isPinned: false },
      ],
    },
  ]);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    type: 'month' | 'expense' | null;
    itemId: string | null;
    x: number;
    y: number;
  }>({
    visible: false,
    type: null,
    itemId: null,
    x: 0,
    y: 0,
  });

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    type: 'cashLabel' | 'cashValue' | 'name' | 'amount' | null;
    itemId: string | null;
    value: string;
  }>({
    visible: false,
    type: null,
    itemId: null,
    value: '',
  });

  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const [premiumModal, setPremiumModal] = useState(false);

  const handleLongPress = useCallback((type: 'month' | 'expense', itemId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setContextMenu({
      visible: true,
      type,
      itemId,
      x: SCREEN_WIDTH / 2,
      y: 300,
    });
  }, []);

  const handleAddMonth = () => {
    if (!isPremium && months.length >= 1) {
      setPremiumModal(true);
      return;
    }
    const newMonth: Month = {
      id: Date.now().toString(),
      name: 'NEUER MONAT',
      isPinned: false,
      cash: 0,
      expenses: [],
    };
    setMonths([...months, newMonth]);
  };

  const handleDeleteMonth = (monthId: string) => {
    Alert.alert('Monat löschen', 'Möchtest du diesen Monat wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setMonths(months.filter((m) => m.id !== monthId));
          setContextMenu({ visible: false, type: null, itemId: null, x: 0, y: 0 });
        },
      },
    ]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert('Ausgabe löschen', 'Möchtest du diese Ausgabe wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setMonths(
            months.map((month) => ({
              ...month,
              expenses: month.expenses.filter((e) => e.id !== expenseId),
            }))
          );
          setContextMenu({ visible: false, type: null, itemId: null, x: 0, y: 0 });
        },
      },
    ]);
  };

  const handlePinToggle = () => {
    const { type, itemId } = contextMenu;
    if (type === 'month' && itemId) {
      setMonths(
        months.map((m) => (m.id === itemId ? { ...m, isPinned: !m.isPinned } : m))
      );
    } else if (type === 'expense' && itemId) {
      setMonths(
        months.map((month) => ({
          ...month,
          expenses: month.expenses.map((e) =>
            e.id === itemId ? { ...e, isPinned: !e.isPinned } : e
          ),
        }))
      );
    }
    setContextMenu({ visible: false, type: null, itemId: null, x: 0, y: 0 });
  };

  const handleDuplicate = () => {
    const { type, itemId } = contextMenu;
    if (type === 'month' && itemId) {
      const month = months.find((m) => m.id === itemId);
      if (month) {
        const newMonth = { ...month, id: Date.now().toString(), name: month.name + ' KOPIE' };
        setMonths([...months, newMonth]);
      }
    } else if (type === 'expense' && itemId) {
      setMonths(
        months.map((month) => {
          const expense = month.expenses.find((e) => e.id === itemId);
          if (expense) {
            return {
              ...month,
              expenses: [
                ...month.expenses,
                { ...expense, id: Date.now().toString(), name: expense.name + ' KOPIE' },
              ],
            };
          }
          return month;
        })
      );
    }
    setContextMenu({ visible: false, type: null, itemId: null, x: 0, y: 0 });
  };

  const openEditModal = (
    type: 'cashLabel' | 'cashValue' | 'name' | 'amount',
    itemId: string | null,
    currentValue: string
  ) => {
    setEditModal({ visible: true, type, itemId, value: currentValue });
    setContextMenu({ visible: false, type: null, itemId: null, x: 0, y: 0 });
  };

  const saveEdit = () => {
    const { type, itemId, value } = editModal;
    if (type === 'name' && itemId) {
      setMonths(
        months.map((m) => (m.id === itemId ? { ...m, name: value.toUpperCase() } : m))
      );
    } else if (type === 'amount' && itemId) {
      setMonths(
        months.map((month) => ({
          ...month,
          expenses: month.expenses.map((e) =>
            e.id === itemId ? { ...e, amount: parseFloat(value) || 0 } : e
          ),
        }))
      );
    } else if (type === 'cashValue') {
      setMonths(
        months.map((m, idx) =>
          idx === 0 ? { ...m, cash: parseFloat(value) || 0 } : m
        )
      );
    }
    setEditModal({ visible: false, type: null, itemId: null, value: '' });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    Alert.alert('Premium', `${type === 'onetime' ? 'Einmalzahlung' : 'Monatlich'} ausgewählt`);
    setPremiumModal(false);
  };

  const handlePremiumClose = () => {
    setPremiumModal(false);
  };

  const TopPill = ({
    label,
    value,
    editable,
    color,
    onPressLabel,
    onPressValue,
  }: {
    label: string;
    value: string;
    editable?: boolean;
    color?: string;
    onPressLabel?: () => void;
    onPressValue?: () => void;
  }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <View style={styles.topPill}>
        <Pressable
          onPress={() => {
            if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            scale.value = withSpring(0.95, {}, () => {
              scale.value = withSpring(1);
            });
            if (onPressLabel) onPressLabel();
          }}
          disabled={!editable}
        >
          <Animated.View style={animatedStyle}>
            <Text style={styles.topPillLabel}>{label}</Text>
          </Animated.View>
        </Pressable>
        <Pressable
          onPress={() => {
            if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            scale.value = withSpring(0.95, {}, () => {
              scale.value = withSpring(1);
            });
            if (onPressValue) onPressValue();
          }}
          disabled={!editable}
        >
          <Animated.View style={animatedStyle}>
            <Text style={[styles.topPillValue, color && { color }]}>{value}</Text>
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  const MonthPill = ({ month }: { month: Month }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const totalExpenses = month.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = month.cash - totalExpenses;

    return (
      <Pressable
        onLongPress={() => handleLongPress('month', month.id)}
        onPress={() => {
          if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSpring(0.98, {}, () => {
            scale.value = withSpring(1);
          });
        }}
      >
        <Animated.View style={[styles.monthPill, animatedStyle]}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthName}>{month.name}</Text>
            {month.isPinned && <Text style={styles.pinIcon}>📌</Text>}
          </View>
          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>BARGELD</Text>
            <Text style={styles.monthValue}>{formatNumber(month.cash)}</Text>
          </View>
          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>AUSGABEN</Text>
            <Text style={styles.monthValue}>{formatNumber(totalExpenses)}</Text>
          </View>
          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>ÜBRIG</Text>
            <Text style={[styles.monthValue, { color: colors.neonGreen }]}>
              {formatNumber(remaining)}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  const ExpensePill = ({ expense }: { expense: Expense }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onLongPress={() => handleLongPress('expense', expense.id)}
        onPress={() => {
          if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSpring(0.98, {}, () => {
            scale.value = withSpring(1);
          });
        }}
      >
        <Animated.View style={[styles.expensePill, animatedStyle]}>
          <View style={styles.expenseRow}>
            <Text style={styles.expenseName}>{expense.name}</Text>
            {expense.isPinned && <Text style={styles.pinIcon}>📌</Text>}
          </View>
          <Text style={styles.expenseAmount}>{formatNumber(expense.amount)}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>BUDGET</Text>

        <TopPill
          label="BARGELD"
          value={formatNumber(months[0]?.cash || 0)}
          editable
          onPressValue={() => openEditModal('cashValue', null, months[0]?.cash.toString() || '0')}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MONATE</Text>
          {months.map((month) => (
            <MonthPill key={month.id} month={month} />
          ))}
          <Pressable
            style={styles.addButton}
            onPress={() => {
              if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleAddMonth();
            }}
          >
            <Text style={styles.addButtonText}>+ MONAT HINZUFÜGEN</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUSGABEN</Text>
          {months[0]?.expenses.map((expense) => (
            <ExpensePill key={expense.id} expense={expense} />
          ))}
          <Pressable
            style={styles.addButton}
            onPress={() => {
              if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAddExpenseModal(true);
            }}
          >
            <Text style={styles.addButtonText}>+ AUSGABE HINZUFÜGEN</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Context Menu Modal */}
      <Modal visible={contextMenu.visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setContextMenu({ visible: false, type: null, itemId: null, x: 0, y: 0 })}
        >
          <View style={[styles.contextMenu, { top: contextMenu.y, left: contextMenu.x - 100 }]}>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                if (contextMenu.type === 'month' && contextMenu.itemId) {
                  const month = months.find((m) => m.id === contextMenu.itemId);
                  openEditModal('name', contextMenu.itemId, month?.name || '');
                } else if (contextMenu.type === 'expense' && contextMenu.itemId) {
                  const expense = months[0]?.expenses.find((e) => e.id === contextMenu.itemId);
                  openEditModal('name', contextMenu.itemId, expense?.name || '');
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
                if (contextMenu.type === 'month' && contextMenu.itemId) {
                  handleDeleteMonth(contextMenu.itemId);
                } else if (contextMenu.type === 'expense' && contextMenu.itemId) {
                  handleDeleteExpense(contextMenu.itemId);
                }
              }}
            >
              <Text style={[styles.contextMenuText, { color: colors.red }]}>Löschen</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModal.visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModal({ visible: false, type: null, itemId: null, value: '' })}
        >
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>Bearbeiten</Text>
            <TextInput
              style={styles.editModalInput}
              value={editModal.value}
              onChangeText={(text) => setEditModal({ ...editModal, value: text })}
              placeholder="Wert eingeben"
              placeholderTextColor="#666"
              keyboardType={editModal.type === 'amount' || editModal.type === 'cashValue' ? 'numeric' : 'default'}
            />
            <View style={styles.editModalButtons}>
              <Pressable
                style={styles.editModalButton}
                onPress={() => setEditModal({ visible: false, type: null, itemId: null, value: '' })}
              >
                <Text style={styles.editModalButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable style={[styles.editModalButton, styles.editModalButtonPrimary]} onPress={saveEdit}>
                <Text style={[styles.editModalButtonText, { color: colors.black }]}>Speichern</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Add Expense Modal */}
      <Modal visible={addExpenseModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setAddExpenseModal(false)}>
          <View style={styles.addExpenseModal}>
            <Text style={styles.addExpenseModalTitle}>Neue Ausgabe</Text>
            <TextInput
              style={styles.addExpenseModalInput}
              value={newExpenseName}
              onChangeText={setNewExpenseName}
              placeholder="Name (z.B. ESSEN)"
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.addExpenseModalInput}
              value={newExpenseAmount}
              onChangeText={setNewExpenseAmount}
              placeholder="Betrag"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <View style={styles.addExpenseModalButtons}>
              <Pressable
                style={styles.addExpenseModalButton}
                onPress={() => {
                  setAddExpenseModal(false);
                  setNewExpenseName('');
                  setNewExpenseAmount('');
                }}
              >
                <Text style={styles.addExpenseModalButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.addExpenseModalButton, styles.addExpenseModalButtonPrimary]}
                onPress={() => {
                  if (newExpenseName && newExpenseAmount) {
                    const newExpense: Expense = {
                      id: Date.now().toString(),
                      name: newExpenseName.toUpperCase(),
                      amount: parseFloat(newExpenseAmount) || 0,
                      isPinned: false,
                    };
                    setMonths(
                      months.map((m, idx) =>
                        idx === 0 ? { ...m, expenses: [...m.expenses, newExpense] } : m
                      )
                    );
                    setAddExpenseModal(false);
                    setNewExpenseName('');
                    setNewExpenseAmount('');
                  }
                }}
              >
                <Text style={[styles.addExpenseModalButtonText, { color: colors.black }]}>Hinzufügen</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    letterSpacing: 2,
  },
  topPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topPillLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  topPillValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  monthPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1.5,
  },
  pinIcon: {
    fontSize: 16,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  monthValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  expensePill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: colors.darkGray,
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
    color: colors.white,
    letterSpacing: 1,
  },
  editModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '92%',
    maxWidth: 500,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  editModalInput: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
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
    backgroundColor: colors.black,
  },
  editModalButtonPrimary: {
    backgroundColor: colors.neonGreen,
  },
  editModalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  addExpenseModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '92%',
    maxWidth: 500,
  },
  addExpenseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  addExpenseModalInput: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    marginBottom: 16,
  },
  addExpenseModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addExpenseModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  addExpenseModalButtonPrimary: {
    backgroundColor: colors.neonGreen,
  },
  addExpenseModalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
});
