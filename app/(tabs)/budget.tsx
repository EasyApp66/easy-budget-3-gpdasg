
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import React, { useState, useCallback } from 'react';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { isPremium } = usePremium();
  const [selectedMonthId, setSelectedMonthId] = useState<string>('1');
  const [months, setMonths] = useState<Month[]>([
    {
      id: '1',
      name: 'JANUAR',
      isPinned: false,
      cash: 93838,
      expenses: [
        { id: '1', name: 'MIETE', amount: 1200, isPinned: false },
        { id: '2', name: 'ESSEN', amount: 450, isPinned: false },
      ],
    },
    {
      id: '2',
      name: 'FEBRUAR',
      isPinned: false,
      cash: 85000,
      expenses: [],
    },
  ]);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuType, setContextMenuType] = useState<'month' | 'expense'>('month');
  const [contextMenuItemId, setContextMenuItemId] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'cashLabel' | 'cashValue' | 'name' | 'amount'>('name');
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const [paywallVisible, setPaywallVisible] = useState(false);

  const selectedMonth = months.find((m) => m.id === selectedMonthId) || months[0];

  const totalExpenses = selectedMonth.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = selectedMonth.cash - totalExpenses;

  const handleLongPress = useCallback((type: 'month' | 'expense', itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContextMenuType(type);
    setContextMenuItemId(itemId);
    setContextMenuVisible(true);
  }, []);

  const handleAddMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isPremium && months.length >= 2) {
      setPaywallVisible(true);
      return;
    }
    const newMonth: Month = {
      id: Date.now().toString(),
      name: `MONAT ${months.length + 1}`,
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
          if (selectedMonthId === monthId) {
            setSelectedMonthId(months[0]?.id || '');
          }
          setContextMenuVisible(false);
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
            months.map((m) =>
              m.id === selectedMonthId
                ? { ...m, expenses: m.expenses.filter((e) => e.id !== expenseId) }
                : m
            )
          );
          setContextMenuVisible(false);
        },
      },
    ]);
  };

  const handlePinToggle = () => {
    if (contextMenuType === 'month' && contextMenuItemId) {
      setMonths(
        months.map((m) =>
          m.id === contextMenuItemId ? { ...m, isPinned: !m.isPinned } : m
        )
      );
    } else if (contextMenuType === 'expense' && contextMenuItemId) {
      setMonths(
        months.map((m) =>
          m.id === selectedMonthId
            ? {
                ...m,
                expenses: m.expenses.map((e) =>
                  e.id === contextMenuItemId ? { ...e, isPinned: !e.isPinned } : e
                ),
              }
            : m
        )
      );
    }
    setContextMenuVisible(false);
  };

  const handleDuplicate = () => {
    if (contextMenuType === 'month' && contextMenuItemId) {
      const monthToDuplicate = months.find((m) => m.id === contextMenuItemId);
      if (monthToDuplicate) {
        const newMonth: Month = {
          ...monthToDuplicate,
          id: Date.now().toString(),
          name: `${monthToDuplicate.name} KOPIE`,
          isPinned: false,
        };
        setMonths([...months, newMonth]);
      }
    } else if (contextMenuType === 'expense' && contextMenuItemId) {
      const expenseToDuplicate = selectedMonth.expenses.find((e) => e.id === contextMenuItemId);
      if (expenseToDuplicate) {
        const newExpense: Expense = {
          ...expenseToDuplicate,
          id: Date.now().toString(),
          isPinned: false,
        };
        setMonths(
          months.map((m) =>
            m.id === selectedMonthId
              ? { ...m, expenses: [...m.expenses, newExpense] }
              : m
          )
        );
      }
    }
    setContextMenuVisible(false);
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
    if (editType === 'cashValue') {
      const numValue = parseFloat(editValue.replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue)) {
        setMonths(
          months.map((m) =>
            m.id === selectedMonthId ? { ...m, cash: numValue } : m
          )
        );
      }
    } else if (editType === 'name' && editItemId) {
      if (contextMenuType === 'month') {
        setMonths(
          months.map((m) =>
            m.id === editItemId ? { ...m, name: editValue.toUpperCase() } : m
          )
        );
      } else {
        setMonths(
          months.map((m) =>
            m.id === selectedMonthId
              ? {
                  ...m,
                  expenses: m.expenses.map((e) =>
                    e.id === editItemId ? { ...e, name: editValue.toUpperCase() } : e
                  ),
                }
              : m
          )
        );
      }
    } else if (editType === 'amount' && editItemId) {
      const numValue = parseFloat(editValue.replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue)) {
        setMonths(
          months.map((m) =>
            m.id === selectedMonthId
              ? {
                  ...m,
                  expenses: m.expenses.map((e) =>
                    e.id === editItemId ? { ...e, amount: numValue } : e
                  ),
                }
              : m
          )
        );
      }
    }
    setEditModalVisible(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-CH').replace(/,/g, "'");
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    Alert.alert('Premium', `${type === 'onetime' ? 'Einmaliger' : 'Monatlicher'} Kauf simuliert`);
    setPaywallVisible(false);
  };

  const handlePremiumClose = () => {
    setPaywallVisible(false);
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
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = (callback?: () => void) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      if (callback) callback();
    };

    return (
      <Animated.View style={[styles.topPill, animatedStyle]}>
        <Pressable onPress={() => editable && onPressLabel && handlePress(onPressLabel)}>
          <Text style={styles.topPillLabel}>{label}</Text>
        </Pressable>
        <Pressable onPress={() => editable && onPressValue && handlePress(onPressValue)}>
          <Text style={[styles.topPillValue, { color }]}>{value}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const MonthPill = ({ month }: { month: Month }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const isSelected = month.id === selectedMonthId;

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
          });
          setSelectedMonthId(month.id);
        }}
        onLongPress={() => handleLongPress('month', month.id)}
      >
        <Animated.View
          style={[
            styles.monthPill,
            isSelected && styles.monthPillSelected,
            animatedStyle,
          ]}
        >
          <Text style={[styles.monthPillText, isSelected && styles.monthPillTextSelected]}>
            {month.name}
          </Text>
          {month.isPinned && (
            <Text style={styles.pinIndicator}>📌</Text>
          )}
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
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
          });
        }}
        onLongPress={() => handleLongPress('expense', expense.id)}
      >
        <Animated.View style={[styles.expensePill, animatedStyle]}>
          <View style={styles.expenseLeft}>
            <Text style={styles.expenseName}>{expense.name}</Text>
            {expense.isPinned && <Text style={styles.pinIndicator}>📌</Text>}
          </View>
          <Text style={styles.expenseAmount}>{formatNumber(expense.amount)}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  const AddMonthButton = () => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
          });
          handleAddMonth();
        }}
      >
        <Animated.View style={[styles.addMonthButton, animatedStyle]}>
          <Text style={styles.addMonthButtonText}>+</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cash Balance Card */}
        <View style={styles.cashBalanceCard}>
          <View style={styles.cashBalanceLeft}>
            <Pressable
              onPress={() =>
                openEditModal('cashLabel', null, 'CASH')
              }
            >
              <Text style={styles.cashBalanceLabel}>CASH</Text>
            </Pressable>
            <Text style={styles.cashBalanceSubLabel}>
              TOTAL {formatNumber(totalExpenses)}
            </Text>
            <Text style={styles.cashBalanceSubLabel}>
              BLEIBT {formatNumber(remaining)}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              openEditModal('cashValue', null, selectedMonth.cash.toString())
            }
          >
            <Text style={styles.cashBalanceValue}>
              {formatNumber(selectedMonth.cash)}
            </Text>
          </Pressable>
        </View>

        {/* Month Pills with Sticky Add Button */}
        <View style={styles.monthsSection}>
          <View style={styles.monthsRow}>
            <AddMonthButton />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthsScrollContent}
              style={styles.monthsScroll}
            >
              {months.map((month) => (
                <MonthPill key={month.id} month={month} />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Expenses */}
        <View style={styles.expensesSection}>
          {selectedMonth.expenses.map((expense) => (
            <ExpensePill key={expense.id} expense={expense} />
          ))}
        </View>
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
                const item =
                  contextMenuType === 'month'
                    ? months.find((m) => m.id === contextMenuItemId)
                    : selectedMonth.expenses.find((e) => e.id === contextMenuItemId);
                if (item) {
                  openEditModal(
                    'name',
                    contextMenuItemId,
                    contextMenuType === 'month' ? (item as Month).name : (item as Expense).name
                  );
                }
              }}
            >
              <Text style={styles.contextMenuText}>Umbenennen</Text>
            </Pressable>
            {contextMenuType === 'expense' && (
              <Pressable
                style={styles.contextMenuItem}
                onPress={() => {
                  const expense = selectedMonth.expenses.find((e) => e.id === contextMenuItemId);
                  if (expense) {
                    openEditModal('amount', contextMenuItemId, expense.amount.toString());
                  }
                }}
              >
                <Text style={styles.contextMenuText}>Betrag ändern</Text>
              </Pressable>
            )}
            <Pressable style={styles.contextMenuItem} onPress={handlePinToggle}>
              <Text style={styles.contextMenuText}>
                {contextMenuType === 'month'
                  ? months.find((m) => m.id === contextMenuItemId)?.isPinned
                    ? 'Entpinnen'
                    : 'Pinnen'
                  : selectedMonth.expenses.find((e) => e.id === contextMenuItemId)?.isPinned
                  ? 'Entpinnen'
                  : 'Pinnen'}
              </Text>
            </Pressable>
            <Pressable style={styles.contextMenuItem} onPress={handleDuplicate}>
              <Text style={styles.contextMenuText}>Duplizieren</Text>
            </Pressable>
            <Pressable
              style={[styles.contextMenuItem, styles.contextMenuItemDanger]}
              onPress={() => {
                if (contextMenuType === 'month' && contextMenuItemId) {
                  handleDeleteMonth(contextMenuItemId);
                } else if (contextMenuType === 'expense' && contextMenuItemId) {
                  handleDeleteExpense(contextMenuItemId);
                }
              }}
            >
              <Text style={[styles.contextMenuText, styles.contextMenuTextDanger]}>Löschen</Text>
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
              {editType === 'cashLabel'
                ? 'Label ändern'
                : editType === 'cashValue'
                ? 'Betrag ändern'
                : editType === 'name'
                ? 'Name ändern'
                : 'Betrag ändern'}
            </Text>
            <TextInput
              style={styles.editModalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editType === 'cashValue' || editType === 'amount' ? '0' : 'Name'}
              placeholderTextColor="#666"
              keyboardType={
                editType === 'cashValue' || editType === 'amount' ? 'numeric' : 'default'
              }
              autoFocus
            />
            <View style={styles.editModalButtons}>
              <Pressable
                style={[styles.editModalButton, styles.editModalButtonCancel]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.editModalButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.editModalButton, styles.editModalButtonSave]}
                onPress={saveEdit}
              >
                <Text style={[styles.editModalButtonText, styles.editModalButtonTextSave]}>
                  Speichern
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        visible={addExpenseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddExpenseModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAddExpenseModalVisible(false)}
        >
          <View style={styles.addExpenseModal}>
            <Text style={styles.addExpenseModalTitle}>Neue Ausgabe</Text>
            <TextInput
              style={styles.addExpenseModalInput}
              value={newExpenseName}
              onChangeText={setNewExpenseName}
              placeholder="Name"
              placeholderTextColor="#666"
              autoFocus
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
                style={[styles.addExpenseModalButton, styles.addExpenseModalButtonCancel]}
                onPress={() => {
                  setAddExpenseModalVisible(false);
                  setNewExpenseName('');
                  setNewExpenseAmount('');
                }}
              >
                <Text style={styles.addExpenseModalButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.addExpenseModalButton, styles.addExpenseModalButtonAdd]}
                onPress={() => {
                  const amount = parseFloat(newExpenseAmount.replace(/[^0-9.-]/g, ''));
                  if (newExpenseName && !isNaN(amount)) {
                    const newExpense: Expense = {
                      id: Date.now().toString(),
                      name: newExpenseName.toUpperCase(),
                      amount,
                      isPinned: false,
                    };
                    setMonths(
                      months.map((m) =>
                        m.id === selectedMonthId
                          ? { ...m, expenses: [...m.expenses, newExpense] }
                          : m
                      )
                    );
                    setAddExpenseModalVisible(false);
                    setNewExpenseName('');
                    setNewExpenseAmount('');
                  }
                }}
              >
                <Text
                  style={[
                    styles.addExpenseModalButtonText,
                    styles.addExpenseModalButtonTextAdd,
                  ]}
                >
                  Hinzufügen
                </Text>
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
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  cashBalanceCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 180,
  },
  cashBalanceLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  cashBalanceLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  cashBalanceSubLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 1,
    marginTop: 6,
  },
  cashBalanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  monthsSection: {
    marginBottom: 24,
  },
  monthsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMonthButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addMonthButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 32,
  },
  monthsScroll: {
    flex: 1,
  },
  monthsScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  monthPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginRight: 12,
  },
  monthPillSelected: {
    backgroundColor: colors.neonGreen,
  },
  monthPillText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1.2,
  },
  monthPillTextSelected: {
    color: colors.black,
  },
  pinIndicator: {
    marginLeft: 8,
    fontSize: 14,
  },
  expensesSection: {
    gap: 12,
  },
  expensePill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1.2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  topPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  topPillLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  topPillValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
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
  contextMenuItemDanger: {
    backgroundColor: 'rgba(196, 60, 62, 0.1)',
  },
  contextMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  contextMenuTextDanger: {
    color: colors.red,
  },
  editModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 20,
    letterSpacing: 1,
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
  },
  editModalButtonCancel: {
    backgroundColor: colors.black,
  },
  editModalButtonSave: {
    backgroundColor: colors.neonGreen,
  },
  editModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  editModalButtonTextSave: {
    color: colors.black,
  },
  addExpenseModal: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  addExpenseModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 20,
    letterSpacing: 1,
  },
  addExpenseModalInput: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    marginBottom: 12,
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
  },
  addExpenseModalButtonCancel: {
    backgroundColor: colors.black,
  },
  addExpenseModalButtonAdd: {
    backgroundColor: colors.neonGreen,
  },
  addExpenseModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  addExpenseModalButtonTextAdd: {
    color: colors.black,
  },
});
