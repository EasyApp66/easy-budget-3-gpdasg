
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
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
  const { isPremium, checkLimit } = usePremium();
  
  const [months, setMonths] = useState<Month[]>([
    {
      id: '1',
      name: 'JHZFJH',
      isPinned: true,
      cash: 93838,
      expenses: [
        { id: '1', name: 'ESSEN', amount: 250, isPinned: true },
        { id: '2', name: 'MIETE', amount: 2005, isPinned: false },
        { id: '3', name: 'PARKPLATZ', amount: 150, isPinned: false },
        { id: '4', name: 'KLEIDER', amount: 120, isPinned: false },
      ],
    },
    {
      id: '2',
      name: 'KEJNEND',
      isPinned: false,
      cash: 0,
      expenses: [],
    },
  ]);

  const [selectedMonthId, setSelectedMonthId] = useState('1');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    type: 'month' | 'expense' | null;
    itemId: string | null;
  }>({ visible: false, type: null, itemId: null });

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    type: 'cashLabel' | 'cashValue' | 'name' | 'amount' | null;
    value: string;
    itemId: string | null;
  }>({ visible: false, type: null, value: '', itemId: null });

  const [cashLabel, setCashLabel] = useState('CASH');
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'expense' | 'month'; id?: string } | null>(null);

  const selectedMonth = months.find((m) => m.id === selectedMonthId);
  const totalExpenses = selectedMonth?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
  const remaining = (selectedMonth?.cash || 0) - totalExpenses;

  const sortedMonths = [...months].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const sortedExpenses = [...(selectedMonth?.expenses || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleLongPress = (type: 'month' | 'expense', itemId: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setContextMenu({ visible: true, type, itemId });
  };

  const handleAddMonth = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Check premium limit
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses.length, 0);
    if (checkLimit(totalExpenses, months.length + 1, 0)) {
      setPendingAction({ type: 'month' });
      setPremiumModalVisible(true);
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

  // Fixed: Wrapped handleAddExpense in useCallback to fix exhaustive-deps warning
  const handleAddExpense = useCallback(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!selectedMonth) return;

    // Check premium limit
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses.length, 0);
    if (checkLimit(totalExpenses + 1, months.length, 0)) {
      setPendingAction({ type: 'expense' });
      setPremiumModalVisible(true);
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: 'NEUE AUSGABE',
      amount: 0,
      isPinned: false,
    };

    setMonths((prevMonths) =>
      prevMonths.map((m) =>
        m.id === selectedMonthId
          ? { ...m, expenses: [...m.expenses, newExpense] }
          : m
      )
    );
  }, [selectedMonth, selectedMonthId, months, checkLimit]);

  // Expose add function globally for tab bar
  React.useEffect(() => {
    (global as any).addExpense = handleAddExpense;
    return () => {
      delete (global as any).addExpense;
    };
  }, [handleAddExpense]);

  const handleDeleteMonth = (monthId: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setMonths(months.filter((m) => m.id !== monthId));
    if (selectedMonthId === monthId && months.length > 1) {
      setSelectedMonthId(months.find((m) => m.id !== monthId)?.id || '');
    }
    setContextMenu({ visible: false, type: null, itemId: null });
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setMonths(
      months.map((m) =>
        m.id === selectedMonthId
          ? { ...m, expenses: m.expenses.filter((e) => e.id !== expenseId) }
          : m
      )
    );
  };

  const handlePinToggle = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { type, itemId } = contextMenu;

    if (type === 'month' && itemId) {
      setMonths(
        months.map((m) =>
          m.id === itemId ? { ...m, isPinned: !m.isPinned } : m
        )
      );
    } else if (type === 'expense' && itemId) {
      setMonths(
        months.map((m) =>
          m.id === selectedMonthId
            ? {
                ...m,
                expenses: m.expenses.map((e) =>
                  e.id === itemId ? { ...e, isPinned: !e.isPinned } : e
                ),
              }
            : m
        )
      );
    }
    setContextMenu({ visible: false, type: null, itemId: null });
  };

  const handleDuplicate = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { type, itemId } = contextMenu;

    if (type === 'month' && itemId) {
      const month = months.find((m) => m.id === itemId);
      if (month) {
        const newMonth = {
          ...month,
          id: Date.now().toString(),
          name: `${month.name} KOPIE`,
          isPinned: false,
        };
        setMonths([...months, newMonth]);
      }
    } else if (type === 'expense' && itemId) {
      const expense = selectedMonth?.expenses.find((e) => e.id === itemId);
      if (expense) {
        const newExpense = {
          ...expense,
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
    setContextMenu({ visible: false, type: null, itemId: null });
  };

  const openEditModal = (
    type: 'cashLabel' | 'cashValue' | 'name' | 'amount',
    itemId: string | null,
    currentValue: string
  ) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditModal({ visible: true, type, value: currentValue, itemId });
    setContextMenu({ visible: false, type: null, itemId: null });
  };

  const saveEdit = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { type, value, itemId } = editModal;

    if (type === 'cashLabel') {
      setCashLabel(value);
    } else if (type === 'cashValue') {
      setMonths(
        months.map((m) =>
          m.id === selectedMonthId
            ? { ...m, cash: parseFloat(value.replace(/'/g, '')) || 0 }
            : m
        )
      );
    } else if (type === 'name' && itemId) {
      if (contextMenu.type === 'month') {
        setMonths(months.map((m) => (m.id === itemId ? { ...m, name: value } : m)));
      } else {
        setMonths(
          months.map((m) =>
            m.id === selectedMonthId
              ? {
                  ...m,
                  expenses: m.expenses.map((e) =>
                    e.id === itemId ? { ...e, name: value } : e
                  ),
                }
              : m
          )
        );
      }
    } else if (type === 'amount' && itemId) {
      setMonths(
        months.map((m) =>
          m.id === selectedMonthId
            ? {
                ...m,
                expenses: m.expenses.map((e) =>
                  e.id === itemId ? { ...e, amount: parseFloat(value.replace(/'/g, '')) || 0 } : e
                ),
              }
            : m
        )
      );
    }

    setEditModal({ visible: false, type: null, value: '', itemId: null });
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: Backend Integration - Process premium purchase via Stripe
    console.log(`Premium purchase: ${type}`);
    Alert.alert('Erfolg!', 'Premium wurde aktiviert! (Placeholder - Stripe Integration folgt)');
    setPremiumModalVisible(false);
    setPendingAction(null);
  };

  const handlePremiumClose = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Delete the pending item when closing without purchase
    if (pendingAction?.type === 'expense' && pendingAction.id) {
      handleDeleteExpense(pendingAction.id);
    } else if (pendingAction?.type === 'month' && pendingAction.id) {
      handleDeleteMonth(pendingAction.id);
    }
    setPremiumModalVisible(false);
    setPendingAction(null);
  };

  const CashBalanceCard = () => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={[styles.cashBalanceCard, animatedStyle]}>
        {/* Two-column layout: Left column for labels, Right column for main balance */}
        <View style={styles.cashBalanceContent}>
          {/* Left Column - Stacked Labels */}
          <View style={styles.cashBalanceLeft}>
            <Pressable
              onPress={() => {
                if (Platform.OS === 'ios' || Platform.OS === 'android') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                scale.value = withSpring(0.98, {}, () => {
                  scale.value = withSpring(1);
                });
                openEditModal('cashLabel', null, cashLabel);
              }}
            >
              <Text style={styles.cashBalanceTitle}>{cashLabel}</Text>
            </Pressable>
            
            <View style={styles.cashBalanceSubInfo}>
              <Text style={styles.cashBalanceSubLabel}>TOTAL</Text>
              <Text style={styles.cashBalanceSubValue}>{formatNumber(totalExpenses)}</Text>
            </View>
            
            <View style={styles.cashBalanceSubInfo}>
              <Text style={styles.cashBalanceSubLabel}>BLEIBT</Text>
              <Text style={[
                styles.cashBalanceSubValue,
                { color: remaining >= 0 ? colors.neonGreen : colors.red }
              ]}>
                {formatNumber(Math.abs(remaining))}
              </Text>
            </View>
          </View>

          {/* Right Column - Main Balance Number (Bottom Right) */}
          <Pressable
            style={styles.cashBalanceRight}
            onPress={() => {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              scale.value = withSpring(0.98, {}, () => {
                scale.value = withSpring(1);
              });
              openEditModal('cashValue', null, selectedMonth?.cash.toString() || '0');
            }}
          >
            <Text style={styles.cashBalanceMainValue}>
              {formatNumber(selectedMonth?.cash || 0)}
            </Text>
          </Pressable>
        </View>
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
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
          });
          setSelectedMonthId(month.id);
        }}
        onLongPress={() => handleLongPress('month', month.id)}
        delayLongPress={600}
      >
        <Animated.View
          style={[
            styles.monthPill,
            isSelected && styles.monthPillSelected,
            month.isPinned && styles.pinnedBorder,
            animatedStyle,
          ]}
        >
          <Text style={[styles.monthPillText, isSelected && styles.monthPillTextSelected]}>
            {month.name}
          </Text>
          <Pressable
            onPress={() => handleDeleteMonth(month.id)}
            hitSlop={10}
            style={styles.deleteIcon}
          >
            <Text style={styles.deleteX}>✕</Text>
          </Pressable>
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
        delayLongPress={600}
        style={styles.expenseContainer}
      >
        <Animated.View
          style={[
            styles.expensePill,
            expense.isPinned && styles.pinnedBorder,
            animatedStyle,
          ]}
        >
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseName}>{expense.name}</Text>
            <Pressable
              onPress={() => {
                if (Platform.OS === 'ios' || Platform.OS === 'android') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleDeleteExpense(expense.id);
              }}
              hitSlop={10}
            >
              <Text style={styles.deleteX}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.expenseAmount}>
            {formatNumber(expense.amount)}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cash Balance Card - New Robust Design */}
        <CashBalanceCard />

        {/* Month Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthRow}
          contentContainerStyle={styles.monthRowContent}
        >
          <Pressable onPress={handleAddMonth} style={styles.addMonthButton}>
            <Text style={styles.addMonthText}>+</Text>
          </Pressable>
          {sortedMonths.map((month) => (
            <MonthPill key={month.id} month={month} />
          ))}
        </ScrollView>

        {/* Expenses Grid */}
        <View style={styles.expensesGrid}>
          {sortedExpenses.map((expense) => (
            <ExpensePill key={expense.id} expense={expense} />
          ))}
        </View>
      </ScrollView>

      {/* Context Menu Modal */}
      <Modal
        visible={contextMenu.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setContextMenu({ visible: false, type: null, itemId: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setContextMenu({ visible: false, type: null, itemId: null })}
        >
          <View style={styles.contextMenu}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                const item =
                  contextMenu.type === 'month'
                    ? months.find((m) => m.id === contextMenu.itemId)
                    : selectedMonth?.expenses.find((e) => e.id === contextMenu.itemId);
                openEditModal('name', contextMenu.itemId, item?.name || '');
              }}
            >
              <Text style={styles.menuItemText}>Namen anpassen</Text>
            </Pressable>

            {contextMenu.type === 'expense' && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  const expense = selectedMonth?.expenses.find(
                    (e) => e.id === contextMenu.itemId
                  );
                  openEditModal('amount', contextMenu.itemId, expense?.amount.toString() || '0');
                }}
              >
                <Text style={styles.menuItemText}>Zahl anpassen</Text>
              </Pressable>
            )}

            <Pressable style={styles.menuItem} onPress={handleDuplicate}>
              <Text style={styles.menuItemText}>Duplizieren</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={handlePinToggle}>
              <Text style={styles.menuItemText}>Fixieren</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                if (contextMenu.type === 'month' && contextMenu.itemId) {
                  handleDeleteMonth(contextMenu.itemId);
                } else if (contextMenu.type === 'expense' && contextMenu.itemId) {
                  handleDeleteExpense(contextMenu.itemId);
                  setContextMenu({ visible: false, type: null, itemId: null });
                }
              }}
            >
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Löschen</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setContextMenu({ visible: false, type: null, itemId: null })}
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
              keyboardType={
                editModal.type === 'cashValue' || editModal.type === 'amount'
                  ? 'numeric'
                  : 'default'
              }
              autoFocus
              placeholderTextColor={colors.darkGray}
            />
            <Pressable style={styles.saveButton} onPress={saveEdit}>
              <Text style={styles.saveButtonText}>Speichern</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Premium Paywall Modal */}
      <PremiumPaywallModal
        visible={premiumModalVisible}
        onClose={handlePremiumClose}
        onPurchase={handlePremiumPurchase}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const pillWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  
  // NEW: Robust Cash Balance Card Design
  cashBalanceCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 24,
    padding: 28,
    marginTop: 16,
    minHeight: 200,
  },
  cashBalanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
  },
  cashBalanceLeft: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 12,
    paddingRight: 16,
  },
  cashBalanceTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cashBalanceSubInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cashBalanceSubLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.8,
  },
  cashBalanceSubValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cashBalanceRight: {
    alignSelf: 'flex-end',
    marginBottom: 0,
    marginRight: 0,
  },
  cashBalanceMainValue: {
    color: colors.white,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'right',
  },
  
  monthRow: {
    marginTop: 24,
    marginHorizontal: -16,
  },
  monthRowContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  addMonthButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMonthText: {
    color: colors.neonGreen,
    fontSize: 28,
    fontWeight: '800',
  },
  monthPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthPillSelected: {
    backgroundColor: colors.darkGray,
  },
  monthPillText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  monthPillTextSelected: {
    color: colors.white,
  },
  pinnedBorder: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  deleteIcon: {
    padding: 4,
  },
  deleteX: {
    color: colors.red,
    fontSize: 18,
    fontWeight: '800',
  },
  expensesGrid: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  expenseContainer: {
    width: pillWidth,
  },
  expensePill: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 16,
    height: pillWidth,
    justifyContent: 'space-between',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1,
  },
  expenseAmount: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'right',
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
