
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Expense {
  id: string;
  category: string;
  amount: number;
}

export default function BudgetScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'JHZFJH', amount: 0 },
    { id: '2', category: 'KEJNEND', amount: 0 },
    { id: '3', category: 'ESSEN', amount: 250 },
    { id: '4', category: 'MIETE', amount: 2005 },
    { id: '5', category: 'PARKPLATZ', amount: 150 },
    { id: '6', category: 'KLEIDER', amount: 120 },
  ]);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>('3');

  const cashBalance = 93838;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = cashBalance - totalExpenses;

  const handleExpensePress = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedExpenseId(id);
  };

  const handleDeleteExpense = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Ausgabe löschen',
      'Möchtest du diese Ausgabe wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setExpenses(expenses.filter(exp => exp.id !== id));
            if (selectedExpenseId === id) {
              setSelectedExpenseId('');
            }
          },
        },
      ]
    );
  };

  const handleAddExpense = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: Backend Integration - Open modal to add new expense
    Alert.alert('Neue Ausgabe', 'Ausgabe hinzufügen (wird implementiert)');
  };

  const ExpensePill = ({ expense }: { expense: Expense }) => {
    const scale = useSharedValue(1);
    const isSelected = selectedExpenseId === expense.id;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        style={[
          styles.expensePill,
          isSelected && styles.expensePillSelected,
          animatedStyle,
        ]}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => handleExpensePress(expense.id)}
      >
        <View style={styles.expensePillContent}>
          <Text style={styles.expenseCategory}>{expense.category}</Text>
          <Text style={styles.expenseAmount}>{expense.amount}</Text>
        </View>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteExpense(expense.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </Pressable>
      </AnimatedPressable>
    );
  };

  const AddButton = () => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        style={[styles.addButton, animatedStyle]}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handleAddExpense}
      >
        <Text style={styles.addButtonText}>+</Text>
      </AnimatedPressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cash Card */}
        <View style={styles.cashCard}>
          <Text style={styles.cashLabel}>CASH</Text>
          <Text style={styles.cashValue}>{cashBalance.toLocaleString('de-CH')}</Text>
        </View>

        {/* Total/Bleibt Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{totalExpenses.toLocaleString('de-CH')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>BLEIBT</Text>
            <Text style={styles.remainingValue}>{remaining.toLocaleString('de-CH')}</Text>
          </View>
        </View>

        {/* Expense Pills */}
        <View style={styles.expenseGrid}>
          <AddButton />
          {expenses.map((expense) => (
            <ExpensePill key={expense.id} expense={expense} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  cashCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cashLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  cashValue: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  totalCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  remainingValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.neonGreen,
    letterSpacing: 0.5,
  },
  expenseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.black,
  },
  expensePill: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.darkGray,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
  },
  expensePillSelected: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  expensePillContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  expenseCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.red,
  },
});
