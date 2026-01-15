
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
import React, { useState, useCallback, useEffect } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '@/contexts/StorageContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { PremiumPaywallModal } from '@/components/PremiumPaywallModal';
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

export default function BudgetScreen() {
  const { isPremium, checkLimit } = usePremium();
  const storage = useStorage();
  const { t } = useLanguage();
  
  const [months, setMonths] = useState<Month[]>(storage.months);
  const [selectedMonthId, setSelectedMonthId] = useState(storage.selectedMonthId);
  const [cashLabel, setCashLabel] = useState(storage.cashLabel);

  // Auto-save to storage whenever data changes
  useEffect(() => {
    storage.setMonths(months);
  }, [months]);

  useEffect(() => {
    storage.setSelectedMonthId(selectedMonthId);
  }, [selectedMonthId]);

  useEffect(() => {
    storage.setCashLabel(cashLabel);
  }, [cashLabel]);

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

  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'expense' | 'month'; id?: string } | null>(null);

  // New state for month name input when creating
  const [newMonthNameModalVisible, setNewMonthNameModalVisible] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');

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
    
    // Open modal to ask for month name first
    console.log('[Budget] Opening new month name modal');
    setNewMonthName('');
    setNewMonthNameModalVisible(true);
  };

  const saveNewMonth = () => {
    if (!newMonthName.trim()) {
      Alert.alert(t.common.error, t.budget.errorMonthName || 'Bitte gib einen Monatsnamen ein');
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newMonth: Month = {
      id: Date.now().toString(),
      name: newMonthName.toUpperCase(),
      isPinned: false,
      cash: 0,
      expenses: [],
    };
    
    console.log('[Budget] Creating new month:', newMonth);
    setMonths([...months, newMonth]);
    setNewMonthNameModalVisible(false);
    setNewMonthName('');
  };

  // Function to add expense from the tab bar modal
  const addExpenseFromModal = useCallback((name: string, amount: number) => {
    if (!selectedMonth) {
      console.log('No selected month');
      return;
    }

    // Check premium limit
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses.length, 0);
    if (checkLimit(totalExpenses + 1, months.length, 0)) {
      setPendingAction({ type: 'expense' });
      setPremiumModalVisible(true);
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: name,
      amount: amount,
      isPinned: false,
    };

    console.log('Adding expense:', newExpense);

    setMonths((prevMonths) =>
      prevMonths.map((m) =>
        m.id === selectedMonthId
          ? { ...m, expenses: [...m.expenses, newExpense] }
          : m
      )
    );

    // Haptic feedback
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [selectedMonth, selectedMonthId, months, checkLimit]);

  // Expose add function globally for tab bar
  React.useEffect(() => {
    (global as any).addExpenseFromModal = addExpenseFromModal;
    return () => {
      delete (global as any).addExpenseFromModal;
    };
  }, [addExpenseFromModal]);

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
      // Check premium limit BEFORE duplicating
      const totalExpenses = months.reduce((sum, m) => sum + m.expenses.length, 0);
      if (checkLimit(totalExpenses, months.length + 1, 0)) {
        setPendingAction({ type: 'month' });
        setPremiumModalVisible(true);
        setContextMenu({ visible: false, type: null, itemId: null });
        return;
      }
      
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
      // Check premium limit BEFORE duplicating
      const totalExpenses = months.reduce((sum, m) => sum + m.expenses.length, 0);
      if (checkLimit(totalExpenses + 1, months.length, 0)) {
        setPendingAction({ type: 'expense' });
        setPremiumModalVisible(true);
        setContextMenu({ visible: false, type: null, itemId: null });
        return;
      }
      
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
      const newMonths = months.map((m) =>
        m.id === selectedMonthId
          ? { ...m, cash: parseFloat(value.replace(/'/g, '')) || 0 }
          : m
      );
      setMonths(newMonths);
    } else if (type === 'name' && itemId) {
      if (contextMenu.type === 'month') {
        // Update month name and save
        const newMonths = months.map((m) => (m.id === itemId ? { ...m, name: value.toUpperCase() } : m));
        console.log('[Budget] Updating month name:', { itemId, newName: value.toUpperCase() });
        setMonths(newMonths);
      } else {
        const newMonths = months.map((m) =>
          m.id === selectedMonthId
            ? {
                ...m,
                expenses: m.expenses.map((e) =>
                  e.id === itemId ? { ...e, name: value.toUpperCase() } : e
                ),
              }
            : m
        );
        setMonths(newMonths);
      }
    } else if (type === 'amount' && itemId) {
      const newMonths = months.map((m) =>
        m.id === selectedMonthId
          ? {
              ...m,
              expenses: m.expenses.map((e) =>
                e.id === itemId ? { ...e, amount: parseFloat(value.replace(/'/g, '')) || 0 } : e
              ),
            }
          : m
      );
      setMonths(newMonths);
    }

    setEditModal({ visible: false, type: null, value: '', itemId: null });
    setContextMenu({ visible: false, type: null, itemId: null });
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  const handlePremiumPurchase = async (type: 'onetime' | 'monthly') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    console.log(`[Budget] Initiating premium purchase: ${type}`);
    
    try {
      // Import API utilities
      const { authenticatedPost, BACKEND_URL } = await import('@/utils/api');
      
      if (!BACKEND_URL) {
        console.warn('[Budget] Backend URL not configured');
        Alert.alert(t.common.error, 'Backend nicht konfiguriert. Bitte App neu starten.');
        return;
      }

      console.log(`[Budget] Calling premium purchase endpoint`);

      // Call backend to purchase premium
      const response = await authenticatedPost<{
        success: boolean;
        isPremium: boolean;
        expiresAt?: string;
        message?: string;
      }>('/api/premium/purchase', {
        type,
      });

      console.log('[Budget] Premium purchase response:', response);

      if (response.success) {
        Alert.alert(t.common.success, 'Premium wurde aktiviert!');
        setPremiumModalVisible(false);
        setPendingAction(null);
        
        // Refresh premium status
        window.location.reload();
      } else {
        Alert.alert(t.common.error, response.message || 'Zahlung fehlgeschlagen');
      }
    } catch (error: any) {
      console.error('[Budget] Premium purchase error:', error);
      
      // Check if it's a 404 (endpoint doesn't exist yet)
      if (error.message?.includes('404')) {
        Alert.alert(
          'In Entwicklung',
          'Premium-Zahlungen werden bald verfügbar sein. Die Backend-Integration ist noch in Arbeit.'
        );
      } else {
        Alert.alert(t.common.error, 'Zahlung fehlgeschlagen. Bitte versuche es später erneut.');
      }
    }
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

  // Get the pin status of the selected item
  const getItemPinStatus = () => {
    const { type, itemId } = contextMenu;
    if (type === 'month' && itemId) {
      const month = months.find((m) => m.id === itemId);
      return month?.isPinned || false;
    } else if (type === 'expense' && itemId) {
      const expense = selectedMonth?.expenses.find((e) => e.id === itemId);
      return expense?.isPinned || false;
    }
    return false;
  };

  const TopPill = ({ label, value, editable, color, onPressLabel, onPressValue }: any) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={[styles.topPill, animatedStyle]}>
        <Pressable
          onPress={() => {
            if (editable && onPressLabel) {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              scale.value = withSpring(0.95, {}, () => {
                scale.value = withSpring(1);
              });
              onPressLabel();
            }
          }}
        >
          <Text style={styles.topPillLabel}>{label}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (editable && onPressValue) {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              scale.value = withSpring(0.95, {}, () => {
                scale.value = withSpring(1);
              });
              onPressValue();
            }
          }}
        >
          <Text style={[styles.topPillValue, color && { color }]}>
            {typeof value === 'number' ? formatNumber(value) : value}
          </Text>
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
        {/* Top Pills */}
        <View style={styles.topSection}>
          <TopPill
            label={cashLabel}
            value={selectedMonth?.cash || 0}
            editable
            onPressLabel={() =>
              openEditModal('cashLabel', null, cashLabel)
            }
            onPressValue={() =>
              openEditModal('cashValue', null, selectedMonth?.cash.toString() || '0')
            }
          />
          <View style={styles.topPillDouble}>
            <View style={styles.topPillRow}>
              <Text style={styles.topPillLabel}>TOTAL</Text>
              <Text style={styles.topPillValue}>{formatNumber(totalExpenses)}</Text>
            </View>
            <View style={styles.topPillRow}>
              <Text style={styles.topPillLabel}>BLEIBT</Text>
              <Text style={[styles.topPillValue, { color: remaining >= 0 ? colors.neonGreen : colors.red }]}>
                {remaining >= 0 ? formatNumber(remaining) : `-${formatNumber(Math.abs(remaining))}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Month Row with Sticky Add Button */}
        <View style={styles.monthRowContainer}>
          {/* Sticky Add Month Button with rounded cross */}
          <Pressable 
            onPress={handleAddMonth} 
            style={styles.addMonthButton}
            onPressIn={() => {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View style={styles.plusIconContainer}>
              <View style={styles.plusVertical} />
              <View style={styles.plusHorizontal} />
            </View>
          </Pressable>

          {/* Scrollable Month Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthScrollView}
            contentContainerStyle={styles.monthScrollContent}
          >
            {sortedMonths.map((month) => (
              <MonthPill key={month.id} month={month} />
            ))}
          </ScrollView>
        </View>

        {/* Expenses Grid */}
        <View style={styles.expensesGrid}>
          {sortedExpenses.map((expense) => (
            <ExpensePill key={expense.id} expense={expense} />
          ))}
        </View>
      </ScrollView>

      {/* New Month Name Modal */}
      <Modal
        visible={newMonthNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNewMonthNameModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNewMonthNameModalVisible(false)}
        >
          <Pressable style={styles.editModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t.budget.newMonth || 'Neuer Monat'}</Text>
            <TextInput
              style={styles.editInput}
              value={newMonthName}
              onChangeText={setNewMonthName}
              placeholder={t.budget.monthNamePlaceholder || 'Monatsname (z.B. JANUAR)'}
              autoFocus
              placeholderTextColor={colors.darkGray}
            />
            <Pressable style={styles.saveButton} onPress={saveNewMonth}>
              <Text style={styles.saveButtonText}>{t.budget.save}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
              <Text style={styles.menuItemText}>{t.budget.edit}</Text>
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
                <Text style={styles.menuItemText}>{t.budget.editAmount}</Text>
              </Pressable>
            )}

            <Pressable style={styles.menuItem} onPress={handleDuplicate}>
              <Text style={styles.menuItemText}>{t.budget.duplicate}</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={handlePinToggle}>
              <Text style={styles.menuItemText}>
                {getItemPinStatus() ? t.budget.unpin : t.budget.pin}
              </Text>
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
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>{t.budget.delete}</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setContextMenu({ visible: false, type: null, itemId: null })}
            >
              <Text style={styles.menuItemText}>{t.budget.cancel}</Text>
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
              placeholder={
                editModal.type === 'name' 
                  ? t.budget.namePlaceholder 
                  : editModal.type === 'amount' || editModal.type === 'cashValue'
                  ? t.budget.amountPlaceholder
                  : ''
              }
              autoFocus
              placeholderTextColor={colors.darkGray}
            />
            <Pressable style={styles.saveButton} onPress={saveEdit}>
              <Text style={styles.saveButtonText}>{t.budget.save}</Text>
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
  topSection: {
    marginTop: 16,
    gap: 12,
  },
  topPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topPillDouble: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  topPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topPillLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  topPillValue: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  monthRowContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  addMonthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plusIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusVertical: {
    position: 'absolute',
    width: 3,
    height: 20,
    backgroundColor: colors.black,
    borderRadius: 2,
  },
  plusHorizontal: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: colors.black,
    borderRadius: 2,
  },
  monthScrollView: {
    flex: 1,
  },
  monthScrollContent: {
    paddingRight: 16,
    gap: 12,
    alignItems: 'center',
  },
  monthPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  monthPillSelected: {
    backgroundColor: colors.neonGreen,
  },
  monthPillText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  monthPillTextSelected: {
    color: colors.black,
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
    fontSize: 16,
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
    fontSize: 26,
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
  modalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
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
