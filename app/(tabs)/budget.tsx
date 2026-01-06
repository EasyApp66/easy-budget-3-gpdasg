
import { SafeAreaView } from 'react-native-safe-area-context';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
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
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import React, { useState, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { usePremium } from '@/hooks/usePremium';

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

export default function BudgetScreen() {
  const { isPremium, showPaywall, setShowPaywall } = usePremium();
  
  const [months, setMonths] = useState<Month[]>([
    {
      id: '1',
      name: 'JANUAR',
      isPinned: true,
      cash: 2500,
      expenses: [
        { id: '1', name: 'PARKPLATZ', amount: 150, isPinned: false },
        { id: '2', name: 'KLEIDER', amount: 200, isPinned: false },
      ],
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'month' | 'expense'>('expense');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'cashLabel' | 'cashValue' | 'name' | 'amount'>('name');
  const [editValue, setEditValue] = useState('');
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const scaleMonth = useSharedValue(1);
  const scaleExpense = useSharedValue(1);

  const animatedStyleMonth = useAnimatedStyle(() => ({
    transform: [{ scale: scaleMonth.value }],
  }));

  const animatedStyleExpense = useAnimatedStyle(() => ({
    transform: [{ scale: scaleExpense.value }],
  }));

  const handleLongPress = (type: 'month' | 'expense', itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItemId(itemId);
    setSelectedItemType(type);
    setContextMenuVisible(true);
  };

  const handleAddMonth = () => {
    if (!isPremium) {
      setShowPaywall(true);
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteMonth = (monthId: string) => {
    Alert.alert('Monat löschen', 'Möchtest du diesen Monat wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setMonths(months.filter((m) => m.id !== monthId));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handlePinToggle = () => {
    if (selectedItemType === 'month') {
      setMonths(
        months.map((m) =>
          m.id === selectedItemId ? { ...m, isPinned: !m.isPinned } : m
        )
      );
    } else {
      setMonths(
        months.map((month) => ({
          ...month,
          expenses: month.expenses.map((e) =>
            e.id === selectedItemId ? { ...e, isPinned: !e.isPinned } : e
          ),
        }))
      );
    }
    setContextMenuVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDuplicate = () => {
    if (!isPremium) {
      setContextMenuVisible(false);
      setShowPaywall(true);
      return;
    }
    if (selectedItemType === 'month') {
      const monthToDuplicate = months.find((m) => m.id === selectedItemId);
      if (monthToDuplicate) {
        const newMonth: Month = {
          ...monthToDuplicate,
          id: Date.now().toString(),
          name: monthToDuplicate.name + ' (KOPIE)',
          isPinned: false,
        };
        setMonths([...months, newMonth]);
      }
    } else {
      setMonths(
        months.map((month) => {
          const expenseToDuplicate = month.expenses.find((e) => e.id === selectedItemId);
          if (expenseToDuplicate) {
            const newExpense: Expense = {
              ...expenseToDuplicate,
              id: Date.now().toString(),
              isPinned: false,
            };
            return { ...month, expenses: [...month.expenses, newExpense] };
          }
          return month;
        })
      );
    }
    setContextMenuVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openEditModal = (
    type: 'cashLabel' | 'cashValue' | 'name' | 'amount',
    itemId: string | null,
    currentValue: string
  ) => {
    setEditType(type);
    setEditItemId(itemId);
    setEditValue(currentValue);
    setEditModalVisible(true);
    setContextMenuVisible(false);
  };

  const saveEdit = () => {
    if (editType === 'cashLabel') {
      setMonths(
        months.map((m) =>
          m.id === editItemId ? { ...m, name: editValue.toUpperCase() } : m
        )
      );
    } else if (editType === 'cashValue') {
      const numValue = parseFloat(editValue) || 0;
      setMonths(
        months.map((m) => (m.id === editItemId ? { ...m, cash: numValue } : m))
      );
    } else if (editType === 'name') {
      setMonths(
        months.map((month) => ({
          ...month,
          expenses: month.expenses.map((e) =>
            e.id === editItemId ? { ...e, name: editValue.toUpperCase() } : e
          ),
        }))
      );
    } else if (editType === 'amount') {
      const numValue = parseFloat(editValue) || 0;
      setMonths(
        months.map((month) => ({
          ...month,
          expenses: month.expenses.map((e) =>
            e.id === editItemId ? { ...e, amount: numValue } : e
          ),
        }))
      );
    }
    setEditModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    Alert.alert('Premium', `${type === 'onetime' ? 'Einmaliger' : 'Monatlicher'} Kauf wird verarbeitet...`);
    setShowPaywall(false);
  };

  const handlePremiumClose = () => {
    setShowPaywall(false);
  };

  const handleSaveNewExpense = () => {
    if (!newExpenseName.trim() || !newExpenseAmount.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }

    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount)) {
      Alert.alert('Fehler', 'Bitte gib einen gültigen Betrag ein.');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: newExpenseName.toUpperCase(),
      amount: amount,
      isPinned: false,
    };

    setMonths(
      months.map((month, index) =>
        index === 0
          ? { ...month, expenses: [...month.expenses, newExpense] }
          : month
      )
    );

    setNewExpenseName('');
    setNewExpenseAmount('');
    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCancelNewExpense = () => {
    setNewExpenseName('');
    setNewExpenseAmount('');
    setShowAddModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const TopPill = ({
    label,
    value,
    editable = false,
    color = colors.white,
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
    const scaleLabel = useSharedValue(1);
    const scaleValue = useSharedValue(1);

    const animatedStyleLabel = useAnimatedStyle(() => ({
      transform: [{ scale: scaleLabel.value }],
    }));

    const animatedStyleValue = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));

    return (
      <View style={styles.topPill}>
        <Pressable
          onPressIn={() => {
            scaleLabel.value = withSpring(0.95);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => {
            scaleLabel.value = withSpring(1);
          }}
          onPress={onPressLabel}
          disabled={!editable}
        >
          <Animated.View style={animatedStyleLabel}>
            <Text style={styles.topPillLabel}>{label}</Text>
          </Animated.View>
        </Pressable>
        <Pressable
          onPressIn={() => {
            scaleValue.value = withSpring(0.95);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => {
            scaleValue.value = withSpring(1);
          }}
          onPress={onPressValue}
          disabled={!editable}
        >
          <Animated.View style={animatedStyleValue}>
            <Text style={[styles.topPillValue, { color }]}>{value}</Text>
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  const MonthPill = ({ month }: { month: Month }) => {
    const totalExpenses = month.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = month.cash - totalExpenses;

    return (
      <Animated.View style={[styles.monthContainer, animatedStyleMonth]}>
        <Pressable
          onLongPress={() => handleLongPress('month', month.id)}
          delayLongPress={600}
          onPressIn={() => {
            scaleMonth.value = withSpring(0.98);
          }}
          onPressOut={() => {
            scaleMonth.value = withSpring(1);
          }}
        >
          <View style={styles.monthPill}>
            <TopPill
              label={month.name}
              value={`CHF ${formatNumber(month.cash)}`}
              editable
              onPressLabel={() => openEditModal('cashLabel', month.id, month.name)}
              onPressValue={() => openEditModal('cashValue', month.id, month.cash.toString())}
            />
            <TopPill
              label="TOTAL"
              value={`CHF ${formatNumber(totalExpenses)}`}
              color={colors.red}
            />
            <TopPill
              label="BLEIBT"
              value={`CHF ${formatNumber(remaining)}`}
              color={remaining >= 0 ? colors.neonGreen : colors.red}
            />
            {month.expenses.map((expense) => (
              <ExpensePill key={expense.id} expense={expense} />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const ExpensePill = ({ expense }: { expense: Expense }) => (
    <Animated.View style={animatedStyleExpense}>
      <Pressable
        onLongPress={() => handleLongPress('expense', expense.id)}
        delayLongPress={600}
        onPressIn={() => {
          scaleExpense.value = withSpring(0.98);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scaleExpense.value = withSpring(1);
        }}
      >
        <View style={styles.expensePill}>
          <Text style={styles.expenseName}>{expense.name}</Text>
          <Text style={styles.expenseAmount}>CHF {formatNumber(expense.amount)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {months.map((month) => (
          <MonthPill key={month.id} month={month} />
        ))}
        <Pressable onPress={handleAddMonth} style={styles.addMonthButton}>
          <Text style={styles.addMonthText}>+ MONAT HINZUFÜGEN</Text>
        </Pressable>
      </ScrollView>

      {/* NEW COMPACT ADD EXPENSE MODAL */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelNewExpense}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancelNewExpense}>
          <Pressable style={styles.newModalContainer} onPress={() => {}}>
            <Text style={styles.newModalTitle}>Neue Ausgabe</Text>
            
            <TextInput
              style={styles.newModalInput}
              placeholder="Name (z.B. ESSEN)"
              placeholderTextColor="#666"
              value={newExpenseName}
              onChangeText={setNewExpenseName}
              autoCapitalize="characters"
            />
            
            <TextInput
              style={styles.newModalInput}
              placeholder="Betrag"
              placeholderTextColor="#666"
              value={newExpenseAmount}
              onChangeText={setNewExpenseAmount}
              keyboardType="decimal-pad"
            />
            
            <View style={styles.newModalButtonRow}>
              <Pressable
                style={styles.newModalCancelButton}
                onPress={handleCancelNewExpense}
                onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={styles.newModalCancelText}>Abbrechen</Text>
              </Pressable>
              
              <Pressable
                style={styles.newModalAddButton}
                onPress={handleSaveNewExpense}
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
                if (selectedItemType === 'month') {
                  const month = months.find((m) => m.id === selectedItemId);
                  if (month) {
                    openEditModal('cashLabel', month.id, month.name);
                  }
                } else {
                  const expense = months
                    .flatMap((m) => m.expenses)
                    .find((e) => e.id === selectedItemId);
                  if (expense) {
                    openEditModal('name', expense.id, expense.name);
                  }
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
                if (selectedItemType === 'month' && selectedItemId) {
                  handleDeleteMonth(selectedItemId);
                } else if (selectedItemId) {
                  handleDeleteExpense(selectedItemId);
                }
              }}
            >
              <Text style={[styles.contextMenuText, { color: colors.red }]}>Löschen</Text>
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
              keyboardType={
                editType === 'cashValue' || editType === 'amount' ? 'decimal-pad' : 'default'
              }
              autoCapitalize={editType === 'name' || editType === 'cashLabel' ? 'characters' : 'none'}
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
    backgroundColor: colors.black,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  monthContainer: {
    marginBottom: 20,
  },
  monthPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 16,
  },
  topPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topPillLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  topPillValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  expensePill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  addMonthButton: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addMonthText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neonGreen,
    letterSpacing: 1,
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
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  newModalInput: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
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
    color: colors.white,
    letterSpacing: 0.3,
  },
  newModalAddButton: {
    flex: 1,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newModalAddText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: 0.3,
  },

  contextMenu: {
    backgroundColor: colors.darkGray,
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
    color: colors.white,
    textAlign: 'center',
  },
  editModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editCancelButton: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  editSaveButton: {
    flex: 1,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
});
